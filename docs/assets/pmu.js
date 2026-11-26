/* Pense Mais Uma: pergunta do dia, votação e feedback.
   Enquanto o Supabase não estiver ligado, tudo fica guardado só no aparelho (fila local). */
(function(){
'use strict';
var CONFIG={supabaseUrl:'',supabaseKey:'',inicio:'2026-11-23'};
var ROOT=document.body.getAttribute('data-root')||'';
var POL='cursos/politica-sem-misterio/index.html', ISR='cursos/israel-e-palestina/index.html';

function ls(k,v){try{if(v===undefined){return JSON.parse(localStorage.getItem(k)||'null');}localStorage.setItem(k,JSON.stringify(v));}catch(e){return null;}}
function send(table,row){
  row.criado_em=new Date().toISOString();row.pagina=location.pathname;
  if(CONFIG.supabaseUrl&&CONFIG.supabaseKey){
    return fetch(CONFIG.supabaseUrl+'/rest/v1/'+table,{method:'POST',headers:{'apikey':CONFIG.supabaseKey,'Authorization':'Bearer '+CONFIG.supabaseKey,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(row)}).catch(function(){queue(table,row);});
  }
  queue(table,row);return Promise.resolve();
}
function queue(table,row){var q=ls('pmu.fila')||[];q.push({t:table,r:row});ls('pmu.fila',q.slice(-200));}
function el(id){return document.getElementById(id);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ---------- Pergunta do dia ---------- */
var BANCO=window.PMU_PERGUNTAS||[];
function dayIndex(){var a=new Date(CONFIG.inicio+'T00:00:00'),b=new Date();b.setHours(0,0,0,0);return Math.max(0,Math.round((b-a)/864e5));}
function hoje(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function streak(){var s=ls('pmu.seq')||{n:0,last:''};return s;}
function bumpStreak(){var s=streak(),t=hoje();if(s.last===t)return s;var y=new Date();y.setDate(y.getDate()-1);var ys=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();s.n=(s.last===ys)?s.n+1:1;s.last=t;ls('pmu.seq',s);return s;}
function renderDQ(){
  var box=el('dq');if(!box)return;
  if(!BANCO.length)return;var di=dayIndex(),n=di+1,P=BANCO[di%BANCO.length],done=ls('pmu.dq.'+n),s=streak();
  var chip=s.n>0?'<span class="chip">🔥 '+s.n+(s.n===1?' dia':' dias seguidos')+'</span>':'';
  var h='<div class="dqh"><span class="eyebrow">Pergunta do dia #'+n+'</span>'+chip+'</div><h2>'+esc(P.q)+'</h2><div class="ops">';
  P.o.forEach(function(o,i){var cls='';if(done!==null&&done!==undefined){if(i===P.c)cls='ok';else if(i===done)cls='no';}
    h+='<button type="button" data-i="'+i+'" class="'+cls+'"'+(done!=null?' disabled':'')+'>'+esc(o)+'</button>';});
  h+='</div>';
  if(done!=null){var ok=done===P.c;
    h+='<div class="dqr"><div class="v '+(ok?'ok':'no')+'">'+(ok?'VOCÊ ACERTOU':'PENSE MAIS UMA')+'</div><p>'+esc(P.e)+(P.s?' <span class="fsrc">🔎 '+esc(P.s)+'</span>':'')+'</p>'+
    '<a class="cta" href="'+ROOT+P.l+'"><small>QUER ENTENDER MELHOR?</small><b>'+esc(P.f)+'</b></a>'+
    '<div class="note">Volte amanhã para a pergunta #'+(n+1)+'.</div></div>';}
  box.innerHTML=h;
  Array.prototype.forEach.call(box.querySelectorAll('.ops button'),function(b){b.onclick=function(){var i=+b.getAttribute('data-i');ls('pmu.dq.'+n,i);bumpStreak();send('respostas_dia',{pergunta:n,opcao:i,acertou:i===P.c});renderDQ();};});
}

/* ---------- Votação ---------- */
function initVote(){
  var f=el('vote');if(!f)return;
  var prev=ls('pmu.voto');
  var btn=f.querySelector('button');
  if(prev){f.querySelector('.msg').innerHTML='<div class="ok-msg">✓ Voto salvo neste navegador: '+esc(prev)+'</div>';btn.disabled=true;
    Array.prototype.forEach.call(f.querySelectorAll('input'),function(i){i.disabled=true;if(i.value===prev)i.checked=true;});return;}
  f.onsubmit=function(ev){ev.preventDefault();var c=f.querySelector('input:checked');if(!c)return;ls('pmu.voto',c.value);send('votos_tema',{tema:c.value});initVote();};
}

/* ---------- Feedback do curso ---------- */
function initFB(){
  var f=el('fb');if(!f)return;
  var curso=f.getAttribute('data-curso'),st={nota:0,lado:''};
  if(ls('pmu.fb.'+curso)){f.innerHTML='<div class="ok-msg">✓ Obrigado! Sua avaliação deste curso já foi salva neste navegador.</div>';return;}
  Array.prototype.forEach.call(f.querySelectorAll('.stars button'),function(b,i){b.onclick=function(){st.nota=i+1;Array.prototype.forEach.call(f.querySelectorAll('.stars button'),function(x,j){x.classList.toggle('on',j<=i);});chk();};});
  Array.prototype.forEach.call(f.querySelectorAll('.seg button'),function(b){b.onclick=function(){st.lado=b.getAttribute('data-v');Array.prototype.forEach.call(f.querySelectorAll('.seg button'),function(x){x.classList.toggle('on',x===b);});el('ladoqual').style.display=st.lado==='sim'?'block':'none';chk();};});
  var sb=f.querySelector('button[type=submit]');function chk(){sb.disabled=!(st.nota&&st.lado);}chk();
  f.onsubmit=function(ev){ev.preventDefault();if(sb.disabled)return;
    var row={curso:curso,nota:st.nota,aprendeu:f.aprendeu.value.slice(0,600),favoreceu:st.lado,qual_lado:(f.qual?f.qual.value:'').slice(0,200),comentario:f.comentario.value.slice(0,1000),tema_sugerido:f.tema.value.slice(0,200)};
    send('feedback_curso',row);ls('pmu.fb.'+curso,1);
    f.innerHTML='<div class="ok-msg">✓ Obrigado! Sua avaliação foi salva neste navegador.</div><p class="hint">Você pode voltar ao catálogo para escolher outra pergunta.</p>';};
}
function openHash(){var h=decodeURIComponent(location.hash.slice(1));if(!h)return;var d=document.getElementById(h);if(d&&d.tagName==='DETAILS'){d.open=true;setTimeout(function(){d.scrollIntoView({block:'start'});},50);}}
window.addEventListener('hashchange',openHash);
renderDQ();initVote();initFB();openHash();
})();

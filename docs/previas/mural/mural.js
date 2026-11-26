const rail=document.querySelector('.track');
const previous=document.querySelector('#antes');
const next=document.querySelector('#depois');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('.controls').hidden=false;
function step(dir){
  const pitch=rail.children[1].offsetLeft-rail.children[0].offsetLeft;
  const target=Math.round(rail.scrollLeft/pitch)+dir;
  rail.scrollTo({left:target*pitch,behavior:reduced.matches?'instant':'smooth'});
}
function checkArrows(){
  previous.disabled=rail.scrollLeft<2;
  next.disabled=rail.scrollWidth-rail.clientWidth-rail.scrollLeft<3;
}
rail.addEventListener('scroll',checkArrows,{passive:true});
new ResizeObserver(checkArrows).observe(rail);
previous.onclick=()=>step(-1);
next.onclick=()=>step(1);
rail.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1)}
});
let drag=null,skipClick=false;
rail.addEventListener('pointerdown',e=>{
  skipClick=false;
  if(e.pointerType==='mouse'&&e.button===0)drag={x:e.clientX,left:rail.scrollLeft};
});
rail.addEventListener('pointermove',e=>{
  if(!drag||!e.buttons)return;
  const dx=e.clientX-drag.x;
  if(!rail.classList.contains('dragging')){
    if(Math.abs(dx)<7)return;
    rail.setPointerCapture(e.pointerId);
    rail.classList.add('dragging');skipClick=true;
  }
  rail.scrollLeft=drag.left-dx;
});
function finish(){drag=null;rail.classList.remove('dragging')}
window.addEventListener('pointerup',finish);
rail.addEventListener('pointercancel',finish);
rail.addEventListener('click',e=>{if(skipClick){e.preventDefault();skipClick=false}},true);
rail.addEventListener('dragstart',e=>e.preventDefault());
const query=document.querySelector('#busca'), buttons=[...document.querySelectorAll('[data-filtro]')],sheets=[...document.querySelectorAll('.grid .sheet')];
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let active='Todos';
document.querySelector('.filters').hidden=false;
function filter(){
  const words=norm(query.value.trim()).split(/\s+/);
  let count=0;
  for(const item of sheets){
    item.hidden=(active!=='Todos'&&active!==item.dataset.grupo)||!words.every(w=>norm(item.dataset.busca).includes(w));
    if(!item.hidden)count++;
  }
  document.querySelector('.count').textContent=count===0?'Nenhum curso encontrado. Experimente outro assunto ou selecione Todos.':count+(count===1?' curso':' cursos');
}
for(const b of buttons)b.onclick=()=>{active=b.dataset.filtro;buttons.forEach(t=>t.setAttribute('aria-pressed',String(t===b)));filter()};
query.oninput=filter;
checkArrows();

const faixa = document.getElementById('curso-em-audio');
const chave = 'pmu-audio-tarifa-zero-v1';
let ultimoTrecho = -1;

function guardarPosicao() {
  if (!Number.isFinite(faixa.duration)) return;
  try {
    if (faixa.ended || faixa.currentTime >= faixa.duration - 1 || faixa.currentTime < 1) {
      localStorage.removeItem(chave);
    } else {
      localStorage.setItem(chave, String(faixa.currentTime));
    }
  } catch {}
}

function retomarPosicao() {
  try {
    const posicao = Number(localStorage.getItem(chave));
    if (posicao >= 1 && posicao < faixa.duration - 1 && faixa.currentTime < 1) {
      faixa.currentTime = posicao;
    }
  } catch {}
}

if (faixa.readyState >= 1) retomarPosicao();
else faixa.addEventListener('loadedmetadata', retomarPosicao, {once:true});

faixa.addEventListener('timeupdate', () => {
  const trecho = Math.floor(faixa.currentTime / 5);
  if (trecho !== ultimoTrecho) {
    ultimoTrecho = trecho;
    guardarPosicao();
  }
});
for (const evento of ['pause','ended','seeked']) faixa.addEventListener(evento, guardarPosicao);
window.addEventListener('pagehide', guardarPosicao);

faixa.addEventListener('play', () => {
  if ('mediaSession' in navigator && 'MediaMetadata' in window) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Ônibus de graça: quem paga a passagem?',
      artist: 'Pense Mais Uma',
      artwork: [{src:'../../assets/compartilhar/tarifa-zero.jpg',type:'image/jpeg'}]
    });
  }
});

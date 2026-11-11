// Instalar a app no ecrã principal.
// Android (Chrome, Edge, Samsung Internet): o navegador permite um botão "Instalar".
// iPhone e iPad: a Apple não permite esse botão, por isso mostramos os passos.

import { icon } from './icons.js';
import { ler, guardar } from './store.js';

let pedido = null; // evento beforeinstallprompt guardado para usar no botão
let instalada = false;

const ua = navigator.userAgent;
const ehIOS = () => /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const ehAndroid = () => /Android/.test(ua);

export function emModoApp() {
  return ['standalone', 'fullscreen', 'minimal-ui'].some((m) => matchMedia(`(display-mode: ${m})`).matches)
    || navigator.standalone === true;
}

// No telemóvel oferecemos sempre (com botão ou com o guia).
// No computador, só quando o navegador permite mesmo instalar.
function podeOferecer() {
  if (emModoApp() || instalada) return false;
  return Boolean(pedido) || ehIOS() || ehAndroid() || matchMedia('(pointer: coarse)').matches;
}

// Mostra ou esconde tudo o que tem data-install.
export function atualizar() {
  const mostrar = podeOferecer();
  const dispensado = ler('instalar-dispensado', false);
  document.querySelectorAll('[data-install]').forEach((el) => {
    el.hidden = !mostrar || (el.hasAttribute('data-card') && dispensado);
  });
}

export function dispensar() {
  guardar('instalar-dispensado', true);
  atualizar();
}

export async function instalar() {
  if (pedido) {
    const p = pedido;
    pedido = null;
    p.prompt();
    try { await p.userChoice; } catch { /* ignorar */ }
    atualizar();
    return;
  }
  abrirGuia();
}

const tecla = (nomeIcone, texto) => `<span class="k">${icon(nomeIcone)}${texto}</span>`;

function abrirGuia() {
  const dialogo = document.getElementById('install-sheet');
  let descricao;
  let passos;
  if (ehIOS()) {
    descricao = 'No iPhone e no iPad, a app instala-se a partir do navegador:';
    passos = [
      `Toque em ${tecla('share', 'Partilhar')} na barra do navegador. Se não o vir, toque primeiro em ${tecla('dots-h', 'Mais')}.`,
      `Deslize a lista e escolha ${tecla('plus-square', 'Adicionar ao ecrã principal.')}`,
      'Toque em <b>Adicionar</b>. O ícone aparece no ecrã principal.',
    ];
  } else if (ehAndroid()) {
    descricao = 'No seu navegador:';
    passos = [
      `Toque no menu ${tecla('dots', '')} no canto do ecrã.`,
      'Escolha <b>Instalar app</b> ou <b>Adicionar ao ecrã principal</b>.',
      'Confirme. O ícone aparece junto das outras apps.',
    ];
  } else {
    descricao = 'No computador:';
    passos = [
      `No Chrome ou no Edge, clique em ${tecla('download', 'Instalar')} na barra de endereço.`,
      'Confirme em <b>Instalar</b>.',
      'Também pode abrir este site no telemóvel e instalar a app lá.',
    ];
  }
  document.getElementById('sheet-desc').textContent = descricao;
  document.getElementById('sheet-steps').innerHTML = passos.map((p) => `<li><span>${p}</span></li>`).join('');
  if (!dialogo.open) dialogo.showModal();
}

export function fecharGuia() {
  const dialogo = document.getElementById('install-sheet');
  if (dialogo.open) dialogo.close();
}

export function iniciarInstalacao() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // usamos o nosso botão em vez do aviso do navegador
    pedido = e;
    atualizar();
  });
  window.addEventListener('appinstalled', () => {
    pedido = null;
    instalada = true;
    fecharGuia();
    atualizar();
  });

  // Fechar o guia ao tocar fora dele.
  const dialogo = document.getElementById('install-sheet');
  dialogo.addEventListener('click', (e) => {
    if (e.target !== dialogo) return;
    const r = dialogo.getBoundingClientRect();
    const dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!dentro) dialogo.close();
  });
}

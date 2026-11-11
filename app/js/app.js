// Arranque da app: navegação, menu lateral, cor da barra do sistema e modo offline.

import { resolver } from './screens.js';
import { iniciarInstalacao, atualizar as atualizarInstalacao, instalar, dispensar, fecharGuia } from './install.js';

const $ = (seletor) => document.querySelector(seletor);
const view = $('#view');
const menu = $('#menu');
const botaoMenu = $('#btn-menu');
const barra = $('.bar');
const metaTema = $('meta[name="theme-color"]');
const computador = matchMedia('(min-width: 900px)');

const AZUL_NOITE = '#0A2F5C';
const NOME = 'Proteção Civil Caranguejeira';

let temaPagina = '#0B57A4';
let jaNavegou = false;

function definirTema(cor) {
  metaTema.setAttribute('content', cor);
}

/* ---------- Navegação (#/kit, #/agir/sismo, ...) ---------- */

function rotaAtual() {
  const caminho = location.hash.replace(/^#\/?/, '').split('?')[0];
  const [nome = '', sub = ''] = caminho.split('/');
  return { nome, sub: decodeURIComponent(sub) };
}

function mostrar() {
  let { nome, sub } = rotaAtual();
  let ecra = resolver(nome, sub);
  if (!ecra) {
    history.replaceState(null, '', `${location.pathname}${location.search}#/`);
    nome = '';
    ecra = resolver('', '');
  }

  view.innerHTML = ecra.html;
  document.title = ecra.title ? `${ecra.title} · ${NOME}` : NOME;
  temaPagina = ecra.theme;
  if (!menuAberto()) definirTema(temaPagina);

  menu.querySelectorAll('a.n').forEach((a) => {
    const alvo = a.getAttribute('href').replace(/^#\/?/, '').split('/')[0];
    if (alvo === nome) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  atualizarInstalacao();
  window.scrollTo(0, 0);
  if (jaNavegou) view.focus({ preventScroll: true });
  jaNavegou = true;
}

/* ---------- Menu lateral ---------- */

const menuAberto = () => document.body.classList.contains('menu-open');

// "Fechar" aparece exatamente onde estava "Menu". Um duplo toque abria e fechava logo
// o menu, por isso ignoramos o toque contrário durante um instante.
const PAUSA_TOQUE = 400;
let ultimaMudanca = -Infinity;
const toqueRepetido = () => performance.now() - ultimaMudanca < PAUSA_TOQUE;

function sincronizarMenu() {
  const aberto = menuAberto();
  const sobreposto = !computador.matches; // no computador o menu está sempre visível
  menu.inert = sobreposto && !aberto;
  view.inert = sobreposto && aberto;
  barra.inert = sobreposto && aberto;
  botaoMenu.setAttribute('aria-expanded', String(aberto));
}

function abrirMenu() {
  if (computador.matches || menuAberto()) return;
  ultimaMudanca = performance.now();
  document.body.classList.add('menu-open');
  sincronizarMenu();
  definirTema(AZUL_NOITE);
  (menu.querySelector('[aria-current="page"]') || menu.querySelector('a.n')).focus();
}

function fecharMenu({ focar = true } = {}) {
  if (!menuAberto()) return;
  ultimaMudanca = performance.now();
  document.body.classList.remove('menu-open');
  sincronizarMenu();
  definirTema(temaPagina);
  if (focar) botaoMenu.focus();
}

computador.addEventListener('change', () => {
  document.body.classList.remove('menu-open');
  sincronizarMenu();
  definirTema(temaPagina);
});

/* ---------- Toques e teclado ---------- */

document.addEventListener('click', (e) => {
  const alvo = e.target.closest('[data-action]');
  if (alvo) {
    switch (alvo.dataset.action) {
      case 'open-menu': if (!toqueRepetido()) abrirMenu(); break;
      case 'close-menu': if (!toqueRepetido()) fecharMenu(); break;
      case 'install': fecharMenu({ focar: false }); instalar(); break;
      case 'dismiss-install': dispensar(); break;
      case 'close-sheet': fecharGuia(); break;
      default: break;
    }
    return;
  }
  if (e.target.closest('#menu a') && menuAberto()) fecharMenu({ focar: false });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuAberto()) fecharMenu();
});

/* ---------- Sem rede ---------- */

function atualizarRede() {
  document.documentElement.classList.toggle('offline', !navigator.onLine);
}
window.addEventListener('online', atualizarRede);
window.addEventListener('offline', atualizarRede);

/* ---------- Funcionar sem internet (service worker) ---------- */

const origemSegura = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator && origemSegura) {
  navigator.serviceWorker.register('./sw.js').catch(() => { /* a app funciona na mesma */ });
}

/* ---------- Arranque ---------- */

iniciarInstalacao();
atualizarRede();
sincronizarMenu();
window.addEventListener('hashchange', mostrar);
mostrar();

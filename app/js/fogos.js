// Fogos: ocorrências ativas no distrito de Leiria, a partir do Fogos.pt.
// A app não fala com o Fogos.pt (a chave da API não pode estar numa app pública):
// o GitHub vai buscar os dados de 10 em 10 minutos e publica app/dados/fogos.json.
// A última cópia fica no telemóvel para se ver sem rede.
// Termos do Fogos.pt: "Fonte: Fogos.pt" com ligação, e não usar como fonte única.

import { ler, guardar } from './store.js';
import { esc } from './conteudo.js';
import { icon } from './icons.js';
import { quando } from './ipma.js';
import { criarMapa } from './mapa.js';

const URL_DADOS = 'dados/fogos.json';
export const SITE_FOGOS = 'https://fogos.pt/';
const PERTO_KM = 10;
// Estados do Fogos.pt até "Em resolução" (7) contam como ativos; 8 em diante é conclusão,
// vigilância ou encerrada.
const ativo = (o) => o.codigo > 0 && o.codigo <= 7;

let pedido = null;
let ultimaTentativa = 0;

export const fogosGuardados = () => ler('fogos', null);

// Pede o ficheiro publicado. Devolve true se os dados mudaram.
export function atualizarFogos() {
  if (pedido) return pedido;
  if (Date.now() - ultimaTentativa < 60 * 1000) return Promise.resolve(false);
  ultimaTentativa = Date.now();
  pedido = fetch(URL_DADOS, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !Array.isArray(d.ocorrencias)) return false;
      const antes = fogosGuardados();
      guardar('fogos', d);
      return !antes || antes.obtido !== d.obtido;
    })
    .catch(() => false)
    .finally(() => { pedido = null; });
  return pedido;
}

const titulo = (o) => {
  const n = String(o.natureza || '').trim();
  if (!n) return o.incendio ? 'Incêndio' : 'Ocorrência';
  return o.incendio && /^(agr|mato|povo|flor|urb|habit|indus|ser|consol)/i.test(n) ? `Incêndio ${n.toLowerCase()}` : n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
};
const km = (v) => `${String(v).replace('.', ',')} km`;
const meios = (o) => [
  `${o.operacionais} ${o.operacionais === 1 ? 'operacional' : 'operacionais'}`,
  `${o.terrestres} ${o.terrestres === 1 ? 'veículo' : 'veículos'}`,
  o.aereos ? `${o.aereos} ${o.aereos === 1 ? 'meio aéreo' : 'meios aéreos'}` : '',
].filter(Boolean).join(' · ');

// Para o início: incêndio ativo perto de Caranguejeira, se houver.
export function fogoPerto() {
  const d = fogosGuardados();
  if (!d) return null;
  return (d.ocorrencias || []).find((o) => o.incendio && ativo(o) && o.km <= PERTO_KM) || null;
}

export function avisoFogoPerto() {
  const o = fogoPerto();
  if (!o) return '';
  return `
    <a class="fogo-perto" href="#/fogos">
      <span class="fogo-perto-ic" aria-hidden="true">${icon('fire')}</span>
      <span class="fogo-perto-txt"><b>${esc(titulo(o))} a ${km(o.km)}</b><span>${esc(o.local || o.freguesia)} · ${esc(o.estado)}. Siga as indicações das autoridades.</span></span>
      ${icon('chev', 'i chev')}
    </a>`;
}

function linha(o, agora) {
  return `
    <li class="fogo" id="fogo-${esc(o.id)}">
      <p class="fogo-estado"><span class="fogo-cor" style="--cor:${esc(o.cor)}" aria-hidden="true"></span>${esc(o.estado)}</p>
      <p class="fogo-t">${esc(titulo(o))}</p>
      <p class="fogo-l">${esc(o.local)}${o.concelho ? ` · ${esc(o.concelho)}` : ''}</p>
      <p class="fogo-q">${o.inicio ? `Início ${quando(o.inicio, agora)} · ` : ''}a ${km(o.km)} de Caranguejeira</p>
      <p class="fogo-m">${meios(o)}</p>
      <a class="fogo-v" href="${SITE_FOGOS}fogo/${encodeURIComponent(o.id)}" target="_blank" rel="noopener">Ver no Fogos.pt${icon('external')}</a>
    </li>`;
}

export function corpoFogos() {
  const d = fogosGuardados();
  const agora = Date.now();
  const obtido = d?.obtido ? Date.parse(d.obtido) : null;
  const lista = d?.ocorrencias || [];
  const perto = lista.filter((o) => o.km <= PERTO_KM);
  const resto = lista.filter((o) => o.km > PERTO_KM);
  const grupo = (id, nome, itens) => (itens.length ? `
    <section class="guia-sec" aria-labelledby="fg-${id}">
      <h2 class="sh" id="fg-${id}">${nome}</h2>
      <ul class="fogos">${itens.map((o) => linha(o, agora)).join('')}</ul>
    </section>` : '');

  let corpo;
  if (!d) {
    corpo = `<div class="soon"><h2 class="soon-k">A obter os dados…</h2><p class="soon-t">Se demorar, veja as ocorrências em <a href="${SITE_FOGOS}" target="_blank" rel="noopener">fogos.pt</a>.</p></div>`;
  } else if (!d.ok) {
    corpo = `<div class="soon"><h2 class="soon-k">Sem dados de momento</h2><p class="soon-t">Não foi possível obter as ocorrências. Veja em <a href="${SITE_FOGOS}" target="_blank" rel="noopener">fogos.pt</a>.</p></div>`;
  } else if (!lista.length) {
    corpo = `<div class="soon"><h2 class="soon-k">Sem ocorrências no distrito de Leiria</h2><p class="soon-t">Em todo o país há ${d.total} ${d.total === 1 ? 'ocorrência ativa' : 'ocorrências ativas'}.</p></div>`;
  } else {
    corpo = grupo('perto', `Perto de Caranguejeira (até ${PERTO_KM} km)`, perto) + grupo('resto', 'No resto do distrito', resto)
      + `<p class="nota">Em todo o país: ${d.total} ${d.total === 1 ? 'ocorrência ativa' : 'ocorrências ativas'}.</p>`;
  }

  return `
    <div data-fogos>
      <p class="intro">Ocorrências ativas no distrito de Leiria, com a informação da Proteção Civil publicada pelo Fogos.pt.</p>
      <p class="obtido"><span class="vivo${d?.ok ? '' : ' vivo-off'}" aria-hidden="true"></span>${obtido ? `Atualizado ${quando(obtido, agora)} · de 10 em 10 minutos` : 'A consultar…'}</p>
      ${lista.length ? `
      <div class="mapa mapa-fogos" data-mapa>
        <div class="mapa-mosaicos" data-mosaicos></div>
        <div class="mapa-marcas" data-marcas></div>
        <div class="mapa-ctl">
          <button type="button" data-zoom="1" aria-label="Aproximar">${icon('mais')}</button>
          <button type="button" data-zoom="-1" aria-label="Afastar">${icon('menos')}</button>
        </div>
        <p class="mapa-off">Sem internet, o mapa não aparece. A lista continua aqui.</p>
        <a class="mapa-atr" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>
      </div>` : ''}
      ${corpo}
      <a class="next" href="#/agir/incendio-rural">O que fazer num incêndio rural${icon('arrow')}</a>
      <p class="meta">Fonte: <a href="${SITE_FOGOS}" target="_blank" rel="noopener">Fogos.pt</a>, com dados da Autoridade Nacional de Emergência e Proteção Civil. Os dados podem ter alguns minutos de atraso e não substituem as indicações das autoridades. Se vir fumo ou fogo, ligue 112.</p>
    </div>`;
}

export function montarFogos(raiz) {
  atualizarFogos().then((mudou) => { if (mudou) window.dispatchEvent(new CustomEvent('pcc:dados')); });
  const zona = raiz.querySelector('[data-fogos]');
  const mapaEl = zona?.querySelector('[data-mapa]');
  if (!mapaEl) return;
  const lista = fogosGuardados()?.ocorrencias || [];
  const mapa = criarMapa(mapaEl);
  // O distrito todo à vista, com Caranguejeira no meio.
  mapa.centrar(39.70, -8.80, 9);
  mapa.pinos([
    { lat: 39.7438, lon: -8.7084, classe: 'pino-casa', html: '<span>Caranguejeira</span>' },
    ...lista.map((o) => ({
      lat: o.lat, lon: o.lon, classe: `pino-fogo${ativo(o) ? '' : ' fim'}`,
      html: `<span style="--cor:${esc(o.cor)}">${icon('fire')}</span>`,
      rotulo: `${titulo(o)}, ${o.local}, ${o.estado}`,
      acao: () => {
        const el = zona.querySelector(`#fogo-${CSS.escape(o.id)}`);
        if (!el) return;
        el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        el.classList.remove('foco'); void el.offsetWidth; el.classList.add('foco');
      },
    })),
  ]);
  zona.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => mapa.zoom(Number(b.dataset.zoom))));
}

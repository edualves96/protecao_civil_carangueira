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

// Nome da ocorrência em português corrente: "Mato" -> "Incêndio em mato".
const NATUREZAS = [
  [/^agr/i, 'Incêndio agrícola'],
  [/^mato/i, 'Incêndio em mato'],
  [/^povoamento/i, 'Incêndio em povoamento florestal'],
  [/^flor/i, 'Incêndio florestal'],
  [/^(urb|habit)/i, 'Incêndio urbano'],
  [/^indus/i, 'Incêndio industrial'],
];
const titulo = (o) => {
  const n = String(o.natureza || '').trim();
  if (!n) return o.incendio ? 'Incêndio' : 'Ocorrência';
  if (o.incendio) {
    const certo = NATUREZAS.find(([re]) => re.test(n));
    if (certo) return certo[1];
  }
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
};
const km = (v) => `${String(v).replace('.', ',')} km`;
const meios = (o) => [
  `${o.operacionais} ${o.operacionais === 1 ? 'operacional' : 'operacionais'}`,
  `${o.terrestres} ${o.terrestres === 1 ? 'veículo' : 'veículos'}`,
  o.aereos ? `${o.aereos} ${o.aereos === 1 ? 'meio aéreo' : 'meios aéreos'}` : '',
].filter(Boolean).join(' · ');

// Estado dos fogos para o início. Só um incêndio ativo a menos de 10 km, com dados da
// última hora, chega ao topo (vermelho). Os incêndios noutros pontos do distrito ficam
// numa linha neutra (`linha`), como a dos avisos do tempo. Dados com mais de uma hora
// nunca se mostram como atuais: diz-se de quando são e porquê (sem rede ou atraso do Fogos.pt).
const AZUL = '#0B57A4';
const RECENTE = 60 * 60 * 1000;

// "Sem rede" é diferente de "o Fogos.pt não atualiza": no primeiro caso o problema é do telemóvel.
export function porqueAntigo(obtido, agora = Date.now()) {
  return navigator.onLine
    ? `O Fogos.pt não atualiza desde ${quando(obtido, agora)}`
    : `Sem rede. Os últimos dados são de ${quando(obtido, agora)}`;
}

export function estadoFogos(agora = Date.now()) {
  const d = fogosGuardados();
  const obtido = d?.obtido ? Date.parse(d.obtido) : null;
  const recente = Boolean(obtido && agora - obtido <= RECENTE);
  const base = { obtido, recente, maisHref: '#/fogos', icone: 'fire', fonte: 'fogos' };
  if (!d) {
    return { ...base, id: 'pendente', theme: AZUL, big: 'A consultar os fogos', desc: 'A obter os incêndios ativos no distrito de Leiria.', linha: 'A consultar…' };
  }
  // `curto`: a frase do topo compacto do início (sem incêndio perto, o topo fica pequeno).
  if (!d.ok) {
    return {
      ...base, id: 'pendente', theme: AZUL, big: 'Sem dados dos fogos',
      desc: 'Não foi possível obter as ocorrências de momento.',
      curto: 'Não foi possível obter as ocorrências.',
      act: { href: SITE_FOGOS, txt: 'Abrir o Fogos.pt', ext: true },
      linha: 'Sem dados de momento',
    };
  }
  const incendios = (d.ocorrencias || []).filter((o) => o.incendio && ativo(o));
  const perto = incendios.filter((o) => o.km <= PERTO_KM);
  if (!recente) {
    // Com dados antigos não sabemos se um incêndio perto ainda está ativo, nem se há outros.
    const antes = perto.length
      ? `. Nessa altura havia ${perto.length === 1 ? 'um incêndio ativo' : `${perto.length} incêndios ativos`} a menos de ${PERTO_KM} km, que pode já não estar ativo.`
      : '.';
    return {
      ...base, id: 'pendente', theme: AZUL, antigo: true, pertoAntigo: perto.length > 0,
      ...(perto.length ? { risco: 'incendio-rural', hl: AZUL } : {}),
      big: perto.length ? 'Incêndio perto, dados antigos' : 'Sem dados recentes dos fogos',
      desc: `${porqueAntigo(obtido, agora)}${antes} Se vir fumo ou fogo, ligue 112.`,
      curto: `${porqueAntigo(obtido, agora)}.`,
      act: { href: SITE_FOGOS, txt: 'Ver no Fogos.pt', ext: true },
      linha: perto.length
        ? `${quando(obtido, agora).replace(/^./, (c) => c.toUpperCase())} havia um incêndio a ${km(perto[0].km)} · pode já não estar ativo`
        : `Dados de ${quando(obtido, agora)} · podem já não estar certos`,
    };
  }
  if (perto.length) {
    const o = perto[0];
    return {
      ...base, id: 'vermelho', theme: '#C62828', hl: '#A31F1F', risco: 'incendio-rural',
      nivel: perto.length > 1 ? `${perto.length} incêndios ativos perto` : 'Incêndio ativo perto',
      big: `${esc(titulo(o))} a ${km(o.km)}`,
      desc: `${esc(o.local || o.freguesia)} · ${esc(o.estado)}. ${meios(o)}. Siga as indicações das autoridades.`,
      act: { href: '#/agir/incendio-rural', txt: 'O que fazer num incêndio rural' },
      mais: 'Ver no mapa dos fogos',
      linha: `${esc(titulo(o))} a ${km(o.km)}`,
    };
  }
  if (incendios.length) {
    const o = incendios[0];
    return {
      ...base, id: 'distrito',
      linha: `Nenhum perto. ${incendios.length} no distrito, o mais próximo a ${km(o.km)} (${esc(o.local || o.concelho)})`,
    };
  }
  return { ...base, id: 'verde', linha: 'Sem incêndios ativos no distrito de Leiria' };
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
  const recente = Boolean(obtido && agora - obtido <= RECENTE);
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
    corpo = `<div class="soon"><h2 class="soon-k">Sem ocorrências no distrito de Leiria${recente ? '' : ` (dados de ${quando(obtido, agora)})`}</h2><p class="soon-t">Em todo o país há ${d.total} ${d.total === 1 ? 'ocorrência ativa' : 'ocorrências ativas'}.</p></div>`;
  } else {
    corpo = grupo('perto', `Até ${PERTO_KM} km de Caranguejeira`, perto) + grupo('resto', 'No resto do distrito', resto)
      + `<p class="nota">Em todo o país: ${d.total} ${d.total === 1 ? 'ocorrência ativa' : 'ocorrências ativas'}.</p>`;
  }

  return `
    <div data-fogos>
      <p class="intro">Ocorrências ativas no distrito de Leiria, com a informação da Proteção Civil publicada pelo Fogos.pt.</p>
      <p class="obtido"><span class="vivo${d?.ok && recente ? '' : ' vivo-off'}" aria-hidden="true"></span>${obtido ? `Atualizado ${quando(obtido, agora)} · de 10 em 10 minutos` : 'A consultar…'}</p>
      ${obtido && !recente ? `
      <p class="antigo" role="note">${icon('alert')}<span><b>Estes dados podem já não estar certos.</b> ${porqueAntigo(obtido, agora)}. Uma ocorrência pode já ter acabado, ou haver outras. Veja em <a href="${SITE_FOGOS}" target="_blank" rel="noopener">fogos.pt</a>.</span></p>` : ''}
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

// Previsão do tempo (IPMA, Leiria): a temperatura de hoje no início e, na página dos avisos,
// um cartão por dia. Cada cartão tem uma régua das horas: ao deslizar a nuvem, mostra a
// temperatura, o tempo e a chuva dessa hora, e o fundo do cartão muda com o tempo
// (sol, nuvens, chuva, trovoada, nevoeiro, neve; de noite, lua e estrelas).

import { icon, NUVEM } from './icons.js';
import {
  previsao as fontePrevisao, horas as fonteHoras, previsaoDias, previsaoHoje, horasDoDia, graus, textoObtido,
} from './ipma.js';

const grausDitos = (t) => (t === null ? 'sem valor' : `${Math.round(t)} graus`);
const pct = (v) => `${Math.round(v)}%`;
// Nome da cena (classe do cartão) a partir do ícone do tempo.
const cenaDe = (icone) => ({ snow: 'neve', lua: 'sol', luanuvem: 'solnuvem' }[icone] || icone);

/* ---------- Início: temperatura de hoje ---------- */

export function tempoHoje() {
  const d = previsaoHoje(fontePrevisao.guardado());
  if (!d) return '';
  const chuva = d.chuva !== null ? `, probabilidade de chuva de ${pct(d.chuva)}` : '';
  const rotulo = `Hoje em Leiria: ${d.texto.toLowerCase()}, máxima de ${grausDitos(d.max)}, mínima de ${grausDitos(d.min)}${chuva}. Ver a previsão dos próximos dias.`;
  return `
    <a class="hoje" href="#/avisos/previsao" aria-label="${rotulo}">
      ${icon(d.icone, 'i hoje-ic')}
      <span class="hoje-t" aria-hidden="true">
        <b>${graus(d.max)}</b>
        <span>mín. ${graus(d.min)}</span>
        ${d.chuva !== null ? `<span class="hoje-chuva">${icon('gota')}${pct(d.chuva)}</span>` : ''}
      </span>
    </a>`;
}

/* ---------- Página dos avisos: um cartão por dia ---------- */

// O desenho de fundo do cartão. Todas as peças estão lá; a classe do cartão diz quais se veem.
const CENA = `
  <svg class="cena" viewBox="0 0 160 100" preserveAspectRatio="xMaxYMin meet" aria-hidden="true" focusable="false">
    <g class="c-estrelas"><circle cx="34" cy="16" r="1.2"/><circle cx="56" cy="34" r="1"/><circle cx="82" cy="9" r="1.4"/><circle cx="96" cy="44" r="1"/><circle cx="150" cy="60" r="1.2"/><circle cx="70" cy="56" r=".9"/></g>
    <g class="c-sol"><circle cx="124" cy="30" r="13"/><path d="M124 9v5M124 46v5M103 30h5M140 30h5M109.2 15.2l3.5 3.5M135.3 41.3l3.5 3.5M109.2 44.8l3.5-3.5M135.3 18.7l3.5-3.5"/></g>
    <path class="c-lua" d="M135 38.5a13 13 0 1 1-13.5-21.3 10.4 10.4 0 0 0 13.5 21.3z"/>
    <path class="c-nuvem c-nuvem-2" d="${NUVEM}" transform="translate(62 8) scale(1.7)"/>
    <path class="c-nuvem c-nuvem-1" d="${NUVEM}" transform="translate(96 22) scale(2.5)"/>
    <g class="c-chuva"><path class="gotas-a" d="M108 74l-2.5 7M120 74l-2.5 7M132 74l-2.5 7M144 74l-2.5 7"/><path class="gotas-b" d="M114 85l-2.5 7M126 85l-2.5 7M138 85l-2.5 7"/></g>
    <path class="c-raio" d="M128 67l-8 13h6l-3 12 11-16h-6l3-9z"/>
    <g class="c-neve"><circle cx="108" cy="78" r="1.8"/><circle cx="122" cy="88" r="1.8"/><circle cx="136" cy="76" r="1.8"/><circle cx="146" cy="90" r="1.8"/><circle cx="114" cy="95" r="1.8"/></g>
    <g class="c-nevoeiro"><rect x="64" y="52" width="96" height="5" rx="2.5"/><rect x="82" y="64" width="78" height="5" rx="2.5"/><rect x="58" y="76" width="102" height="5" rx="2.5"/></g>
  </svg>`;

// Posição (0 a 1) de cada hora na régua e a curva das temperaturas.
function curva(lista) {
  const temps = lista.map((h) => h.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const y = (t) => 4 + (1 - (t - min) / (max - min || 1)) * 22;
  const x = (i) => (lista.length > 1 ? (i / (lista.length - 1)) * 100 : 50);
  return { y, x, pontos: lista.map((h, i) => `${x(i).toFixed(2)},${y(h.temp).toFixed(2)}`).join(' ') };
}

// Hora a mostrar primeiro: hoje, a hora atual; nos outros dias, o meio-dia.
function horaInicial(lista, agora) {
  const hoje = lista.some((h) => h.ms <= agora) && lista.some((h) => h.ms > agora - 3600e3);
  if (hoje) {
    const i = lista.findIndex((h) => h.ms > agora - 30 * 60e3);
    return i < 0 ? lista.length - 1 : i;
  }
  const i = lista.findIndex((h) => h.h >= 12);
  return i < 0 ? Math.floor(lista.length / 2) : i;
}

function regua(d, lista, agora) {
  if (lista.length < 2) return '';
  const c = curva(lista);
  const marcas = [6, 12, 18]
    .map((hh) => lista.findIndex((h) => h.h === hh))
    .filter((i) => i >= 0)
    .map((i) => `<span style="left:${c.x(i)}%">${lista[i].h}h</span>`).join('');
  return `
    <div class="horas" data-horas="${d.data}">
      <p class="horas-bolha" aria-hidden="true" data-bolha></p>
      <div class="horas-faixa">
        <svg class="horas-curva" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline points="${c.pontos}"/></svg>
        <span class="horas-ponto" aria-hidden="true" data-ponto></span>
      </div>
      <input class="horas-r" type="range" min="0" max="${lista.length - 1}" step="1" value="${horaInicial(lista, agora)}" aria-label="Hora do dia, ${d.nome.toLowerCase()}">
      <div class="horas-eixo" aria-hidden="true">${marcas}</div>
    </div>`;
}

function cartao(d, horasDados, agora) {
  const lista = horasDoDia(horasDados, d.data);
  const extra = [d.chuva !== null ? `Chuva ${pct(d.chuva)}` : '', d.vento].filter(Boolean);
  // O cartão já nasce com o fundo da hora que a régua mostra primeiro (sem mudar ao abrir).
  const h = lista.length > 1 ? lista[horaInicial(lista, agora)] : null;
  const classe = h ? `cena-${cenaDe(h.icone)}${h.noite ? ' noite' : ''}` : `cena-${cenaDe(d.icone)}`;
  return `
    <li class="dia ${classe}">
      ${CENA}
      <div class="dia-topo">
        <h3 class="dia-n">${d.nome}</h3>
        <p class="dia-tipo">${d.texto}</p>
        <p class="dia-temp"><span class="vh">Máxima </span><b>${graus(d.max)}</b> <span><span class="vh">, mínima </span><span aria-hidden="true">mín. </span>${graus(d.min)}</span></p>
        ${extra.length ? `<p class="dia-extra">${d.chuva !== null ? icon('gota') : ''}${extra.join(' · ')}</p>` : ''}
      </div>
      ${regua(d, lista, agora)}
    </li>`;
}

export function corpoPrevisao(agora = Date.now()) {
  const dias = previsaoDias(fontePrevisao.guardado(), agora);
  const horasDados = fonteHoras.guardado();
  const corpo = dias.length
    ? `<p class="nota">Deslize a nuvem para ver cada hora.</p>
       <ul class="dias">${dias.map((d) => cartao(d, horasDados, agora)).join('')}</ul>
       <p class="obtido">${textoObtido(fontePrevisao)}</p>`
    : `<p class="nota">${fontePrevisao.falhou() ? 'Sem ligação ao IPMA. A previsão aparece quando houver internet e fica guardada para ver sem rede.' : 'A obter a previsão do IPMA…'}</p>`;
  return `
    <section class="guia-sec" aria-labelledby="prev-t">
      <h2 class="sh" id="prev-t">Previsão do tempo</h2>
      <p class="nota">Para Leiria, a localidade do IPMA mais perto de Caranguejeira.</p>
      ${corpo}
    </section>`;
}

export function montarPrevisao(raiz) {
  const horasDados = fonteHoras.guardado();
  raiz.querySelectorAll('[data-horas]').forEach((zona) => {
    const lista = horasDoDia(horasDados, zona.dataset.horas);
    if (lista.length < 2) return;
    const cartaoEl = zona.closest('.dia');
    const r = zona.querySelector('input');
    const bolha = zona.querySelector('[data-bolha]');
    const ponto = zona.querySelector('[data-ponto]');
    const faixa = zona.querySelector('.horas-faixa');
    const c = curva(lista);

    const mostrar = () => {
      const i = Number(r.value);
      const h = lista[i];
      const chuva = h.chuva !== null ? `<span class="bolha-chuva">${icon('gota')}${pct(h.chuva)}</span>` : '';
      bolha.innerHTML = `${icon(h.icone)}<b>${graus(h.temp)}</b><span>${h.hora}</span>${chuva}`;
      // A bolha segue a nuvem, sem sair do cartão.
      const largura = zona.clientWidth;
      const centro = (c.x(i) / 100) * (largura - 34) + 17;
      const meia = bolha.offsetWidth / 2;
      bolha.style.left = `${Math.min(largura - meia, Math.max(meia, centro))}px`;
      bolha.style.setProperty('--seta', `${centro - Math.min(largura - meia, Math.max(meia, centro))}px`);
      ponto.style.left = `${c.x(i)}%`;
      ponto.style.top = `${(c.y(h.temp) / 30) * faixa.clientHeight}px`;
      cartaoEl.className = `dia cena-${cenaDe(h.icone)}${h.noite ? ' noite' : ''}`;
      r.setAttribute('aria-valuetext', `${h.hora}: ${grausDitos(h.temp)}, ${h.texto.toLowerCase()}${h.chuva !== null ? `, ${pct(h.chuva)} de probabilidade de chuva` : ''}`);
    };
    r.addEventListener('input', mostrar);
    new ResizeObserver(mostrar).observe(zona);
    mostrar();
  });
}

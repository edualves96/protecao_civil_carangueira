// Conteúdo de cada ecrã. Cada função devolve { title, theme, html } e, se o ecrã
// precisar de reagir a toques, montar(raiz), chamado depois de o HTML aparecer.

import { icon } from './icons.js';
import { ler } from './store.js';
import { GUIAS_VISUAIS, FONTE_GUIAS, SEGUIR_AUTORIDADES } from './guias.js';
import { figura, montarFiguras } from './figuras.js';
import { CONTACTOS, paraTel } from './contactos.js';
import { corpoKit, montarKit, resumoKit } from './kit.js';

export const VERSAO = '0.2.0';

const AZUL = '#0B57A4';

export const RISCOS = [
  { id: 'sismo', nome: 'Sismo', de: 'de um sismo', icon: 'quake' },
  { id: 'incendio-rural', nome: 'Incêndio rural', de: 'de um incêndio rural', icon: 'fire' },
  { id: 'cheias', nome: 'Cheias e inundações', de: 'de cheias e inundações', icon: 'flood' },
  { id: 'calor', nome: 'Calor extremo', de: 'de um período de calor extremo', icon: 'heat' },
  { id: 'tempestade', nome: 'Tempestade e vento forte', de: 'de uma tempestade', icon: 'wind' },
  { id: 'frio', nome: 'Frio extremo', de: 'de uma vaga de frio', icon: 'snow' },
  { id: 'incendio-casa', nome: 'Incêndio em casa', de: 'de um incêndio em casa', icon: 'home' },
  { id: 'materias-perigosas', nome: 'Acidente com matérias perigosas', de: 'de um acidente com matérias perigosas', icon: 'alert' },
  { id: 'energia', nome: 'Falha prolongada de energia', de: 'de uma falha prolongada de energia', icon: 'bolt' },
];
const PRINCIPAIS = ['sismo', 'incendio-rural', 'cheias', 'calor'];

// Estados do bloco do topo. Até os avisos reais do IPMA chegarem (passo 5),
// a app mostra "Em breve". Os outros estados só aparecem em demonstração (?demo=laranja).
// `nivel` só existe com aviso: aparece por cima do título, com ícone, para não depender só da cor.
const ESTADOS = {
  pendente: {
    big: 'Em breve',
    desc: 'Os avisos do IPMA para o distrito de Leiria vão aparecer aqui. Até lá, consulte o site do IPMA.',
    act: { href: 'https://www.ipma.pt/pt/', txt: 'Abrir o site do IPMA', ext: true },
    theme: AZUL,
  },
  verde: {
    big: 'Sem avisos',
    desc: 'O IPMA não prevê avisos para o distrito de Leiria nos próximos 3 dias.',
    theme: '#2E8540',
  },
  amarelo: {
    nivel: 'Aviso amarelo',
    big: 'Vento forte',
    desc: 'Distrito de Leiria, até amanhã às 12:00. Rajadas até 70 km/h.',
    act: { href: '#/agir/tempestade', txt: 'O que fazer com vento forte' },
    risco: 'tempestade', hl: '#6B5600',
    theme: '#F2C200',
  },
  laranja: {
    nivel: 'Aviso laranja',
    big: 'Tempo quente',
    desc: 'Distrito de Leiria, até quinta às 18:00. Máximas até 41 °C.',
    act: { href: '#/agir/calor', txt: 'O que fazer com calor' },
    risco: 'calor', hl: '#9A5200',
    theme: '#F7941D',
  },
  vermelho: {
    nivel: 'Aviso vermelho',
    big: 'Chuva muito forte',
    desc: 'Distrito de Leiria, até hoje às 23:59. Risco de cheias rápidas.',
    act: { href: '#/agir/cheias', txt: 'O que fazer com cheias' },
    risco: 'cheias', hl: '#A31F1F',
    theme: '#C62828',
  },
};

function estadoAtual() {
  const demo = new URLSearchParams(location.search).get('demo');
  if (demo && demo !== 'pendente' && ESTADOS[demo]) return { ...ESTADOS[demo], id: demo, demo: true };
  return { ...ESTADOS.pendente, id: 'pendente', demo: false };
}

// Preparação da família. O plano e o ponto de encontro chegam no passo 4.
function progresso() {
  const plano = Boolean(ler('plano-feito', false));
  const kitResumo = resumoKit();
  const kit = kitResumo.fracao;
  const encontro = Boolean(ler('encontro-escolhido', false));
  const pct = Math.round(((plano ? 1 : 0) + kit + (encontro ? 1 : 0)) / 3 * 100);
  let next;
  if (kit === 0) next = { href: '#/kit', txt: 'Começar o kit de emergência' };
  else if (!plano) next = { href: '#/plano', txt: 'Fazer o plano da família' };
  else if (!encontro) next = { href: '#/encontro', txt: 'Escolher o ponto de encontro' };
  else if (kit < 1) next = { href: '#/kit', txt: 'Completar o kit de emergência' };
  else next = { href: '#/kit', txt: 'Tudo pronto. Reveja o kit de 6 em 6 meses' };
  return { plano, kit, kitResumo, encontro, pct, next };
}

function linhaRisco(r, destaque = false, hl = '') {
  const estilo = destaque && hl ? ` style="--hl:${hl}"` : '';
  return `<li><a class="row${destaque ? ' hl' : ''}"${estilo} href="#/agir/${r.id}">${icon(r.icon)}${r.nome}${icon('chev', 'i chev')}</a></li>`;
}

function inicio() {
  const e = estadoAtual();
  const p = progresso();

  const acao = e.act
    ? `<a class="act" href="${e.act.href}"${e.act.ext ? ' target="_blank" rel="noopener"' : ''}>${e.act.txt}${icon(e.act.ext ? 'external' : 'arrow')}</a>`
    : '';

  let ids = PRINCIPAIS.slice();
  if (e.risco) ids = [e.risco, ...ids.filter((id) => id !== e.risco)].slice(0, 4);
  const riscos = ids.map((id) => RISCOS.find((r) => r.id === id));

  const resumo = `Preparação: ${p.pct}%. Plano da família: ${p.plano ? 'feito' : 'por fazer'}. `
    + `Kit de emergência: ${p.kitResumo.feitos} de ${p.kitResumo.total} itens. Ponto de encontro: ${p.encontro ? 'escolhido' : 'por escolher'}.`;

  const nivel = e.nivel
    ? `<span class="nivel">${icon('alert')}${e.nivel}<span class="vh">: </span></span>`
    : '';

  const preparacao = `
        <section class="sec" aria-labelledby="prep-t">
          <h2 class="sh" id="prep-t">A sua família está preparada?</h2>
          <div class="prep" role="img" aria-label="${resumo}">
            <p class="pct" aria-hidden="true">${p.pct}%</p>
            <div class="segs" aria-hidden="true">
              <div class="seg">
                <span><i style="width:${p.plano ? 100 : 0}%"></i></span>
                <span><i style="width:${Math.round(p.kit * 100)}%"></i></span>
                <span><i style="width:${p.encontro ? 100 : 0}%"></i></span>
              </div>
              <div class="seglbl"><span>Plano</span><span>Kit ${p.kitResumo.feitos}/${p.kitResumo.total}</span><span>Encontro</span></div>
            </div>
          </div>
          <a class="next" href="${p.next.href}">Próximo passo: ${p.next.txt.charAt(0).toLowerCase() + p.next.txt.slice(1)}${icon('arrow')}</a>
        </section>`;

  const agora = `
        <section class="sec" aria-labelledby="agora-t">
          <h2 class="sh" id="agora-t">Se acontecer agora</h2>
          <ul class="rows">
            ${riscos.map((r, i) => linhaRisco(r, i === 0 && r.id === e.risco, e.hl)).join('')}
            <li><a class="row more" href="#/agir">Todos os riscos${icon('chev', 'i chev')}</a></li>
          </ul>
        </section>`;

  // Com um aviso ativo, o que fazer vem primeiro; sem aviso, a preparação.
  const seccoes = e.risco ? agora + preparacao : preparacao + agora;

  return {
    title: null,
    theme: e.theme,
    html: `
      <section class="status s-${e.id}" aria-labelledby="estado">
        <div class="wrap">
          <div class="top">
            <div><p class="wm-s">PROTEÇÃO CIVIL</p><p class="wm">Caranguejeira</p></div>
            <p class="net">Sem rede</p>
          </div>
          <div class="estado">
            ${e.demo ? '<p class="demo">DEMONSTRAÇÃO · DADOS FICTÍCIOS</p>' : ''}
            <h1 class="big" id="estado">${nivel}${e.big}</h1>
            <p class="desc">${e.desc}</p>
            ${acao}
          </div>
        </div>
      </section>
      <div class="edge" style="--edge:${e.theme}"></div>

      <div class="wrap">
        ${seccoes}

        <div class="install" data-install data-card hidden>
          <div class="install-txt">
            <p class="install-t">Instale a app</p>
            <p class="install-d">Fica no ecrã principal, como as outras apps.</p>
          </div>
          <button class="btn-inst" type="button" data-action="install">Instalar</button>
          <button class="x" type="button" data-action="dismiss-install" aria-label="Agora não">${icon('close')}</button>
        </div>
      </div>`,
  };
}

function pagina({ titulo, corpo, voltar = '#/', voltarTxt = 'Início' }) {
  return `
    <header class="phead">
      <div class="wrap">
        <a class="back" href="${voltar}">${icon('back')}${voltarTxt}</a>
        <h1 class="ptitle">${titulo}</h1>
      </div>
    </header>
    <div class="edge" style="--edge:${AZUL}"></div>
    <div class="wrap pbody">${corpo}</div>`;
}

function emBreve(texto) {
  return `
    <div class="soon">
      <h2 class="soon-k">Em preparação</h2>
      <p class="soon-t">${texto}</p>
    </div>
    <p class="hint">Em caso de emergência, ligue <a href="tel:112">112</a>.</p>`;
}

const SIMPLES = {
  avisos: ['Avisos do tempo', 'Os avisos do IPMA para o distrito de Leiria, sempre atualizados e guardados para consultar sem rede.'],
  sismos: ['Sismos recentes', 'Os sismos registados pelo IPMA na região, num mapa e numa lista.'],
  plano: ['Plano da família', 'Quem vive consigo, contactos importantes, necessidades especiais e o que fazer se estiverem separados.'],
  encontro: ['Pontos de encontro', 'Um mapa com os pontos de encontro da freguesia de Caranguejeira.'],
  simulacro: ['Simulacro', 'Treine a saída de casa em segurança, com um cronómetro e os passos a seguir.'],
  quiz: ['Quiz', 'Perguntas rápidas para testar o que sabe sobre autoproteção.'],
};

function agir() {
  return {
    title: 'O que fazer se…',
    theme: AZUL,
    html: pagina({
      titulo: 'O que fazer se…',
      corpo: `
        <p class="intro">Escolha o risco para ver o que fazer na hora, depois e para estar preparado.</p>
        <ul class="rows">${RISCOS.map((r) => linhaRisco(r)).join('')}</ul>
        <p class="hint">Os guias funcionam sem internet. Em caso de emergência, ligue <a href="tel:112">112</a>.</p>`,
    }),
  };
}

// Os números de telefone que aparecem nos guias passam a ligar com um toque.
const NUMEROS_NOS_GUIAS = ['112', '808 24 24 24', '800 250 250', '800 506 506'];
const NUMEROS_RE = new RegExp(`(?<!\\d)(${NUMEROS_NOS_GUIAS.join('|')})(?!\\d)`, 'g');
const comLigacoes = (texto) => texto.replace(NUMEROS_RE, (n) => `<a href="tel:${paraTel(n)}">${n}</a>`);

const passoTexto = ([destaque, detalhe]) =>
  `<li><b>${comLigacoes(destaque)}</b>${detalhe ? ` ${comLigacoes(detalhe)}` : ''}</li>`;

// Palavras com hífen ("Baixe-se") não se partem ao meio da linha.
const semQuebra = (texto) => texto.replace(/(\p{L}+-\p{L}+)/gu, '<span class="nw">$1</span>');

// Guia visual: passos curtos com figuras animadas; o que não é urgente fica recolhido.
function guiaVisual(g) {
  const passo = (p, i, numerado) => `
    <li class="vis-passo">
      <div class="fig-caixa">
        ${numerado ? `<span class="fig-n" aria-hidden="true">${i + 1}</span>` : ''}
        <button class="fig" type="button" aria-label="Repetir animação"${numerado ? ` style="--atraso:${i * 450}ms"` : ''}>${figura(p.fig)}</button>
      </div>
      <div class="vis-txt">
        <p class="vis-t">${p.q ? `<span class="vis-q">${semQuebra(p.q)}</span> ` : ''}${semQuebra(comLigacoes(p.t))}</p>
        <p class="vis-d">${semQuebra(comLigacoes(p.d))}</p>
      </div>
    </li>`;

  return `
    <div data-guia-visual>
      <section class="guia-sec" aria-labelledby="gv-1">
        <h2 class="sh" id="gv-1">${g.primeiro.titulo}</h2>
        <ol class="vis-passos" role="list">${g.primeiro.passos.map((p, i) => passo(p, i, true)).join('')}</ol>
      </section>
      <section class="guia-sec" aria-labelledby="gv-2">
        <h2 class="sh" id="gv-2">${g.se.titulo}</h2>
        <ul class="vis-passos" role="list">${g.se.passos.map((p, i) => passo(p, i, false)).join('')}</ul>
      </section>
      <div class="mais-grupo">
        ${g.mais.map((s) => `
          <details class="mais">
            <summary>${s.titulo}${icon('chev', 'i chev')}</summary>
            <ul class="passos">${s.passos.map(passoTexto).join('')}</ul>
          </details>`).join('')}
      </div>
    </div>
    <p class="meta">${SEGUIR_AUTORIDADES}<br>${FONTE_GUIAS}</p>`;
}

function guiaRisco(id) {
  const r = RISCOS.find((x) => x.id === id);
  if (!r) return null;
  const base = { title: r.nome, theme: AZUL };
  const cabecalho = { titulo: r.nome, voltar: '#/agir', voltarTxt: 'O que fazer se…' };

  const guia = GUIAS_VISUAIS[id];
  if (guia) return { ...base, html: pagina({ ...cabecalho, corpo: guiaVisual(guia) }), montar: montarFiguras };
  return { ...base, html: pagina({ ...cabecalho, corpo: emBreve(`O que fazer antes, durante e depois ${r.de}.`) }) };
}

function contactos() {
  const linha = (c) => {
    const texto = `
      <span class="ct-t">${c.nome}</span>
      ${c.confirmado && c.num ? `<span class="ct-num">${c.num}</span>` : '<span class="ct-falta">Número por confirmar</span>'}
      <span class="ct-d">${c.desc}</span>`;
    if (!c.confirmado || !c.num) return `<li><div class="ct ct-pend"><span class="ct-txt">${texto}</span></div></li>`;
    const fonte = c.fonte
      ? `<p class="ct-fonte">Confirmado em <a href="${c.fonte.url}" target="_blank" rel="noopener">${c.fonte.nome}</a> a ${c.consultado}</p>`
      : '';
    return `
      <li><a class="ct${c.sos ? ' ct-sos' : ''}" href="tel:${paraTel(c.num)}">
        <span class="ct-txt"><span class="vh">Ligar para </span>${texto}</span>
        <span class="ct-ic">${icon('phone')}</span>
      </a>${fonte}</li>`;
  };

  return {
    title: 'Contactos úteis',
    theme: AZUL,
    html: pagina({
      titulo: 'Contactos úteis',
      corpo: `
        <p class="intro">Perigo imediato? Ligue <a href="tel:112">112</a>. Para dúvidas de saúde que não sejam uma emergência, ligue para o SNS 24. Toque num contacto para ligar.</p>
        <p class="nota">Só aparecem os números confirmados numa fonte oficial. Os contactos sem número ainda estão a ser confirmados.</p>
        ${CONTACTOS.map((g, i) => `
          <section class="guia-sec" aria-labelledby="ct-${i}">
            <h2 class="sh" id="ct-${i}">${g.titulo}</h2>
            ${g.nota ? `<p class="nota">${comLigacoes(g.nota)}</p>` : ''}
            <ul class="cts">${g.itens.map(linha).join('')}</ul>
          </section>`).join('')}`,
    }),
  };
}

function kit() {
  return {
    title: 'Kit de emergência',
    theme: AZUL,
    html: pagina({ titulo: 'Kit de emergência', corpo: corpoKit() }),
    montar: montarKit,
  };
}

function sobre() {
  return {
    title: 'Sobre a app',
    theme: AZUL,
    html: pagina({
      titulo: 'Sobre a app',
      corpo: `
        <div class="prose">
          <p>Esta app ajuda as famílias da freguesia de Caranguejeira a prepararem-se para emergências e a saberem o que fazer quando acontecem.</p>
          <h2>Privacidade</h2>
          <p>Não tem contas, publicidade nem rastreamento. O que guardar na app, como o kit ou o plano da família, fica só neste aparelho.</p>
          <h2>Fontes</h2>
          <p>Os avisos e os sismos vão ser obtidos do IPMA. Os guias "O que fazer se…" seguem as recomendações da Autoridade Nacional de Emergência e Proteção Civil (ANEPC).</p>
          <div data-install hidden>
            <h2>Instalar a app</h2>
            <p>Instale a app para a ter no ecrã principal, como as outras apps.</p>
            <button class="btn btn-primary" type="button" data-action="install">Instalar a app</button>
          </div>
          <p class="meta">Versão ${VERSAO} · em desenvolvimento<br>
          Tipos de letra: Barlow Semi Condensed e Atkinson Hyperlegible (SIL Open Font License).</p>
        </div>`,
    }),
  };
}

// Devolve o ecrã de uma rota, ou null se a rota não existir.
export function resolver(nome, sub) {
  if (!nome) return inicio();
  if (nome === 'agir') return sub ? guiaRisco(sub) : agir();
  if (nome === 'contactos') return contactos();
  if (nome === 'kit') return kit();
  if (nome === 'sobre') return sobre();
  if (SIMPLES[nome]) {
    const [titulo, texto] = SIMPLES[nome];
    return { title: titulo, theme: AZUL, html: pagina({ titulo, corpo: emBreve(texto) }) };
  }
  return null;
}

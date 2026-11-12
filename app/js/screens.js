// Conteúdo de cada ecrã. Cada função devolve { title, theme, html } e, se o ecrã
// precisar de reagir a toques, montar(raiz), chamado depois de o HTML aparecer.

import { icon } from './icons.js';
import { conteudo, esc, paragrafos, paraTel, ligacaoSegura } from './conteudo.js';
import { figura, montarFiguras, NOMES_FIGURAS } from './figuras.js';
import { corpoKit, montarKit, resumoKit, kit as listaKit, mochila as listaMochila } from './kit.js';
import { corpoMochila, montarMochila } from './mochila.js';
import { corpoPlano, montarPlano, resumoPlano } from './plano.js';
import { corpoEncontro, montarEncontro } from './mapa.js';
import {
  avisos as fonteAvisos, sismos as fonteSismos, avisosDoDistrito, periodo, quando, dia, hora, meiaNoite,
  textoObtido, atualizarEcra, classeVivo, RECENTE, SITE_AVISOS, SITE_SISMOS,
} from './ipma.js';

export const VERSAO = '0.6.0';

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

// Estados do bloco do topo, a partir dos avisos do IPMA para o distrito de Leiria.
// Os estados com aviso também se podem ver em demonstração (?demo=laranja).
// `nivel` só existe com aviso: aparece por cima do título, com ícone, para não depender só da cor.
const SITE_IPMA = { href: SITE_AVISOS, txt: 'Abrir os avisos no site do IPMA', ext: true };
const ESTADOS = {
  aguardar: {
    id: 'pendente',
    big: 'A consultar o IPMA',
    desc: 'A obter os avisos para o distrito de Leiria.',
    theme: AZUL,
  },
  semLigacao: {
    id: 'pendente',
    big: 'Sem ligação',
    desc: 'Não foi possível obter os avisos do IPMA. Ligue-se à internet para ver se há avisos para o distrito de Leiria.',
    act: SITE_IPMA,
    theme: AZUL,
  },
  desatualizado: {
    id: 'pendente',
    big: 'Sem dados recentes',
    act: SITE_IPMA,
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

const CORES_AVISO = {
  amarelo: { theme: '#F2C200', hl: '#6B5600' },
  laranja: { theme: '#F7941D', hl: '#9A5200' },
  vermelho: { theme: '#C62828', hl: '#A31F1F' },
};

const DEMOS = ['verde', 'amarelo', 'laranja', 'vermelho'];

function estadoAtual() {
  const demo = new URLSearchParams(location.search).get('demo');
  if (DEMOS.includes(demo)) return { ...ESTADOS[demo], id: demo, demo: true };

  const dados = fonteAvisos.guardado();
  if (!dados) return { ...(fonteAvisos.falhou() ? ESTADOS.semLigacao : ESTADOS.aguardar) };

  const agora = Date.now();
  const todos = avisosDoDistrito(dados, agora);
  const terra = todos.filter((a) => !a.costa);
  const costa = todos.filter((a) => a.costa);

  if (!terra.length) {
    // Sem dados recentes não sabemos se há avisos novos: não mostramos "Sem avisos".
    if (agora - dados.obtido > RECENTE) {
      return {
        ...ESTADOS.desatualizado,
        desc: `Os últimos dados do IPMA são de ${quando(dados.obtido, agora)}. Ligue-se à internet para ver se há avisos.`,
      };
    }
    return {
      ...ESTADOS.verde,
      id: 'verde',
      desc: costa.length
        ? 'Nos próximos 3 dias, o IPMA só prevê aviso de agitação marítima, na costa do distrito de Leiria.'
        : ESTADOS.verde.desc,
      obtido: true,
      mais: costa.length ? (costa.length === 1 ? 'Ver o aviso da costa' : 'Ver os avisos da costa') : '',
    };
  }

  const a = terra[0];
  const outros = todos.length - 1;
  return {
    id: a.nivel.id,
    nivel: a.nivel.nome,
    big: a.nome,
    desc: `Distrito de Leiria, ${periodo(a, agora)}.${a.texto ? ` ${a.texto}` : ''}`,
    act: a.risco ? { href: `#/agir/${a.risco}`, txt: a.guia } : { href: '#/avisos', txt: 'Ver os avisos' },
    risco: a.risco,
    ...CORES_AVISO[a.nivel.id],
    obtido: true,
    mais: outros ? `Mais ${outros} ${outros === 1 ? 'aviso' : 'avisos'}` : '',
  };
}

// Preparação da família: kit, mochila, plano e ponto de encontro (os dois últimos
// chegam no passo 4). Mostrar o que falta em cada um ajuda a voltar e acabar
// (efeito Zeigarnik).
function progresso() {
  const kitResumo = resumoKit();
  const kit = kitResumo.fracao;
  const mochilaResumo = listaMochila.resumo();
  const mochila = mochilaResumo.fracao;
  const { plano: planoResumo, encontro: encontroResumo } = resumoPlano();
  const plano = planoResumo.fracao;
  const encontro = encontroResumo.fracao;
  const pct = Math.round((plano + kit + mochila + encontro) / 4 * 100);
  let next;
  if (kit === 0) next = { href: '#/kit', txt: 'Começar o kit de emergência' };
  else if (mochila === 0) next = { href: '#/mochila', txt: 'Preparar a mochila de emergência' };
  else if (plano === 0) next = { href: '#/plano', txt: 'Fazer o plano da família' };
  else if (encontro < 1) next = { href: '#/encontro', txt: 'Escolher os pontos de encontro' };
  else if (plano < 1) next = { href: '#/plano', txt: 'Acabar o plano da família' };
  else if (kit < 1) next = { href: '#/kit', txt: 'Completar o kit de emergência' };
  else if (mochila < 1) next = { href: '#/mochila', txt: 'Completar a mochila de emergência' };
  else next = { href: '#/kit', txt: 'Tudo pronto. Reveja o kit e a mochila de 6 em 6 meses' };
  return { plano, planoResumo, kit, kitResumo, mochila, mochilaResumo, encontro, encontroResumo, pct, next };
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

  const resumo = `Preparação: ${p.pct}%. Plano da família: ${p.planoResumo.feitas} de ${p.planoResumo.total} partes. `
    + `Kit de emergência: ${p.kitResumo.feitos} de ${p.kitResumo.total} itens. `
    + `Mochila de emergência: ${p.mochilaResumo.feitos} de ${p.mochilaResumo.total} itens. Pontos de encontro: ${p.encontroResumo.feitos} de 2 escolhidos.`;

  const nivel = e.nivel
    ? `<span class="nivel">${icon('alert')}${e.nivel}<span class="vh">: </span></span>`
    : '';

  const mais = e.mais ? `<a class="st-mais" href="#/avisos">${e.mais}${icon('chev', 'i chev')}</a>` : '';
  const obtido = e.obtido
    ? `<p class="st-meta"><span class="${classeVivo(fonteAvisos)}" aria-hidden="true"></span><span data-obtido>${textoObtido(fonteAvisos)}</span> · Fonte: <a href="${SITE_AVISOS}" target="_blank" rel="noopener">IPMA</a></p>`
    : '';

  const preparacao = `
        <section class="sec" aria-labelledby="prep-t">
          <h2 class="sh" id="prep-t">A sua família está preparada?</h2>
          ${avisoValidades()}
          <div class="prep" role="img" aria-label="${resumo}">
            <p class="pct" aria-hidden="true">${p.pct}%</p>
            <div class="segs" aria-hidden="true">
              <div class="seg">
                <span><i style="width:${Math.round(p.kit * 100)}%"></i></span>
                <span><i style="width:${Math.round(p.mochila * 100)}%"></i></span>
                <span><i style="width:${Math.round(p.plano * 100)}%"></i></span>
                <span><i style="width:${Math.round(p.encontro * 100)}%"></i></span>
              </div>
              <div class="seglbl">
                <span>Kit<b>${p.kitResumo.feitos}/${p.kitResumo.total}</b></span>
                <span>Mochila<b>${p.mochilaResumo.feitos}/${p.mochilaResumo.total}</b></span>
                <span>Plano<b>${p.planoResumo.feitas}/${p.planoResumo.total}</b></span>
                <span>Encontro<b>${p.encontroResumo.feitos}/2</b></span>
              </div>
            </div>
          </div>
          <a class="next" href="${p.next.href}">Próximo passo: ${p.next.txt.charAt(0).toLowerCase() + p.next.txt.slice(1)}${icon('arrow')}</a>
          ${entradaMochila()}
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
            ${mais}
            ${obtido}
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
    montar: e.demo ? null : (raiz) => atualizarEcra(raiz, fonteAvisos),
    dinamico: !e.demo,
  };
}

// Formulários de edição no Pages CMS (ver README), um por ficheiro de app/conteudo/.
const EDITOR = 'https://app.pagescms.org/edualves96/protecao_civil_carangueira/ccr-d836c5a6-1m8oud/file/';

// `largo`: em ecrãs grandes a página usa mais largura (para pôr duas colunas lado a lado).
function pagina({ titulo, corpo, voltar = '#/', voltarTxt = 'Início', editar = '', largo = false }) {
  const lapis = editar
    ? `<a class="ed" href="${EDITOR}${editar}" target="_blank" rel="noopener" aria-label="Editar o conteúdo desta página" title="Editar no Pages CMS">${icon('edit')}</a>`
    : '';
  const wrap = largo ? 'wrap wrap-largo' : 'wrap';
  return `
    <header class="phead">
      <div class="${wrap}">
        <a class="back" href="${voltar}">${icon('back')}${voltarTxt}</a>
        ${lapis}
        <h1 class="ptitle">${titulo}</h1>
      </div>
    </header>
    <div class="edge" style="--edge:${AZUL}"></div>
    <div class="${wrap} pbody">${corpo}</div>`;
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
  simulacro: ['Simulacro', 'Treine a saída de casa em segurança, com um cronómetro e os passos a seguir.'],
  quiz: ['Quiz', 'Perguntas rápidas para testar o que sabe sobre autoproteção.'],
};

function agir() {
  const t = conteudo.textos?.agir || {};
  return {
    title: 'O que fazer se…',
    theme: AZUL,
    html: pagina({
      titulo: 'O que fazer se…',
      editar: 'guias',
      corpo: `
        ${t.intro ? `<p class="intro">${texto(t.intro)}</p>` : ''}
        <ul class="rows">${RISCOS.map((r) => linhaRisco(r)).join('')}</ul>
        ${t.nota ? `<p class="hint">${texto(t.nota)}</p>` : ''}`,
    }),
  };
}

// Os números confirmados em "Contactos úteis" (e o 112) ligam com um toque
// sempre que aparecem num texto.
function numerosConfirmados() {
  const numeros = new Set(['112']);
  (conteudo.contactos?.grupos || []).forEach((g) => (g.itens || []).forEach((c) => {
    if (c.confirmado && c.num) numeros.add(String(c.num).trim());
  }));
  return [...numeros].sort((a, b) => b.length - a.length);
}
const escRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function comLigacoes(html) {
  const re = new RegExp(`(?<!\\d)(${numerosConfirmados().map(escRegex).join('|')})(?!\\d)`, 'g');
  return html.replace(re, (n) => `<a href="tel:${paraTel(n)}">${n}</a>`);
}

// Texto editado: escapado e com os números de telefone a ligar.
const texto = (t) => comLigacoes(esc(t));

const passoTexto = (p) =>
  `<li><b>${texto(p.destaque)}</b>${p.detalhe ? ` ${texto(p.detalhe)}` : ''}</li>`;

// Palavras com hífen ("Baixe-se") não se partem ao meio da linha.
const semQuebra = (texto) => texto.replace(/(\p{L}+-\p{L}+)/gu, '<span class="nw">$1</span>');

// Guia visual: passos curtos com figuras animadas; o que não é urgente fica recolhido.
function guiaVisual(g) {
  const linhas = (t) => semQuebra(texto(t));
  const passo = (p, i, numerado) => `
    <li class="vis-passo">
      <div class="fig-caixa">
        ${numerado ? `<span class="fig-n" aria-hidden="true">${i + 1}</span>` : ''}
        <button class="fig" type="button" aria-label="Repetir animação"${numerado ? ` style="--atraso:${i * 450}ms"` : ''}>${figura(p.fig)}</button>
      </div>
      <div class="vis-txt">
        <p class="vis-t">${p.q ? `<span class="vis-q">${linhas(p.q)}</span> ` : ''}${linhas(p.t)}</p>
        ${p.d ? `<p class="vis-d">${linhas(p.d)}</p>` : ''}
      </div>
    </li>`;
  const comTexto = (passos) => (passos || []).filter((p) => p && p.t);
  const primeiro = g.primeiro || {};
  const se = g.se || {};
  const rodape = conteudo.textos?.guias || {};

  return `
    <div data-guia-visual>
      ${comTexto(primeiro.passos).length ? `
      <section class="guia-sec" aria-labelledby="gv-1">
        <h2 class="sh" id="gv-1">${esc(primeiro.titulo)}</h2>
        <ol class="vis-passos" role="list">${comTexto(primeiro.passos).map((p, i) => passo(p, i, true)).join('')}</ol>
      </section>` : ''}
      ${comTexto(se.passos).length ? `
      <section class="guia-sec" aria-labelledby="gv-2">
        <h2 class="sh" id="gv-2">${esc(se.titulo)}</h2>
        <ul class="vis-passos" role="list">${comTexto(se.passos).map((p, i) => passo(p, i, false)).join('')}</ul>
      </section>` : ''}
      <div class="mais-grupo">
        ${(g.mais || []).filter((s) => s && s.titulo).map((s) => `
          <details class="mais">
            <summary>${esc(s.titulo)}${icon('chev', 'i chev')}</summary>
            <ul class="passos">${(s.passos || []).filter((p) => p && p.destaque).map(passoTexto).join('')}</ul>
          </details>`).join('')}
      </div>
    </div>
    <p class="meta">${[rodape.seguir, rodape.fonte].filter(Boolean).map(esc).join('<br>')}</p>`;
}

function guiaRisco(id) {
  const r = RISCOS.find((x) => x.id === id);
  if (!r) return null;
  const base = { title: r.nome, theme: AZUL };
  const cabecalho = { titulo: r.nome, voltar: '#/agir', voltarTxt: 'O que fazer se…', editar: 'guias' };

  const guia = conteudo.guias?.[id];
  if (guia) return { ...base, html: pagina({ ...cabecalho, corpo: guiaVisual(guia) }), montar: montarFiguras };
  return { ...base, html: pagina({ ...cabecalho, corpo: emBreve(`O que fazer antes, durante e depois ${r.de}.`) }) };
}

// Folha de referência das figuras, para quem edita os guias escolher a certa.
// Não aparece no menu: abre-se em upcc.pt/#/figuras.
function figurasEcra() {
  return {
    title: 'Figuras dos guias',
    theme: AZUL,
    html: pagina({
      titulo: 'Figuras dos guias',
      corpo: `
        <p class="intro">Todas as figuras que se podem usar nos passos dos guias, com o nome a escolher na página de edição. Toque numa figura para ver a animação.</p>
        <ul class="figs" data-guia-visual>
          ${NOMES_FIGURAS.map((nome) => `
            <li><button class="fig" type="button" aria-label="Repetir animação">${figura(nome)}</button><code>${nome}</code></li>`).join('')}
        </ul>`,
    }),
    montar: montarFiguras,
  };
}

function contactos() {
  const dados = conteudo.contactos || {};
  const linha = (c) => {
    const ligar = Boolean(c.confirmado && c.num);
    const corpo = `
      <span class="ct-t">${esc(c.nome)}</span>
      ${ligar ? `<span class="ct-num">${esc(c.num)}</span>` : '<span class="ct-falta">Número por confirmar</span>'}
      ${c.desc ? `<span class="ct-d">${esc(c.desc)}</span>` : ''}`;
    if (!ligar) return `<li><div class="ct ct-pend"><span class="ct-txt">${corpo}</span></div></li>`;
    const url = ligacaoSegura(c.fonteUrl);
    const nomeFonte = esc(c.fonte || url);
    const fonte = nomeFonte
      ? `<p class="ct-fonte">Confirmado em ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${nomeFonte}</a>` : nomeFonte}${c.consultado ? ` a ${esc(c.consultado)}` : ''}</p>`
      : '';
    return `
      <li><a class="ct${c.sos ? ' ct-sos' : ''}" href="tel:${paraTel(c.num)}">
        <span class="ct-txt"><span class="vh">Ligar para </span>${corpo}</span>
        <span class="ct-ic">${icon('phone')}</span>
      </a>${fonte}</li>`;
  };

  return {
    title: 'Contactos úteis',
    theme: AZUL,
    html: pagina({
      titulo: 'Contactos úteis',
      editar: 'contactos',
      corpo: `
        ${dados.intro ? `<p class="intro">${texto(dados.intro)}</p>` : ''}
        ${dados.nota ? `<p class="nota">${texto(dados.nota)}</p>` : ''}
        ${(dados.grupos || []).filter((g) => g && g.titulo).map((g, i) => `
          <section class="guia-sec" aria-labelledby="ct-${i}">
            <h2 class="sh" id="ct-${i}">${esc(g.titulo)}</h2>
            ${g.nota ? `<p class="nota">${texto(g.nota)}</p>` : ''}
            <ul class="cts">${(g.itens || []).filter((c) => c && c.nome).map(linha).join('')}</ul>
          </section>`).join('')}`,
    }),
  };
}

// Aviso de prazos no início: só aparece quando algo do kit ou da mochila passou do prazo
// ou acaba este mês ou no próximo. É a primeira coisa da secção de preparação.
function avisoValidades() {
  const todos = [
    ...listaKit.alertas().map((x) => ({ ...x, onde: 'kit', rotulo: 'kit' })),
    ...listaMochila.alertas().map((x) => ({ ...x, onde: 'mochila', rotulo: 'mochila' })),
  ].sort((a, b) => (a.estado === 'expirado' ? 0 : 1) - (b.estado === 'expirado' ? 0 : 1));
  if (!todos.length) return '';
  const exp = todos.filter((x) => x.estado === 'expirado').length;
  const breve = todos.length - exp;
  const n = todos.length;
  let titulo;
  if (exp && breve) titulo = `${exp} fora de prazo e ${breve} a acabar`;
  else if (exp) titulo = `${exp} ${exp === 1 ? 'coisa passou' : 'coisas passaram'} do prazo`;
  else titulo = `${n} ${n === 1 ? 'coisa acaba' : 'coisas acabam'} o prazo em breve`;
  const nomes = todos.slice(0, 3).map((x) => `${esc(x.nome)} (${x.rotulo})`).join(', ');
  const mais = n > 3 ? ` e mais ${n - 3}` : '';
  return `
    <a class="val-aviso${exp ? ' val-aviso-exp' : ''}" href="#/${todos[0].onde}">
      <span class="val-aviso-ic" aria-hidden="true">${icon('alert')}</span>
      <span class="val-aviso-txt"><b>${titulo}</b><span>${nomes}${mais}. Troque antes de precisar.</span></span>
      ${icon('chev', 'i chev')}
    </a>`;
}

// Entrada da mochila no início: a única área destacada da secção de preparação.
// Mostra quanto falta, para lembrar o que ficou a meio.
function entradaMochila() {
  const r = listaMochila.resumo();
  const pronta = r.total > 0 && r.feitos === r.total;
  const estado = pronta
    ? 'Pronta. Deixe-a junto à porta.'
    : r.feitos === 0 ? 'O que levar para 3 a 5 dias fora de casa, e como arrumar.' : 'Continue de onde ficou.';
  const conta = pronta ? `${r.total} de ${r.total} prontos` : `${r.feitos} de ${r.total} prontos · faltam ${r.total - r.feitos}`;
  return `
    <a class="moch-cta${pronta ? ' feito' : ''}" href="#/mochila">
      <span class="moch-cta-ic" aria-hidden="true">${icon('mochila')}</span>
      <span class="moch-cta-txt">
        <span class="moch-cta-t">Kit mochila de emergência</span>
        <span class="moch-cta-d">${estado}</span>
        <span class="moch-cta-conta">${conta}</span>
        <span class="moch-cta-barra" aria-hidden="true"><i style="width:${Math.round(r.fracao * 100)}%"></i></span>
      </span>
      ${icon('chev', 'i chev')}
    </a>`;
}

function mochilaEcra() {
  return {
    title: 'Kit mochila de emergência',
    theme: AZUL,
    html: pagina({ titulo: 'Kit mochila de emergência', corpo: corpoMochila(), editar: 'mochila' }),
    montar: montarMochila,
  };
}

function kit() {
  return {
    title: 'Kit de emergência',
    theme: AZUL,
    html: pagina({ titulo: 'Kit de emergência', corpo: corpoKit(), editar: 'kit' }),
    montar: montarKit,
  };
}

/* ---------- Avisos do tempo ---------- */

const primeiraMaiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function linhaAviso(a, agora) {
  const guia = a.risco ? `<a class="av-g" href="#/agir/${a.risco}">${a.guia}${icon('arrow')}</a>` : '';
  return `
    <li class="av av-${a.nivel.id}" id="av-${a.ref}">
      <p class="av-n"><span class="av-cor" aria-hidden="true"></span>${a.nivel.nome}<span class="vh">:</span></p>
      <p class="av-t">${a.nome}</p>
      <p class="av-q">${primeiraMaiuscula(periodo(a, agora))}</p>
      ${a.texto ? `<p class="av-d">${a.texto}</p>` : ''}
      ${guia}
    </li>`;
}

// Movimento só uma vez por visita: quem volta ao ecrã já conhece o desenho.
const animados = new Set();
const calmo = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function animarUmaVez(chave, el, duracao) {
  if (!el || animados.has(chave)) return;
  animados.add(chave);
  requestAnimationFrame(() => el.classList.add('play'));
  setTimeout(() => el.classList.remove('play'), duracao);
}
function destacar(el, bloco = 'center') {
  el.scrollIntoView({ behavior: calmo() ? 'auto' : 'smooth', block: bloco });
  el.classList.remove('foco');
  void el.getBoundingClientRect();
  el.classList.add('foco');
}

// Os próximos 3 dias numa linha: cada aviso é uma barra da cor do nível, com a hora atual marcada.
// A lista por baixo tem a mesma informação por escrito, por isso a linha é só visual.
function linhaDoTempo(todos, agora) {
  const ini = meiaNoite(agora);
  const fim = meiaNoite(agora, 3);
  const pos = (ms) => Math.min(100, Math.max(0, ((ms - ini) / (fim - ini)) * 100));
  const dias = [0, 1, 2].map((n) => primeiraMaiuscula(dia(meiaNoite(agora, n) + 12 * 36e5, agora)));

  const linhas = [];
  todos.forEach((a) => {
    const nome = a.costa ? `${a.nome} (costa)` : a.nome;
    let linha = linhas.find((l) => l.nome === nome);
    if (!linha) linhas.push(linha = { nome, avisos: [] });
    linha.avisos.push(a);
  });

  const barras = (l) => l.avisos.filter((a) => a.fim > ini && a.ini < fim).map((a) => {
    const x = pos(a.ini);
    const w = Math.max(pos(a.fim) - x, 1.5);
    return `<span class="tl-b tl-${a.nivel.id}" style="--x:${x.toFixed(2)}%;--w:${w.toFixed(2)}%" data-alvo="av-${a.ref}"></span>`;
  }).join('');
  const corpo = linhas.length
    ? linhas.map((l, i) => `
        <div class="tl-linha" style="--i:${i}"><span class="tl-nome">${esc(l.nome)}</span><span class="tl-pista">${barras(l)}</span></div>`).join('')
    : `<div class="tl-linha"><span class="tl-nome">Sem avisos</span><span class="tl-pista"><span class="tl-b tl-livre" style="--x:0%;--w:100%"></span></span></div>`;
  const xAgora = pos(agora);

  return `
    <figure class="tl" aria-hidden="true">
      <div class="tl-dias">${dias.map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="tl-linhas">
        ${corpo}
        <span class="tl-agora${xAgora < 8 ? ' ini' : ''}" style="--x:${xAgora.toFixed(2)}%"><span>Agora</span></span>
      </div>
    </figure>`;
}

function montarAvisos(raiz) {
  atualizarEcra(raiz, fonteAvisos);
  const tl = raiz.querySelector('.tl');
  if (!tl) return;
  animarUmaVez('avisos', tl, 1600);
  tl.addEventListener('click', (e) => {
    const barra = e.target.closest('[data-alvo]');
    const alvo = barra && raiz.querySelector(`#${barra.dataset.alvo}`);
    if (alvo) destacar(alvo);
  });
}

function avisosEcra() {
  const titulo = 'Avisos do tempo';
  const dados = fonteAvisos.guardado();
  const agora = Date.now();
  const todos = avisosDoDistrito(dados, agora).map((a, ref) => ({ ...a, ref }));
  const grupo = (id, nome, lista, nota = '') => (lista.length ? `
    <section class="guia-sec" aria-labelledby="av-${id}">
      <h2 class="sh" id="av-${id}">${nome}</h2>
      ${nota ? `<p class="nota">${nota}</p>` : ''}
      <ul class="avs">${lista.map((a) => linhaAviso(a, agora)).join('')}</ul>
    </section>` : '');

  let corpo;
  if (!dados) {
    corpo = `<div class="soon"><h2 class="soon-k">${fonteAvisos.falhou() ? 'Sem ligação' : 'A consultar o IPMA…'}</h2>
      <p class="soon-t">${fonteAvisos.falhou() ? 'Ligue-se à internet para ver os avisos. Depois disso, ficam guardados para consultar sem rede.' : 'A obter os avisos para o distrito de Leiria.'}</p></div>`;
  } else if (!todos.length && agora - dados.obtido > RECENTE) {
    corpo = `<div class="soon"><h2 class="soon-k">Sem dados recentes</h2>
      <p class="soon-t">Os últimos dados são de ${quando(dados.obtido, agora)}. Ligue-se à internet para ver se há avisos.</p></div>`;
  } else if (!todos.length) {
    corpo = `<div class="soon"><h2 class="soon-k">Sem avisos</h2>
      <p class="soon-t">O IPMA não prevê avisos para o distrito de Leiria nos próximos 3 dias.</p></div>`;
  } else {
    const terra = todos.filter((a) => !a.costa);
    corpo = grupo('agora', 'Em vigor', terra.filter((a) => a.emVigor))
      + grupo('depois', 'Próximos dias', terra.filter((a) => !a.emVigor))
      + grupo('costa', 'Na costa', todos.filter((a) => a.costa), 'Não afeta Caranguejeira. Tenha cuidado se for à praia ou ao mar.');
  }

  return {
    title: titulo,
    theme: AZUL,
    html: pagina({
      titulo,
      corpo: `
        <p class="intro">Avisos do IPMA para o distrito de Leiria nos próximos 3 dias.</p>
        <p class="obtido"><span class="${classeVivo(fonteAvisos)}" aria-hidden="true"></span><span data-obtido>${textoObtido(fonteAvisos)}</span></p>
        ${dados && (todos.length || agora - dados.obtido <= RECENTE) ? linhaDoTempo(todos, agora) : ''}
        ${corpo}
        <p class="meta">Fonte: <a href="${SITE_AVISOS}" target="_blank" rel="noopener">IPMA – Instituto Português do Mar e da Atmosfera</a>. Os avisos são para todo o distrito de Leiria.</p>`,
    }),
    montar: montarAvisos,
    dinamico: true,
  };
}

/* ---------- Sismos recentes ---------- */

const magnitude = (m) => (m === null ? '–' : m.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

// Linha de um sismo. Os que aparecem no diagrama são botões: tocar mostra o ponto.
function linhaSismo(s, agora, noDiagrama = false) {
  const sentido = s.sentido
    ? `<span class="sis-s">Sentido pela população${s.grau ? ` (intensidade ${esc(s.grau)})` : ''}${s.local ? ` · ${esc(s.local)}` : ''}</span>`
    : '';
  const miolo = `
      <span class="sis-m"><b>${magnitude(s.mag)}</b><span>magnitude</span></span>
      <span class="sis-txt">
        <span class="sis-r">${esc(s.regiao) || 'Local por indicar'}</span>
        <span class="sis-q">${primeiraMaiuscula(dia(s.hora, agora))}, ${hora(s.hora)} · a ${s.km} km</span>
        ${sentido}
      </span>`;
  return noDiagrama
    ? `<li><button class="sis-i sis-btn" type="button" id="sis-${s.ref}" data-sis="${s.ref}" aria-pressed="false">${miolo}</button></li>`
    : `<li class="sis-i">${miolo}</li>`;
}

const raioSismo = (m) => (2.4 + Math.max(m ?? 0.6, 0) * 1.8).toFixed(1);

// Diagrama com Caranguejeira ao centro e anéis a 25, 50 e 100 km. Cada sismo fica
// na direção e à distância onde aconteceu; o tamanho do ponto mostra a magnitude.
// Uma unidade do desenho é 1 km.
function diagramaSismos(perto, agora) {
  const pontos = perto.filter((s) => Number.isFinite(s.rumo)).sort((a, b) => a.hora - b.hora);
  const passo = Math.min(110, 1000 / Math.max(pontos.length, 1));
  const SEMANA = 7 * 864e5;
  const maisPerto = perto.slice().sort((a, b) => a.km - b.km)[0];
  const resumo = perto.length
    ? `${perto.length === 1 ? '1 sismo' : `${perto.length} sismos`} a menos de 100 km nos últimos 30 dias. O mais próximo foi ${maisPerto.regiao}, a ${maisPerto.km} km.`
    : 'Nenhum sismo a menos de 100 km nos últimos 30 dias.';
  const posicao = (s) => {
    const a = (s.rumo * Math.PI) / 180;
    return `${(s.km * Math.sin(a)).toFixed(1)} ${(-s.km * Math.cos(a)).toFixed(1)}`;
  };
  const etiqueta = (r) => `<text class="radar-km" x="${(r * 0.7071 + 1.5).toFixed(1)}" y="${(-r * 0.7071 - 1.5).toFixed(1)}">${r} km</text>`;

  return `
    <figure class="radar">
      <svg class="radar-svg" viewBox="-114 -114 228 228" role="img" aria-label="${esc(resumo)}">
        <circle class="radar-fundo" r="100"/>
        <path class="radar-eixo" d="M0 -100V100M-100 0H100"/>
        ${[100, 50, 25].map((r, i) => `<circle class="radar-anel" r="${r}" style="--i:${i}"/>`).join('')}
        <circle class="radar-ref" cx="-8.6" cy="-0.1" r="1.8"/>
        ${pontos.map((s, i) => `
        <g class="radar-p${agora - s.hora < SEMANA ? ' recente' : ''}" data-sis="${s.ref}" transform="translate(${posicao(s)})" style="--d:${Math.round(700 + i * passo)}ms">
          <circle class="radar-onda" r="${raioSismo(s.mag)}"/>
          <circle class="radar-ponto" r="${raioSismo(s.mag)}"/>
          <circle class="radar-toque" r="10"/>
        </g>`).join('')}
        <circle class="radar-centro" r="3"/>
        <g class="radar-textos">
          ${[25, 50, 100].map(etiqueta).join('')}
          <text class="radar-n" x="0" y="-104">N</text>
          <text class="radar-lbl radar-lbl-ref" x="-12" y="3" text-anchor="end">Leiria</text>
          <text class="radar-lbl" x="5" y="-5">Caranguejeira</text>
        </g>
      </svg>
      <figcaption class="radar-leg">
        <svg class="radar-escala" viewBox="0 -1 104 32" aria-hidden="true">
          ${[1, 2, 3, 4].map((m, i) => `<circle class="radar-ponto" cx="${10 + i * 26}" cy="10" r="${raioSismo(m)}"/><text x="${10 + i * 26}" y="29" text-anchor="middle">${m}</text>`).join('')}
        </svg>
        <p>O tamanho de cada ponto mostra a magnitude. Abaixo de 2,5, um sismo quase nunca se sente; a partir de 4, sente-se numa área grande. Os pontos mais escuros são dos últimos 7 dias.</p>
      </figcaption>
    </figure>`;
}

function montarSismos(raiz) {
  atualizarEcra(raiz, fonteSismos);
  const fig = raiz.querySelector('.radar');
  if (!fig) return;
  const pontos = fig.querySelectorAll('.radar-p').length;
  animarUmaVez('sismos', fig, 700 + pontos * Math.min(110, 1000 / Math.max(pontos, 1)) + 1300);

  const escolher = (ref, origem) => {
    raiz.querySelectorAll('.radar-p.sel').forEach((el) => el.classList.remove('sel'));
    raiz.querySelectorAll('.sis-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sis === ref)));
    const ponto = fig.querySelector(`.radar-p[data-sis="${ref}"]`);
    if (ponto) {
      ponto.classList.add('sel');
      ponto.classList.remove('pulsar');
      void ponto.getBoundingClientRect();
      ponto.classList.add('pulsar');
    }
    const linha = raiz.querySelector(`#sis-${ref}`);
    if (origem === 'diagrama' && linha) destacar(linha, 'nearest');
    if (origem === 'lista') fig.scrollIntoView({ behavior: calmo() ? 'auto' : 'smooth', block: 'nearest' });
  };
  fig.addEventListener('click', (e) => {
    const ponto = e.target.closest('.radar-p');
    if (ponto) escolher(ponto.dataset.sis, 'diagrama');
  });
  raiz.querySelectorAll('.sis-btn').forEach((b) => b.addEventListener('click', () => escolher(b.dataset.sis, 'lista')));
}

function sismosEcra() {
  const titulo = 'Sismos recentes';
  const dados = fonteSismos.guardado();
  const agora = Date.now();
  const lista = dados ? dados.lista.slice().sort((x, y) => y.hora - x.hora) : [];
  const perto = lista.filter((s) => s.km <= 100).map((s, ref) => ({ ...s, ref: String(ref) }));
  const fortes = lista.filter((s) => s.km > 100 && (s.sentido || (s.mag !== null && s.mag >= 3)));
  const grupo = (id, nome, nota, itens, vazio, noDiagrama = false) => `
    <section class="guia-sec" aria-labelledby="sis-${id}">
      <h2 class="sh" id="sis-${id}">${nome}</h2>
      <p class="nota">${nota}</p>
      ${itens.length ? `<ul class="sis">${itens.map((s) => linhaSismo(s, agora, noDiagrama)).join('')}</ul>` : `<p class="sis-vazio">${vazio}</p>`}
    </section>`;

  const corpo = dados
    ? grupo('perto', 'Perto de Caranguejeira', 'Até 100 km de distância. Toque num sismo para o ver no diagrama.', perto, 'Nenhum sismo registado nos últimos 30 dias.', true)
      + grupo('fortes', 'Mais fortes na região', 'Entre 100 e 400 km, com magnitude 3 ou mais, ou sentidos pela população.', fortes, 'Nenhum nos últimos 30 dias.')
    : `<div class="soon"><h2 class="soon-k">${fonteSismos.falhou() ? 'Sem ligação' : 'A consultar o IPMA…'}</h2>
        <p class="soon-t">${fonteSismos.falhou() ? 'Ligue-se à internet para ver os sismos registados.' : 'A obter os sismos dos últimos 30 dias.'}</p></div>`;

  return {
    title: titulo,
    theme: AZUL,
    // No telemóvel fica tudo em coluna. Em ecrãs grandes, o diagrama fica à esquerda
    // (e acompanha a página ao deslizar) e as listas à direita.
    html: pagina({
      titulo,
      largo: true,
      corpo: `
        <p class="intro">Sismos registados pelo IPMA nos últimos 30 dias, até 400 km de Caranguejeira.</p>
        <p class="obtido"><span class="${classeVivo(fonteSismos)}" aria-hidden="true"></span><span data-obtido>${textoObtido(fonteSismos)}</span></p>
        <div class="sis-duo">
          ${dados ? `<div class="sis-esq">${diagramaSismos(perto, agora)}</div>` : ''}
          <div class="sis-dir">
            ${corpo}
            <a class="next" href="#/agir/sismo">O que fazer num sismo${icon('arrow')}</a>
            <p class="meta">Fonte: <a href="${SITE_SISMOS}" target="_blank" rel="noopener">IPMA – Instituto Português do Mar e da Atmosfera</a>. Horas de Portugal continental. A magnitude pode ser revista pelo IPMA nos dias seguintes.</p>
          </div>
        </div>`,
    }),
    montar: montarSismos,
    dinamico: true,
  };
}

function sobre() {
  const t = conteudo.textos?.sobre || {};
  return {
    title: 'Sobre a app',
    theme: AZUL,
    html: pagina({
      titulo: 'Sobre a app',
      editar: 'textos',
      corpo: `
        <div class="prose">
          ${paragrafos(t.intro)}
          ${(t.secoes || []).filter((s) => s && (s.titulo || s.texto)).map((s) => `
            ${s.titulo ? `<h2>${esc(s.titulo)}</h2>` : ''}
            ${paragrafos(s.texto)}`).join('')}
          <div data-install hidden>
            <h2>Instalar a app</h2>
            <p>Instale a app para a ter no ecrã principal, como as outras apps.</p>
            <button class="btn btn-primary" type="button" data-action="install">Instalar a app</button>
          </div>
          <p class="meta">Versão ${VERSAO} · em desenvolvimento</p>
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
  if (nome === 'mochila') return mochilaEcra();
  if (nome === 'plano') {
    return { title: 'Plano da família', theme: AZUL, html: pagina({ titulo: 'Plano da família', corpo: corpoPlano() }), montar: montarPlano };
  }
  if (nome === 'encontro') {
    return {
      title: 'Pontos de encontro',
      theme: AZUL,
      html: pagina({ titulo: 'Pontos de encontro', corpo: corpoEncontro(), editar: 'pontos', voltar: '#/plano', voltarTxt: 'Plano da família' }),
      montar: montarEncontro,
    };
  }
  if (nome === 'avisos') return avisosEcra();
  if (nome === 'sismos') return sismosEcra();
  if (nome === 'figuras') return figurasEcra();
  if (nome === 'sobre') return sobre();
  if (SIMPLES[nome]) {
    const [titulo, texto] = SIMPLES[nome];
    return { title: titulo, theme: AZUL, html: pagina({ titulo, corpo: emBreve(texto) }) };
  }
  return null;
}

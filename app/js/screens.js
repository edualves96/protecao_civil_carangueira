// Conteúdo de cada ecrã. Cada função devolve { title, theme, html }.

import { icon } from './icons.js';
import { ler } from './store.js';

export const VERSAO = '0.1.0';

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
const ESTADOS = {
  pendente: {
    lbl: 'AVISOS · DISTRITO DE LEIRIA',
    big: 'Em breve',
    desc: 'Os avisos do IPMA para o distrito vão aparecer aqui. Até lá, consulte o site do IPMA.',
    act: { href: 'https://www.ipma.pt/pt/', txt: 'Abrir o site do IPMA', ext: true },
    theme: AZUL,
  },
  verde: {
    lbl: 'AGORA · DISTRITO DE LEIRIA',
    big: 'Sem avisos',
    desc: 'O IPMA não prevê avisos para os próximos 3 dias.',
    theme: '#2E8540',
  },
  amarelo: {
    lbl: 'AVISO AMARELO · DISTRITO DE LEIRIA',
    big: 'Vento forte',
    desc: 'Até amanhã às 12:00. Rajadas até 70 km/h.',
    act: { href: '#/agir/tempestade', txt: 'O que fazer com vento forte' },
    risco: 'tempestade', hl: '#6B5600',
    theme: '#F2C200',
  },
  laranja: {
    lbl: 'AVISO LARANJA · DISTRITO DE LEIRIA',
    big: 'Tempo quente',
    desc: 'Até quinta às 18:00. Máximas até 41 °C.',
    act: { href: '#/agir/calor', txt: 'O que fazer com calor' },
    risco: 'calor', hl: '#9A5200',
    theme: '#F7941D',
  },
  vermelho: {
    lbl: 'AVISO VERMELHO · DISTRITO DE LEIRIA',
    big: 'Chuva muito forte',
    desc: 'Até hoje às 23:59. Risco de cheias rápidas.',
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

// Preparação da família. Os valores reais chegam com o kit (passo 3) e o plano (passo 4).
function progresso() {
  const plano = Boolean(ler('plano-feito', false));
  const kit = Math.max(0, Math.min(1, Number(ler('kit-progresso', 0)) || 0));
  const encontro = Boolean(ler('encontro-escolhido', false));
  const pct = Math.round(((plano ? 1 : 0) + kit + (encontro ? 1 : 0)) / 3 * 100);
  let next;
  if (kit === 0) next = { href: '#/kit', txt: 'Começar o kit de emergência' };
  else if (!plano) next = { href: '#/plano', txt: 'Fazer o plano da família' };
  else if (!encontro) next = { href: '#/encontro', txt: 'Escolher o ponto de encontro' };
  else if (kit < 1) next = { href: '#/kit', txt: 'Completar o kit de emergência' };
  else next = { href: '#/kit', txt: 'Tudo pronto. Reveja o kit de 6 em 6 meses' };
  return { plano, kit, encontro, pct, next };
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
    + `Kit de emergência: ${Math.round(p.kit * 100)}%. Ponto de encontro: ${p.encontro ? 'escolhido' : 'por escolher'}.`;

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
          ${e.demo ? '<p class="demo">DEMONSTRAÇÃO · DADOS FICTÍCIOS</p>' : ''}
          <p class="lbl">${e.lbl}</p>
          <h1 class="big" id="estado">${e.big}</h1>
          <p class="desc">${e.desc}</p>
          ${acao}
        </div>
      </section>
      <div class="edge" style="--edge:${e.theme}"></div>

      <div class="wrap">
        <div class="install" data-install data-card hidden>
          <div class="install-txt">
            <p class="install-t">Instale a app</p>
            <p class="install-d">Fica no ecrã principal, como as outras apps.</p>
          </div>
          <button class="btn-inst" type="button" data-action="install">Instalar</button>
          <button class="x" type="button" data-action="dismiss-install" aria-label="Agora não">${icon('close')}</button>
        </div>

        <section class="sec" aria-labelledby="prep-t">
          <h2 class="cap" id="prep-t">A SUA FAMÍLIA ESTÁ PREPARADA?</h2>
          <div class="prep" role="img" aria-label="${resumo}">
            <p class="pct" aria-hidden="true">${p.pct}%</p>
            <div class="segs" aria-hidden="true">
              <div class="seg">
                <span><i style="width:${p.plano ? 100 : 0}%"></i></span>
                <span><i style="width:${Math.round(p.kit * 100)}%"></i></span>
                <span><i style="width:${p.encontro ? 100 : 0}%"></i></span>
              </div>
              <div class="seglbl"><span>Plano</span><span>Kit</span><span>Encontro</span></div>
            </div>
          </div>
          <a class="next" href="${p.next.href}">Próximo passo: ${p.next.txt.charAt(0).toLowerCase() + p.next.txt.slice(1)}${icon('arrow')}</a>
        </section>

        <section class="sec" aria-labelledby="agora-t">
          <h2 class="cap" id="agora-t">SE ACONTECER AGORA</h2>
          <ul class="rows">
            ${riscos.map((r, i) => linhaRisco(r, i === 0 && r.id === e.risco, e.hl)).join('')}
            <li><a class="row more" href="#/agir">Todos os riscos${icon('chev', 'i chev')}</a></li>
          </ul>
        </section>
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
      <p class="soon-k">EM PREPARAÇÃO</p>
      <p class="soon-t">${texto}</p>
    </div>
    <p class="hint">Em caso de emergência, ligue <a href="tel:112">112</a>.</p>`;
}

const SIMPLES = {
  avisos: ['Avisos do tempo', 'Os avisos do IPMA para o distrito de Leiria, sempre atualizados e guardados para consultar sem rede.'],
  sismos: ['Sismos recentes', 'Os sismos registados pelo IPMA na região, num mapa e numa lista.'],
  kit: ['Kit de emergência', 'A lista do kit para 72 horas, por categorias. Vai marcando o que já tem em casa.'],
  plano: ['Plano da família', 'Quem vive consigo, contactos importantes, necessidades especiais e o que fazer se estiverem separados.'],
  encontro: ['Pontos de encontro', 'Um mapa com os pontos de encontro da freguesia de Caranguejeira.'],
  simulacro: ['Simulacro', 'Treine a saída de casa em segurança, com um cronómetro e os passos a seguir.'],
  quiz: ['Quiz', 'Perguntas rápidas para testar o que sabe sobre autoproteção.'],
  contactos: ['Contactos úteis', 'Os números de emergência e da freguesia, para ligar com um toque.'],
};

function agir() {
  return {
    title: 'O que fazer se…',
    theme: AZUL,
    html: pagina({
      titulo: 'O que fazer se…',
      corpo: `
        <p class="soon-t">Escolha o risco para ver o que fazer antes, durante e depois.</p>
        <ul class="rows">${RISCOS.map((r) => linhaRisco(r)).join('')}</ul>
        <p class="hint">Os guias estão em preparação. Em caso de emergência, ligue <a href="tel:112">112</a>.</p>`,
    }),
  };
}

function guiaRisco(id) {
  const r = RISCOS.find((x) => x.id === id);
  if (!r) return null;
  return {
    title: r.nome,
    theme: AZUL,
    html: pagina({
      titulo: r.nome,
      voltar: '#/agir',
      voltarTxt: 'O que fazer se…',
      corpo: emBreve(`O que fazer antes, durante e depois ${r.de}.`),
    }),
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
          <p>Os avisos e os sismos vão ser obtidos do IPMA. As medidas de autoproteção vão seguir as recomendações da Autoridade Nacional de Emergência e Proteção Civil (ANEPC).</p>
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
  if (nome === 'sobre') return sobre();
  if (SIMPLES[nome]) {
    const [titulo, texto] = SIMPLES[nome];
    return { title: titulo, theme: AZUL, html: pagina({ titulo, corpo: emBreve(texto) }) };
  }
  return null;
}

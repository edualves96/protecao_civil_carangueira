// Mochila de emergência: a lista para marcar (partilhada com o kit, em kit.js) e um
// guia para a arrumar. No guia, uma mochila desenhada vai-se enchendo à medida que a
// pessoa desce pelos passos: primeiro o pesado no fundo, depois o meio, o mole por
// cima, os espaços, o equilíbrio, os bolsos, as alças e, por fim, o teste.

import { conteudo, esc } from './conteudo.js';
import { icon } from './icons.js';
import { mochila } from './kit.js';

// Zonas do desenho, pela ordem em que se arruma. Cada passo do guia aponta para uma.
const ZONAS = ['fundo', 'meio', 'topo', 'espacos', 'lados', 'bolsos', 'alcas', 'teste'];

// Mochila vista de frente, em corte. Unidades do desenho: 320 × 290.
const DESENHO = `
  <svg class="moch-svg" viewBox="0 0 320 292" role="img" aria-labelledby="moch-t">
    <title id="moch-t">Mochila em corte: o pesado no fundo, o médio no meio, o mole e leve em cima, e o que precisa logo nos bolsos de fora.</title>
    <g class="moch-saco">
      <g class="mz mz-alcas" data-z="alcas">
        <path class="m-alca" d="M54 96C34 102 30 156 38 214"/>
        <path class="m-alca" d="M182 96C202 102 206 156 198 214"/>
        <path class="m-cinto" d="M54 226H28M182 226h26"/>
        <rect class="m-fivela" x="20" y="220" width="10" height="12" rx="2"/>
        <rect class="m-fivela" x="206" y="220" width="10" height="12" rx="2"/>
      </g>
      <path class="m-pega" d="M100 38c0-18 36-18 36 0"/>
      <rect class="m-corpo" x="52" y="62" width="132" height="194" rx="30"/>
      <clipPath id="moch-dentro"><rect x="56" y="66" width="124" height="186" rx="26"/></clipPath>
      <g clip-path="url(#moch-dentro)">
        <g class="mz mz-cai" data-z="fundo">
          <rect class="m-garrafa" x="62" y="206" width="26" height="46" rx="7"/><rect class="m-tampa" x="68" y="199" width="14" height="9" rx="2"/>
          <rect class="m-garrafa" x="92" y="206" width="26" height="46" rx="7"/><rect class="m-tampa" x="98" y="199" width="14" height="9" rx="2"/>
          <rect class="m-lata" x="124" y="220" width="26" height="32" rx="4"/><path class="m-aro" d="M124 227h26"/>
          <rect class="m-lata" x="152" y="220" width="26" height="32" rx="4"/><path class="m-aro" d="M152 227h26"/>
        </g>
        <g class="mz mz-cai" data-z="meio">
          <rect class="m-comida" x="62" y="164" width="60" height="36" rx="5"/><path class="m-risca" d="M70 176h44M70 186h30"/>
          <rect class="m-socorro" x="128" y="158" width="48" height="42" rx="6"/><path class="m-cruz" d="M152 168v22M141 179h22"/>
        </g>
        <g class="mz mz-cai" data-z="topo">
          <rect class="m-roupa m-roupa1" x="62" y="138" width="62" height="17" rx="8.5"/>
          <rect class="m-roupa m-roupa2" x="62" y="121" width="62" height="17" rx="8.5"/>
          <rect class="m-roupa m-roupa3" x="62" y="104" width="62" height="17" rx="8.5"/>
          <rect class="m-manta" x="130" y="102" width="46" height="52" rx="23"/><path class="m-espiral" d="M153 128a5 5 0 1 1 5 5 10 10 0 1 1-10-10"/>
        </g>
        <g class="mz mz-cai" data-z="espacos">
          <ellipse class="m-meia" cx="138" cy="213" rx="12" ry="5"/>
          <ellipse class="m-meia" cx="165" cy="213" rx="11" ry="5"/>
          <ellipse class="m-meia" cx="93" cy="157" rx="26" ry="4"/>
          <ellipse class="m-meia" cx="127" cy="94" rx="40" ry="5"/>
        </g>
      </g>
      <g class="mz mz-aparece" data-z="lados">
        <path class="m-centro" d="M118 70v180"/>
        <path class="m-braco" d="M90 274h56"/>
        <path class="m-prato" d="M84 274a6 6 0 0 0 12 0M140 274a6 6 0 0 0 12 0"/>
        <path class="m-apoio" d="M118 274l-7 12h14z"/>
      </g>
      <rect class="m-tampa-saco" x="58" y="36" width="120" height="44" rx="18"/>
      <rect class="m-bolso" x="184" y="168" width="22" height="60" rx="9"/>
      <g class="mz mz-cai" data-z="bolsos">
        <rect class="m-doc" x="78" y="46" width="26" height="20" rx="2"/><path class="m-doc-l" d="M83 53h16M83 59h11"/>
        <rect class="m-remedio" x="110" y="48" width="22" height="16" rx="4"/>
        <circle class="m-apito" cx="148" cy="57" r="7"/><path class="m-apito" d="M148 50h10v6"/>
        <rect class="m-lanterna" x="189" y="176" width="12" height="32" rx="6"/>
      </g>
      <g class="mz mz-aparece" data-z="teste">
        <circle class="m-ok" cx="190" cy="40" r="15"/><path class="m-ok-v" d="M183 40.5l5 5 9.5-10"/>
      </g>
    </g>
    <g class="moch-rotulos" aria-hidden="true">
      <g class="m-rot" data-z="bolsos"><path d="M178 58h46"/><text x="230" y="62">À mão</text></g>
      <g class="m-rot" data-z="topo"><path d="M180 128h44"/><text x="230" y="132">Leve e mole</text></g>
      <g class="m-rot" data-z="meio"><path d="M180 180h44"/><text x="230" y="184">Médio</text></g>
      <g class="m-rot" data-z="fundo"><path d="M180 232h44"/><text x="230" y="236">Pesado</text></g>
    </g>
  </svg>`;

function guiaArrumar() {
  const a = conteudo.mochila?.arrumar || {};
  const passos = (a.passos || []).filter((p) => p && p.t);
  if (!passos.length) return '';
  return `
    <section class="arrumar" id="arrumar" aria-labelledby="arrumar-t" data-arrumar>
      <h2 class="sh" id="arrumar-t">${esc(a.titulo || 'Como arrumar a mochila')}</h2>
      ${a.intro ? `<p class="arr-intro">${esc(a.intro)}</p>` : ''}
      <div class="arr-grid">
        <div class="arr-fig">
          ${DESENHO}
          <div class="arr-prog" aria-hidden="true">
            <span class="arr-prog-t" data-arr-prog>Desça para arrumar a mochila</span>
            <span class="arr-prog-segs">${passos.map(() => '<i></i>').join('')}</span>
          </div>
        </div>
        <ol class="arr-passos" role="list">
          ${passos.map((p, i) => `
            <li class="arr-passo">
              <button class="arr-btn" type="button" data-passo="${i}" data-zona="${ZONAS.includes(p.zona) ? p.zona : ''}" aria-pressed="false">
                <span class="arr-n" aria-hidden="true"><span class="arr-num">${i + 1}</span>${icon('check', 'i arr-ok')}</span>
                <span class="arr-txt">
                  <span class="arr-t">${esc(p.t)}</span>
                  ${p.d ? `<span class="arr-d">${esc(p.d)}</span>` : ''}
                </span>
              </button>
            </li>`).join('')}
        </ol>
      </div>
    </section>`;
}

export function corpoMochila() {
  const atalho = `
    <button class="arr-ir" type="button" data-ir-arrumar>
      <span class="arr-ir-ic" aria-hidden="true">${icon('mochila')}</span>
      <span class="arr-ir-txt"><b>Como arrumar a mochila</b><span>Passo a passo, para pesar menos nas costas.</span></span>
      ${icon('baixo', 'i arr-ir-seta')}
    </button>`;
  return mochila.corpo({ antes: atalho, depois: guiaArrumar() });
}

// Liga a lista e o guia. O guia avança sozinho à medida que a pessoa desce pela
// página (o passo que passa a meio do ecrã fica ativo); também se pode tocar num passo.
export function montarMochila(raiz) {
  mochila.montar(raiz);

  const guia = raiz.querySelector('[data-arrumar]');
  raiz.querySelector('[data-ir-arrumar]')?.addEventListener('click', () => {
    const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    guia?.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' });
  });
  if (!guia) return;

  const svg = guia.querySelector('.moch-svg');
  const botoes = [...guia.querySelectorAll('[data-passo]')];
  const ordem = botoes.map((b) => b.dataset.zona);
  const segs = [...guia.querySelectorAll('.arr-prog-segs i')];
  const prog = guia.querySelector('[data-arr-prog]');
  let atual = null;

  // Mostra a mochila arrumada até ao passo `n` (inclusive) e realça a zona desse passo.
  const mostrarAte = (n) => {
    if (n === atual) return;
    atual = n;
    const feitas = new Set(ordem.slice(0, n + 1));
    svg.querySelectorAll('.mz, .m-rot').forEach((el) => {
      const z = el.dataset.z;
      const posicao = ordem.indexOf(z);
      el.classList.toggle('fora', posicao !== -1 && !feitas.has(z) && z !== 'alcas');
      el.classList.toggle('ativa', z === ordem[n]);
    });
    svg.classList.toggle('foco', n >= 0 && n < ordem.length - 1);
    svg.classList.toggle('anda', ordem[n] === 'teste');
    // Os passos já feitos ganham um visto, e a barra por baixo do desenho mostra quantos faltam.
    botoes.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(i === n));
      b.classList.toggle('feito', i < n || (i === n && n === botoes.length - 1));
    });
    segs.forEach((s, i) => s.classList.toggle('on', i <= n));
    if (prog) {
      prog.textContent = n < 0
        ? 'Desça para arrumar a mochila'
        : n === botoes.length - 1 ? 'Mochila arrumada' : `Passo ${n + 1} de ${botoes.length} · faltam ${botoes.length - n - 1}`;
    }
  };

  // Começa vazia: o desenho enche-se com os passos.
  mostrarAte(-1);

  botoes.forEach((b, i) => b.addEventListener('click', () => mostrarAte(i)));

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) mostrarAte(Number(e.target.dataset.passo));
      });
    }, { rootMargin: '-55% 0px -35% 0px' });
    botoes.forEach((b) => obs.observe(b));
  }
}

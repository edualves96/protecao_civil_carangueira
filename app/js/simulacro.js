// Simulacro: treinar a saída de casa com a família, com cronómetro e passos para marcar.
// Os resultados ficam só neste aparelho, para comparar com a vez seguinte.

import { ler, guardar } from './store.js';
import { esc } from './conteudo.js';
import { icon } from './icons.js';

const CHAVE = 'simulacros';
const PASSOS = [
  'Todos foram avisados',
  'A mochila de emergência saiu connosco',
  'Quem precisa de ajuda foi ajudado',
  'Fechámos as portas ao sair',
  'Estamos todos no ponto de encontro',
];

const historico = () => { const h = ler(CHAVE, []); return Array.isArray(h) ? h : []; };
const tempo = (s) => `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
const relogio = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const data = (iso) => new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

function haQuanto(iso) {
  const meses = Math.floor((Date.now() - Date.parse(iso)) / (30.4 * 864e5));
  if (meses < 1) return 'este mês';
  return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
}

function historicoHtml(h) {
  if (!h.length) return '';
  return `
    <section class="guia-sec" aria-labelledby="sim-h">
      <h2 class="sh" id="sim-h">Simulacros feitos</h2>
      <ul class="sim-hist">${h.slice().reverse().map((x) => `
        <li><b>${tempo(x.segundos)}</b><span>${data(x.data)} · ${x.passos} de ${PASSOS.length} passos</span>${x.notas ? `<span class="sim-nota">${esc(x.notas)}</span>` : ''}</li>`).join('')}
      </ul>
    </section>`;
}

export function corpoSimulacro() {
  const h = historico();
  const ultimo = h[h.length - 1];
  const lembrete = ultimo
    ? `<p class="sim-lemb${Date.now() - Date.parse(ultimo.data) > 182 * 864e5 ? ' atrasado' : ''}">Último simulacro ${haQuanto(ultimo.data)}. Repitam de 6 em 6 meses.</p>`
    : '';
  return `
    <div data-sim>
      <p class="intro">Treinar a saída de casa faz com que, a sério, cada um saiba o que fazer. Combinem um cenário, carreguem em Começar e só parem o relógio quando estiverem todos no ponto de encontro.</p>
      ${lembrete}
      <section class="guia-sec" aria-labelledby="sim-a">
        <h2 class="sh" id="sim-a">Antes de começar</h2>
        <ul class="passos">
          <li><b>Escolham um cenário,</b> por exemplo um incêndio na cozinha.</li>
          <li><b>Combinem quem ajuda quem,</b> como está no plano da família.</li>
          <li><b>Não corram.</b> Saiam depressa, mas com cuidado.</li>
        </ul>
      </section>
      <div class="sim-relogio" data-sim-relogio>
        <p class="sim-tempo" aria-hidden="true" data-sim-tempo>00:00</p>
        <p class="vh" aria-live="assertive" data-sim-aviso></p>
        <button class="sim-btn" type="button" data-sim-iniciar>${icon('alvo')}Começar</button>
        <button class="sim-btn sim-parar" type="button" data-sim-parar hidden>${icon('check')}Chegámos todos</button>
      </div>
      <ul class="checks sim-passos" data-sim-passos hidden>
        ${PASSOS.map((p, i) => `
          <li><label class="check"><input type="checkbox" data-sim-passo="${i}"><span class="check-txt"><span class="check-t">${p}</span></span></label></li>`).join('')}
      </ul>
      <div class="sim-fim" data-sim-fim hidden></div>
      <div data-sim-hist>${historicoHtml(h)}</div>
      <a class="next" href="#/plano">Rever o plano da família${icon('arrow')}</a>
    </div>`;
}

export function montarSimulacro(raiz) {
  const z = raiz.querySelector('[data-sim]');
  if (!z) return;
  const $ = (s) => z.querySelector(s);
  let inicio = 0;
  let intervalo = null;
  let ecraLigado = null;

  const pararTudo = () => {
    clearInterval(intervalo);
    intervalo = null;
    ecraLigado?.release?.().catch(() => {});
    ecraLigado = null;
  };
  window.addEventListener('hashchange', pararTudo, { once: true });

  $('[data-sim-iniciar]').addEventListener('click', async () => {
    inicio = Date.now();
    $('[data-sim-iniciar]').hidden = true;
    $('[data-sim-parar]').hidden = false;
    $('[data-sim-passos]').hidden = false;
    $('[data-sim-fim]').hidden = true;
    z.querySelectorAll('[data-sim-passo]').forEach((c) => { c.checked = false; });
    $('[data-sim-relogio]').classList.add('a-correr');
    $('[data-sim-aviso]').textContent = 'Simulacro a decorrer. Saiam de casa.';
    intervalo = setInterval(() => { $('[data-sim-tempo]').textContent = relogio(Math.floor((Date.now() - inicio) / 1000)); }, 250);
    // O ecrã fica ligado enquanto o relógio corre.
    try { ecraLigado = await navigator.wakeLock?.request('screen'); } catch { /* sem suporte */ }
    $('[data-sim-parar]').focus();
  });

  $('[data-sim-parar]').addEventListener('click', () => {
    pararTudo();
    const segundos = Math.max(1, Math.round((Date.now() - inicio) / 1000));
    const passos = [...z.querySelectorAll('[data-sim-passo]')].filter((c) => c.checked).length;
    const h = historico();
    const anterior = h[h.length - 1];
    const comparar = anterior
      ? (segundos < anterior.segundos ? `${tempo(anterior.segundos - segundos)} mais rápido do que da última vez.` : `Da última vez demoraram ${tempo(anterior.segundos)}.`)
      : 'É o vosso primeiro simulacro. Da próxima vez, comparem.';
    $('[data-sim-relogio]').classList.remove('a-correr');
    $('[data-sim-parar]').hidden = true;
    $('[data-sim-iniciar]').hidden = false;
    $('[data-sim-iniciar]').lastChild.textContent = 'Fazer outro';
    $('[data-sim-passos]').hidden = true;
    const fim = $('[data-sim-fim]');
    fim.hidden = false;
    fim.innerHTML = `
      <p class="sim-res"><span>Demoraram</span><b>${tempo(segundos)}</b></p>
      <p class="sim-cmp">${comparar} ${passos} de ${PASSOS.length} passos feitos.</p>
      <label class="fld" for="sim-notas"><span class="fld-r">O que correu mal? O que vão mudar?</span>
        <textarea id="sim-notas" rows="3" placeholder="Por exemplo: a chave da porta das traseiras não estava no sítio."></textarea></label>
      <button class="imprimir" type="button" data-sim-guardar>${icon('check')}Guardar este simulacro</button>`;
    $('[data-sim-aviso]').textContent = `Simulacro terminado: ${tempo(segundos)}.`;
    fim.querySelector('[data-sim-guardar]').addEventListener('click', () => {
      const lista = historico();
      lista.push({ data: new Date().toISOString(), segundos, passos, notas: fim.querySelector('#sim-notas').value.trim() });
      guardar(CHAVE, lista.slice(-20));
      fim.innerHTML = `<p class="sim-ok">${icon('check')}Guardado. Bom trabalho!</p>`;
      $('[data-sim-hist]').innerHTML = historicoHtml(historico());
    });
  });
}

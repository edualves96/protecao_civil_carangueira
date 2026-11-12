// Quiz: uma pergunta de cada vez, três respostas grandes, e a explicação logo a seguir.
// As perguntas vêm de app/conteudo/quiz.json (editáveis na página de edição).
// O melhor resultado fica neste aparelho.

import { ler, guardar } from './store.js';
import { conteudo, esc } from './conteudo.js';
import { icon } from './icons.js';

const CHAVE = 'quiz-melhor';

const baralhar = (lista) => {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function perguntas() {
  return (conteudo.quiz?.perguntas || [])
    .filter((p) => p && p.q && Array.isArray(p.opcoes) && p.opcoes.filter(Boolean).length >= 2)
    .map((p) => ({ ...p, opcoes: p.opcoes.filter(Boolean), certa: Math.max(1, Math.min(Number(p.certa) || 1, p.opcoes.length)) }));
}

export function corpoQuiz() {
  const melhor = ler(CHAVE, null);
  const total = perguntas().length;
  return `
    <div data-quiz>
      ${conteudo.quiz?.intro ? `<p class="intro">${esc(conteudo.quiz.intro)}</p>` : ''}
      ${melhor ? `<p class="quiz-melhor">${icon('check')}O seu melhor: ${melhor.certas} de ${melhor.total}</p>` : ''}
      <div class="quiz-prog" aria-hidden="true"><span class="quiz-prog-t" data-quiz-n>${total} perguntas</span><span class="quiz-segs">${Array.from({ length: total }, () => '<i></i>').join('')}</span></div>
      <div class="quiz-caixa" data-quiz-caixa>
        <button class="sim-btn" type="button" data-quiz-comecar>${icon('arrow')}Começar</button>
      </div>
    </div>`;
}

export function montarQuiz(raiz) {
  const z = raiz.querySelector('[data-quiz]');
  if (!z) return;
  const caixa = z.querySelector('[data-quiz-caixa]');
  const segs = [...z.querySelectorAll('.quiz-segs i')];
  let lista = [];
  let n = 0;
  let certas = 0;

  const mostrar = () => {
    const p = lista[n];
    z.querySelector('[data-quiz-n]').textContent = `Pergunta ${n + 1} de ${lista.length}`;
    const ordem = baralhar(p.opcoes.map((texto, i) => ({ texto, certa: i + 1 === p.certa })));
    caixa.innerHTML = `
      <fieldset class="quiz-p">
        <legend class="quiz-q" tabindex="-1">${esc(p.q)}</legend>
        ${ordem.map((o, i) => `<button class="quiz-op" type="button" data-certa="${o.certa}" data-i="${i}">${esc(o.texto)}</button>`).join('')}
      </fieldset>
      <div class="quiz-exp" data-quiz-exp aria-live="polite"></div>`;
    caixa.querySelector('.quiz-q').focus({ preventScroll: true });
  };

  const responder = (b) => {
    const certo = b.dataset.certa === 'true';
    if (certo) certas += 1;
    caixa.querySelectorAll('.quiz-op').forEach((o) => {
      o.disabled = true;
      if (o.dataset.certa === 'true') o.classList.add('certa');
    });
    if (!certo) b.classList.add('errada');
    segs[n].classList.add(certo ? 'certa' : 'errada');
    const p = lista[n];
    const ultima = n === lista.length - 1;
    caixa.querySelector('[data-quiz-exp]').innerHTML = `
      <p class="quiz-r ${certo ? 'ok' : 'nok'}">${icon(certo ? 'check' : 'close')}${certo ? 'Certo!' : 'Não é bem assim.'}</p>
      <p class="quiz-e">${esc(p.explica || '')}</p>
      ${p.guia ? `<a class="fogo-v" href="#/agir/${esc(p.guia)}">Ver o guia${icon('arrow')}</a>` : ''}
      <button class="sim-btn quiz-seg" type="button" data-quiz-seguinte>${ultima ? 'Ver o resultado' : 'Pergunta seguinte'}${icon('arrow')}</button>`;
    caixa.querySelector('[data-quiz-seguinte]').focus({ preventScroll: true });
  };

  const fim = () => {
    const anterior = ler(CHAVE, null);
    const recorde = !anterior || certas > anterior.certas;
    if (recorde) guardar(CHAVE, { certas, total: lista.length, data: new Date().toISOString() });
    const frase = certas === lista.length ? 'Perfeito! Está mesmo preparado.'
      : certas >= lista.length * 0.7 ? 'Muito bem! Reveja os guias das que falharam.'
        : 'Bom começo. Os guias "O que fazer se…" ajudam a ir mais longe.';
    z.querySelector('[data-quiz-n]').textContent = 'Resultado';
    caixa.innerHTML = `
      <p class="sim-res"><span>Acertou</span><b>${certas} de ${lista.length}</b></p>
      <p class="sim-cmp">${frase}${recorde && anterior ? ' É o seu melhor resultado!' : ''}</p>
      <button class="sim-btn" type="button" data-quiz-comecar>${icon('arrow')}Fazer outra vez</button>
      <a class="next" href="#/agir">Ver os guias "O que fazer se…"${icon('arrow')}</a>`;
  };

  z.addEventListener('click', (e) => {
    if (e.target.closest('[data-quiz-comecar]')) {
      lista = baralhar(perguntas());
      n = 0;
      certas = 0;
      segs.forEach((s) => s.classList.remove('certa', 'errada'));
      mostrar();
      return;
    }
    const op = e.target.closest('.quiz-op');
    if (op && !op.disabled) { responder(op); return; }
    if (e.target.closest('[data-quiz-seguinte]')) {
      n += 1;
      if (n < lista.length) mostrar(); else fim();
    }
  });
}

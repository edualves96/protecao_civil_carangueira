// Plano da família: quem vive em casa, contactos, pontos de encontro e como sair.
// Fica guardado só neste aparelho, à medida que se escreve (não há botão de guardar).
// Cada parte mostra se está feita, e o início mostra quanto falta (efeito Zeigarnik).

import { ler, guardar } from './store.js';
import { esc, paraTel } from './conteudo.js';
import { icon } from './icons.js';

const CHAVE = 'plano';
const CHAVE_ENCONTRO = 'encontro';
const CHAVE_ABERTOS = 'plano-abertos';

const GRUPOS = [
  { id: 'crianca', nome: 'Criança' },
  { id: 'adulto', nome: 'Adulto' },
  { id: 'idoso', nome: 'Mais velho' },
];

const vazio = () => ({ pessoas: [], animais: '', fora: { nome: '', tel: '' }, medico: { nome: '', tel: '' }, saida: { porta: '', ajuda: '', mochila: '' } });

export function lerPlano() {
  const p = ler(CHAVE, null);
  const base = vazio();
  if (!p || typeof p !== 'object') return base;
  return {
    pessoas: Array.isArray(p.pessoas) ? p.pessoas : [],
    animais: p.animais || '',
    fora: { ...base.fora, ...(p.fora || {}) },
    medico: { ...base.medico, ...(p.medico || {}) },
    saida: { ...base.saida, ...(p.saida || {}) },
  };
}
const guardarPlano = (p) => guardar(CHAVE, p);

export function lerEncontro() {
  const e = ler(CHAVE_ENCONTRO, null) || {};
  const ponto = (x) => (x && x.nome ? x : null);
  return { perto: ponto(e.perto), longe: ponto(e.longe) };
}
export const guardarEncontro = (e) => guardar(CHAVE_ENCONTRO, e);

// Partes do plano e quando contam como feitas.
const PARTES = [
  { id: 'pessoas', nome: 'Quem vive consigo', icone: 'pessoas', feita: (p) => p.pessoas.some((x) => x.nome.trim()) },
  { id: 'contactos', nome: 'Contactos', icone: 'phone', feita: (p) => Boolean(p.fora.tel.trim()) },
  { id: 'encontro', nome: 'Pontos de encontro', icone: 'pin', feita: (p, e) => Boolean(e.perto && e.longe) },
  { id: 'saida', nome: 'Como sair de casa', icone: 'porta', feita: (p) => Boolean(p.saida.porta.trim()) },
];

// Para o início: o plano (sem os pontos de encontro, que têm a sua própria parte) e o encontro.
export function resumoPlano() {
  const p = lerPlano();
  const e = lerEncontro();
  const doPlano = PARTES.filter((x) => x.id !== 'encontro');
  const feitas = doPlano.filter((x) => x.feita(p, e)).length;
  return {
    plano: { feitas, total: doPlano.length, fracao: feitas / doPlano.length },
    encontro: { feitos: (e.perto ? 1 : 0) + (e.longe ? 1 : 0), total: 2, fracao: ((e.perto ? 1 : 0) + (e.longe ? 1 : 0)) / 2 },
  };
}

/* ---------- Ecrã ---------- */

const campo = (id, rotulo, valor, { tipo = 'text', ajuda = '', exemplo = '', area = false, extra = '' } = {}) => `
  <label class="fld" for="${id}">
    <span class="fld-r">${rotulo}</span>
    ${ajuda ? `<span class="fld-a" id="${id}-a">${ajuda}</span>` : ''}
    ${area
    ? `<textarea id="${id}" rows="2" placeholder="${esc(exemplo)}"${ajuda ? ` aria-describedby="${id}-a"` : ''} ${extra}>${esc(valor)}</textarea>`
    : `<input id="${id}" type="${tipo}" value="${esc(valor)}" placeholder="${esc(exemplo)}" autocomplete="off"${ajuda ? ` aria-describedby="${id}-a"` : ''} ${extra}>`}
  </label>`;

function pessoaHtml(x, n) {
  return `
    <li class="pessoa" data-pessoa="${n}">
      ${campo(`p-nome-${n}`, `Pessoa ${n + 1}`, x.nome, { exemplo: 'Nome', extra: `data-campo="nome" data-n="${n}"` })}
      <fieldset class="seg-op">
        <legend class="vh">Idade de ${esc(x.nome || `pessoa ${n + 1}`)}</legend>
        ${GRUPOS.map((g) => `
          <label class="seg-op-i"><input type="radio" name="p-grupo-${n}" value="${g.id}" data-campo="grupo" data-n="${n}"${x.grupo === g.id ? ' checked' : ''}><span>${g.nome}</span></label>`).join('')}
      </fieldset>
      ${campo(`p-precisa-${n}`, 'Precisa de algo especial?', x.precisa || '', { area: true, exemplo: 'Medicamentos, óculos, cadeira de rodas, quem a ajuda…', extra: `data-campo="precisa" data-n="${n}"` })}
      <button class="pessoa-x" type="button" data-tirar="${n}">${icon('lixo')}Retirar ${esc(x.nome || `pessoa ${n + 1}`)}</button>
    </li>`;
}

function parteHtml(parte, p, e, aberta) {
  const feita = parte.feita(p, e);
  let corpo = '';
  if (parte.id === 'pessoas') {
    corpo = `
      <ul class="pessoas" data-pessoas>${p.pessoas.map(pessoaHtml).join('')}</ul>
      <button class="add" type="button" data-juntar>${icon('mais')}Juntar uma pessoa</button>
      ${campo('animais', 'Animais de estimação', p.animais, { area: true, exemplo: 'Por exemplo: 1 cão (Bobi), 2 gatos', extra: 'data-campo="animais"' })}`;
  } else if (parte.id === 'contactos') {
    corpo = `
      ${campo('fora-nome', 'Alguém fora da região', p.fora.nome, { ajuda: 'Numa catástrofe, costuma ser mais fácil ligar para longe do que para perto. Combinem que todos ligam a esta pessoa a dizer onde estão.', exemplo: 'Nome, por exemplo uma tia em Coimbra', extra: 'data-campo="fora.nome"' })}
      ${campo('fora-tel', 'Telefone dessa pessoa', p.fora.tel, { tipo: 'tel', exemplo: '912 345 678', extra: 'inputmode="tel" data-campo="fora.tel"' })}
      ${campo('medico-nome', 'Médico de família ou centro de saúde', p.medico.nome, { exemplo: 'Opcional', extra: 'data-campo="medico.nome"' })}
      ${campo('medico-tel', 'Telefone', p.medico.tel, { tipo: 'tel', exemplo: 'Opcional', extra: 'inputmode="tel" data-campo="medico.tel"' })}
      ${p.fora.tel.trim() ? `<a class="ligar-fora" href="tel:${paraTel(p.fora.tel)}">${icon('phone')}Ligar a ${esc(p.fora.nome || 'esse contacto')}</a>` : ''}`;
  } else if (parte.id === 'encontro') {
    const linha = (rot, x, n) => `
      <li class="enc-l"><span class="enc-n enc-n${n}" aria-hidden="true">${n}</span>
        <span><b>${rot}</b>${x ? esc(x.nome) : '<i>Por escolher</i>'}</span></li>`;
    corpo = `
      <p class="fld-a">Dois sítios para se encontrarem se não estiverem juntos.</p>
      <ul class="enc-lista">${linha('Perto de casa', e.perto, 1)}${linha('Fora do bairro', e.longe, 2)}</ul>
      <a class="add" href="#/encontro">${icon('pin')}${e.perto || e.longe ? 'Ver ou mudar no mapa' : 'Escolher no mapa'}</a>`;
  } else {
    corpo = `
      ${campo('saida-porta', 'Por onde saem de casa', p.saida.porta, { area: true, exemplo: 'Pela porta da cozinha. Se não der, pela janela da sala.', extra: 'data-campo="saida.porta"' })}
      ${campo('saida-ajuda', 'Quem ajuda quem', p.saida.ajuda, { area: true, exemplo: 'O João ajuda a avó a descer as escadas.', extra: 'data-campo="saida.ajuda"' })}
      ${campo('saida-mochila', 'Onde fica a mochila de emergência', p.saida.mochila, { exemplo: 'No armário da entrada', extra: 'data-campo="saida.mochila"' })}`;
  }
  return `
    <details class="kit-cat${feita ? ' feito' : ''}" data-parte="${parte.id}"${aberta ? ' open' : ''}>
      <summary class="kit-sum">
        <span class="kit-ic" aria-hidden="true">${icon(parte.icone, 'i kit-ic-cat')}${icon('check', 'i kit-ic-ok')}</span>
        <span class="kit-sum-txt"><h2 class="kit-h">${parte.nome}</h2></span>
        <span class="kit-n" data-parte-n><span class="vh">: </span>${feita ? 'Feito' : 'Por fazer'}</span>
        ${icon('chev', 'i chev')}
      </summary>
      <div class="kit-corpo plano-corpo">${corpo}</div>
    </details>`;
}

// Folha para imprimir (ou guardar em PDF): o plano todo numa página.
function folhaHtml(p, e) {
  const linha = (r, v) => (v && String(v).trim() ? `<tr><th>${r}</th><td>${esc(v)}</td></tr>` : '');
  const ponto = (x) => (x ? `${x.nome}${x.lat ? ` (${x.lat.toFixed(5)}, ${x.lon.toFixed(5)})` : ''}` : '');
  return `
    <h1>Plano de emergência da família</h1>
    <p>Em caso de emergência, ligue 112.</p>
    <h2>Quem vive em casa</h2>
    <table>${p.pessoas.filter((x) => x.nome.trim()).map((x) => linha(esc(x.nome), [GRUPOS.find((g) => g.id === x.grupo)?.nome, x.precisa].filter(Boolean).join(' · ') || '—')).join('')}
      ${linha('Animais', p.animais)}</table>
    <h2>Contactos</h2>
    <table>${linha('Fora da região', [p.fora.nome, p.fora.tel].filter(Boolean).join(' · '))}${linha('Médico', [p.medico.nome, p.medico.tel].filter(Boolean).join(' · '))}${linha('Emergência', '112')}</table>
    <h2>Pontos de encontro</h2>
    <table>${linha('1. Perto de casa', ponto(e.perto))}${linha('2. Fora do bairro', ponto(e.longe))}</table>
    <h2>Como sair de casa</h2>
    <table>${linha('Por onde sair', p.saida.porta)}${linha('Quem ajuda quem', p.saida.ajuda)}${linha('Mochila', p.saida.mochila)}</table>`;
}

export function corpoPlano() {
  const p = lerPlano();
  const e = lerEncontro();
  const feitas = PARTES.filter((x) => x.feita(p, e)).length;
  const guardados = ler(CHAVE_ABERTOS, null);
  const primeira = PARTES.find((x) => !x.feita(p, e));
  const abertas = new Set(Array.isArray(guardados) ? guardados : [primeira ? primeira.id : PARTES[0].id]);
  const faltam = PARTES.length - feitas;

  return `
    <div data-plano>
      <p class="intro">Quando algo acontece, não há tempo para combinar. Façam o plano juntos, à mesa, e voltem a ele uma vez por ano.</p>
      <div class="kit-prog${faltam === 0 ? ' feito' : ''}" data-plano-prog>
        <p class="kit-num"><span class="pct" data-plano-feitas>${feitas}</span> <span class="kit-de">de ${PARTES.length} partes feitas<span class="kit-faltam" data-plano-faltam>${faltam && feitas ? ` · faltam ${faltam}` : ''}</span></span></p>
        <div class="seg seg-partes" aria-hidden="true">${PARTES.map((x) => `<span><i style="width:${x.feita(p, e) ? 100 : 0}%" data-seg="${x.id}"></i></span>`).join('')}</div>
      </div>
      <p class="guardado" aria-live="polite" data-guardado>${icon('check')}Guardado só neste aparelho</p>
      <div class="kit-grupos">${PARTES.map((x) => parteHtml(x, p, e, abertas.has(x.id))).join('')}</div>
      <button class="imprimir" type="button" data-imprimir>${icon('imprimir')}Imprimir o plano</button>
      <p class="hint">Imprima o plano e guarde uma cópia na mochila de emergência. Sem bateria, o papel continua a funcionar.</p>
      <div class="folha" data-folha aria-hidden="true"></div>
    </div>`;
}

export function montarPlano(raiz) {
  const zona = raiz.querySelector('[data-plano]');
  if (!zona) return;
  let p = lerPlano();
  const e = lerEncontro();
  let espera = null;
  const aviso = zona.querySelector('[data-guardado]');

  // Atualiza as marcas de "Feito" e a contagem, sem voltar a desenhar o formulário.
  const atualizarEstado = () => {
    let feitas = 0;
    PARTES.forEach((x) => {
      const feita = x.feita(p, e);
      if (feita) feitas += 1;
      const d = zona.querySelector(`[data-parte="${x.id}"]`);
      const antes = d.classList.contains('feito');
      d.classList.toggle('feito', feita);
      d.querySelector('[data-parte-n]').innerHTML = `<span class="vh">: </span>${feita ? 'Feito' : 'Por fazer'}`;
      zona.querySelector(`[data-seg="${x.id}"]`).style.width = feita ? '100%' : '0%';
      if (feita && !antes) {
        const ic = d.querySelector('.kit-ic');
        ic.classList.remove('acabou'); void ic.getBoundingClientRect(); ic.classList.add('acabou');
      }
    });
    const faltam = PARTES.length - feitas;
    zona.querySelector('[data-plano-feitas]').textContent = feitas;
    zona.querySelector('[data-plano-faltam]').textContent = faltam && feitas ? ` · faltam ${faltam}` : '';
    zona.querySelector('[data-plano-prog]').classList.toggle('feito', faltam === 0);
  };

  const gravar = () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      guardarPlano(p);
      aviso.classList.remove('pisca'); void aviso.offsetWidth; aviso.classList.add('pisca');
    }, 350);
    atualizarEstado();
  };

  zona.addEventListener('input', (ev) => {
    const el = ev.target;
    const nome = el.dataset.campo;
    if (!nome) return;
    if (el.dataset.n !== undefined) {
      const x = p.pessoas[Number(el.dataset.n)];
      if (x) x[nome] = el.value;
    } else if (nome.includes('.')) {
      const [a, b] = nome.split('.');
      p[a][b] = el.value;
    } else {
      p[nome] = el.value;
    }
    gravar();
  });

  // Juntar e retirar pessoas: só volta a desenhar a lista de pessoas.
  const desenharPessoas = (focar) => {
    zona.querySelector('[data-pessoas]').innerHTML = p.pessoas.map(pessoaHtml).join('');
    if (focar !== undefined) zona.querySelector(`#p-nome-${focar}`)?.focus();
  };
  zona.querySelector('[data-juntar]').addEventListener('click', () => {
    p.pessoas.push({ nome: '', grupo: 'adulto', precisa: '' });
    desenharPessoas(p.pessoas.length - 1);
    gravar();
  });
  zona.addEventListener('click', (ev) => {
    const tirar = ev.target.closest('[data-tirar]');
    if (!tirar) return;
    p.pessoas.splice(Number(tirar.dataset.tirar), 1);
    desenharPessoas();
    zona.querySelector('[data-juntar]').focus();
    gravar();
  });
  if (!p.pessoas.length) {
    p.pessoas.push({ nome: '', grupo: 'adulto', precisa: '' });
    desenharPessoas();
  }

  const partes = [...zona.querySelectorAll('details[data-parte]')];
  partes.forEach((d) => d.addEventListener('toggle', () => {
    guardar(CHAVE_ABERTOS, partes.filter((x) => x.open).map((x) => x.dataset.parte));
  }));

  zona.querySelector('[data-imprimir]').addEventListener('click', () => {
    guardarPlano(p);
    zona.querySelector('[data-folha]').innerHTML = folhaHtml(p, lerEncontro());
    window.print();
  });

  // Ao sair do ecrã, guarda logo o que estiver por guardar.
  window.addEventListener('hashchange', () => { clearTimeout(espera); guardarPlano(p); }, { once: true });
}

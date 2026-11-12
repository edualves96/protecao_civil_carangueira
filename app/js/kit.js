// Listas para marcar com grupos: o kit de emergência (em casa) e a mochila de
// emergência (para sair de casa). O conteúdo vem de app/conteudo/kit.json e
// mochila.json, que se editam na página de edição. O que cada pessoa marcou fica
// guardado só neste aparelho, pelo nome do item: mudar o nome de um item deixa-o
// por marcar outra vez, sem mexer nos outros.

import { ler, guardar } from './store.js';
import { conteudo, esc } from './conteudo.js';
import { icon } from './icons.js';

// Ícone de cada grupo, escolhido na página de edição.
const ICONES = {
  agua: 'gota', saude: 'socorro', luz: 'lanterna', documentos: 'documento',
  roupa: 'roupa', ferramentas: 'ferramenta', familia: 'coracao', outro: 'caixa',
};

// "Água engarrafada para 3 dias" -> "agua-engarrafada-para-3-dias"
const idDe = (nome) => String(nome)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Até à versão 0.3.0, os itens marcados do kit guardavam-se por um código curto.
const ANTIGOS_KIT = {
  agua: 'Água engarrafada para 3 dias', comida: 'Comida para 3 dias', 'abre-latas': 'Abre-latas manual',
  socorros: 'Estojo de primeiros socorros', medicamentos: 'Medicamentos habituais', oculos: 'Óculos de reserva',
  higiene: 'Produtos de higiene', necessidades: 'Artigos para necessidades especiais',
  lanterna: 'Lanterna com pilhas de reserva', radio: 'Rádio portátil', bateria: 'Bateria externa carregada',
  copias: 'Cópias dos documentos', dinheiro: 'Dinheiro em notas e moedas', 'lista-contactos': 'Lista de contactos em papel',
  chaves: 'Chaves de reserva', 'muda-roupa': 'Uma muda de roupa', agasalho: 'Agasalho e impermeável',
  manta: 'Manta ou cobertor', canivete: 'Canivete multiusos', fita: 'Fita adesiva resistente',
  isqueiro: 'Isqueiro ou fósforos', luvas: 'Luvas de trabalho',
};

// Prazos de validade (água, comida, medicamentos, pilhas): guardam-se como "AAAA-MM".
// "Acaba em breve" = este mês ou o próximo.
const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
export function estadoValidade(mes, hoje = new Date()) {
  if (!/^\d{4}-\d{2}$/.test(mes || '')) return { estado: 'falta', texto: 'Indique até quando é válido' };
  const [a, m] = mes.split('-').map(Number);
  const dif = (a - hoje.getFullYear()) * 12 + (m - 1 - hoje.getMonth());
  const quando = `${MESES[m - 1]} ${a}`;
  if (dif < 0) return { estado: 'expirado', texto: `Passou de prazo (${quando})` };
  if (dif <= 1) return { estado: 'breve', texto: `Acaba em breve (${quando})` };
  return { estado: 'ok', texto: `Válido até ${quando}` };
}

function criarLista(nome, { chave, chaveAbertos, antigos = {}, nomeFim, textoFim }) {
  const chaveVal = `${chave}-validades`;
  const lerVal = () => { const v = ler(chaveVal, {}); return v && typeof v === 'object' ? v : {}; };

  function categorias() {
    const usados = new Set();
    return (conteudo[nome]?.categorias || []).map((c, n) => ({
      nome: c.nome || '',
      dica: c.dica || '',
      icone: ICONES[c.icone] || ICONES.outro,
      chave: `c${n}`,
      itens: (c.itens || []).filter((i) => i && i.nome).map((i) => {
        let id = idDe(i.nome) || 'item';
        while (usados.has(id)) id += '-2';
        usados.add(id);
        return { id, nome: i.nome, nota: i.nota || '', validade: Boolean(i.validade) };
      }),
    }));
  }

  const idsDe = (cats) => cats.flatMap((c) => c.itens.map((i) => i.id));

  function marcados(cats = categorias()) {
    const todos = idsDe(cats);
    const guardados = ler(chave, []);
    const lista = Array.isArray(guardados) ? guardados.map((id) => (antigos[id] ? idDe(antigos[id]) : id)) : [];
    return new Set(lista.filter((id) => todos.includes(id)));
  }

  function marcar(id, feito, cats) {
    const atuais = marcados(cats);
    if (feito) atuais.add(id);
    else atuais.delete(id);
    guardar(chave, [...atuais]);
    return atuais;
  }

  const feitosNa = (c, feitos) => c.itens.filter((i) => feitos.has(i.id)).length;
  const completa = (c, feitos) => c.itens.length > 0 && feitosNa(c, feitos) === c.itens.length;
  const contaCategoria = (c, feitos) => (completa(c, feitos) ? 'Completo' : `${feitosNa(c, feitos)} de ${c.itens.length}`);
  const percentagem = (feitos, total) => (total ? Math.round(feitos / total * 100) : 0);
  // Efeito Zeigarnik: mostrar o que falta ajuda a voltar e acabar.
  const faltam = (feitos, total) => (feitos > 0 && feitos < total ? ` · faltam ${total - feitos}` : '');

  // Grupos abertos, guardados neste aparelho. Na primeira visita abre-se o primeiro
  // grupo por completar, para mostrar logo por onde começar.
  function abertos(cats, feitos) {
    const guardados = ler(chaveAbertos, null);
    if (Array.isArray(guardados)) return new Set(guardados);
    const primeiro = cats.find((c) => !completa(c, feitos));
    return new Set(primeiro ? [primeiro.chave] : []);
  }

  // Itens marcados cujo prazo já passou ou acaba em breve (para o aviso no início).
  function alertas() {
    const cats = categorias();
    const feitos = marcados(cats);
    const val = lerVal();
    return cats.flatMap((c) => c.itens
      .filter((i) => i.validade && feitos.has(i.id) && val[i.id])
      .map((i) => ({ nome: i.nome, ...estadoValidade(val[i.id]) }))
      .filter((x) => x.estado === 'expirado' || x.estado === 'breve'));
  }

  // Aviso no grupo: quantos itens marcados estão fora de prazo ou a acabar.
  function alertaGrupo(c, feitos, val) {
    const estados = c.itens.filter((i) => i.validade && feitos.has(i.id) && val[i.id]).map((i) => estadoValidade(val[i.id]).estado);
    const exp = estados.filter((e) => e === 'expirado').length;
    const breve = estados.filter((e) => e === 'breve').length;
    if (exp) return `<span class="kit-alerta kit-alerta-exp">${icon('alert')}${exp} fora de prazo</span>`;
    if (breve) return `<span class="kit-alerta kit-alerta-breve">${icon('alert')}${breve} ${breve === 1 ? 'acaba' : 'acabam'} em breve</span>`;
    return '';
  }

  const campoValidade = (i, aberto, val) => {
    if (!i.validade) return '';
    const est = estadoValidade(val[i.id]);
    return `
      <div class="val" data-val-for="${i.id}"${aberto ? '' : ' hidden'}>
        <label class="val-l" for="val-${nome}-${i.id}">Válido até</label>
        <input class="val-i" id="val-${nome}-${i.id}" type="month" value="${esc(val[i.id] || '')}" data-val="${i.id}" aria-describedby="val-e-${nome}-${i.id}">
        <span class="val-e val-${est.estado}" id="val-e-${nome}-${i.id}" data-val-e="${i.id}">${est.texto}</span>
      </div>`;
  };

  // Para o início: quantos itens estão prontos.
  function resumo() {
    const cats = categorias();
    const total = idsDe(cats).length;
    const feitos = marcados(cats).size;
    return { feitos, total, fracao: total ? feitos / total : 0 };
  }

  // Corpo do ecrã (o cabeçalho vem de screens.js). `antes` e `depois` entram antes
  // e depois dos grupos (a mochila usa-os para o guia de arrumação).
  function corpo({ antes = '', depois = '' } = {}) {
    const cats = categorias();
    const feitos = marcados(cats);
    const total = idsDe(cats).length;
    const textos = conteudo[nome] || {};
    const abrir = abertos(cats, feitos);
    const tudo = total > 0 && feitos.size === total;
    const val = lerVal();

    const html = cats.map((c) => `
      <details class="kit-cat${completa(c, feitos) ? ' feito' : ''}" data-kit-cat="${c.chave}"${abrir.has(c.chave) ? ' open' : ''}>
        <summary class="kit-sum">
          <span class="kit-ic" aria-hidden="true">${icon(c.icone, 'i kit-ic-cat')}${icon('check', 'i kit-ic-ok')}</span>
          <span class="kit-sum-txt">
            <h2 class="kit-h">${esc(c.nome)}</h2>
            <span class="kit-segs" aria-hidden="true">${c.itens.map((i) => `<i${feitos.has(i.id) ? ' class="on"' : ''}></i>`).join('')}</span>
            <span data-kit-alerta>${alertaGrupo(c, feitos, val)}</span>
          </span>
          <span class="kit-n" data-kit-n><span class="vh">: </span>${contaCategoria(c, feitos)}</span>
          ${icon('chev', 'i chev')}
        </summary>
        <div class="kit-corpo">
          ${c.dica ? `<p class="kit-dica">${esc(c.dica)}</p>` : ''}
          <ul class="checks">
            ${c.itens.map((i) => `
              <li>
                <label class="check">
                  <input type="checkbox" data-kit="${i.id}"${feitos.has(i.id) ? ' checked' : ''}>
                  <span class="check-txt">
                    <span class="check-t">${esc(i.nome)}</span>
                    ${i.nota ? `<span class="check-d">${esc(i.nota)}</span>` : ''}
                  </span>
                </label>
                ${campoValidade(i, feitos.has(i.id), val)}
              </li>`).join('')}
          </ul>
        </div>
      </details>`).join('');

    return `
      <div data-kit-lista>
        ${textos.intro ? `<p class="intro">${esc(textos.intro)}</p>` : ''}
        <div class="kit-prog${tudo ? ' feito' : ''}" data-kit-prog>
          <p class="kit-num"><span class="pct" data-kit-feitos>${feitos.size}</span> <span class="kit-de">de ${total} prontos<span class="kit-faltam" data-kit-faltam>${faltam(feitos.size, total)}</span></span></p>
          <div class="seg" aria-hidden="true"><span><i data-kit-barra style="width:${percentagem(feitos.size, total)}%"></i></span></div>
          <p class="kit-fim"${tudo ? '' : ' hidden'} data-kit-fim>${icon('check')}${textoFim}</p>
        </div>
        <p class="vh" aria-live="polite" data-kit-aviso></p>
        ${antes}
        <div class="kit-ctrl"><button class="kit-todos" type="button" data-kit-todos>${abrir.size === cats.length ? 'Fechar todos' : 'Abrir todos'}</button></div>
        <div class="kit-grupos">${html}</div>
        ${depois}
        ${textos.rodape ? `<p class="hint">${esc(textos.rodape)}</p>` : ''}
      </div>`;
  }

  // Liga as caixas de marcar e os grupos depois de o ecrã aparecer.
  function montar(raiz) {
    const lista = raiz.querySelector('[data-kit-lista]');
    if (!lista) return;
    const cats = categorias();
    const total = idsDe(cats).length;
    const grupos = [...lista.querySelectorAll('details.kit-cat')];
    const botaoTodos = lista.querySelector('[data-kit-todos]');

    // Repete uma animação curta numa caixa ou num ícone (só quando a pessoa toca).
    const piscar = (el, classe) => {
      el.classList.remove(classe);
      void el.getBoundingClientRect();
      el.classList.add(classe);
    };

    const guardarAbertos = () => {
      guardar(chaveAbertos, grupos.filter((g) => g.open).map((g) => g.dataset.kitCat));
      botaoTodos.textContent = grupos.every((g) => g.open) ? 'Fechar todos' : 'Abrir todos';
    };
    grupos.forEach((g) => g.addEventListener('toggle', guardarAbertos));
    botaoTodos.addEventListener('click', () => {
      const abrir = !grupos.every((g) => g.open);
      grupos.forEach((g) => { g.open = abrir; });
      guardarAbertos();
    });

    lista.addEventListener('change', (e) => {
      const caixa = e.target.closest('input[data-kit]');
      if (!caixa) return;
      const feitos = marcar(caixa.dataset.kit, caixa.checked, cats);
      if (caixa.checked) piscar(caixa, 'pop');
      // Itens com prazo: ao marcar, aparece o campo "Válido até".
      const caixaVal = lista.querySelector(`[data-val-for="${caixa.dataset.kit}"]`);
      if (caixaVal) caixaVal.hidden = !caixa.checked;

      lista.querySelector('[data-kit-feitos]').textContent = feitos.size;
      lista.querySelector('[data-kit-faltam]').textContent = faltam(feitos.size, total);
      lista.querySelector('[data-kit-barra]').style.width = `${percentagem(feitos.size, total)}%`;
      const tudo = total > 0 && feitos.size === total;
      lista.querySelector('[data-kit-prog]').classList.toggle('feito', tudo);
      lista.querySelector('[data-kit-fim]').hidden = !tudo;

      let aviso = `${feitos.size} de ${total} prontos.`;
      cats.forEach((c) => {
        const g = lista.querySelector(`details[data-kit-cat="${c.chave}"]`);
        const antes = g.classList.contains('feito');
        const agora = completa(c, feitos);
        g.classList.toggle('feito', agora);
        g.querySelector('[data-kit-n]').innerHTML = `<span class="vh">: </span>${contaCategoria(c, feitos)}`;
        g.querySelectorAll('.kit-segs i').forEach((seg, n) => seg.classList.toggle('on', feitos.has(c.itens[n].id)));
        g.querySelector('[data-kit-alerta]').innerHTML = alertaGrupo(c, feitos, lerVal());
        if (agora && !antes) {
          piscar(g.querySelector('.kit-ic'), 'acabou');
          aviso += ` ${c.nome}: completo.`;
        }
      });
      if (tudo) aviso += ` ${nomeFim}.`;
      lista.querySelector('[data-kit-aviso]').textContent = aviso;
    });

    // Prazo de validade: guarda o mês e mostra logo se está em dia, a acabar ou fora de prazo.
    lista.addEventListener('input', (e) => {
      const campo = e.target.closest('input[data-val]');
      if (!campo) return;
      const id = campo.dataset.val;
      const val = lerVal();
      if (campo.value) val[id] = campo.value; else delete val[id];
      guardar(chaveVal, val);
      const est = estadoValidade(val[id]);
      const rotulo = lista.querySelector(`[data-val-e="${id}"]`);
      rotulo.className = `val-e val-${est.estado}`;
      rotulo.textContent = est.texto;
      const feitos = marcados(cats);
      const c = cats.find((x) => x.itens.some((i) => i.id === id));
      if (c) lista.querySelector(`details[data-kit-cat="${c.chave}"] [data-kit-alerta]`).innerHTML = alertaGrupo(c, feitos, val);
    });
  }

  return { resumo, corpo, montar, alertas };
}

export const kit = criarLista('kit', {
  chave: 'kit', chaveAbertos: 'kit-abertos', antigos: ANTIGOS_KIT,
  nomeFim: 'Kit completo', textoFim: 'Kit completo. Reveja-o de 6 em 6 meses.',
});
export const mochila = criarLista('mochila', {
  chave: 'mochila', chaveAbertos: 'mochila-abertos',
  nomeFim: 'Mochila pronta', textoFim: 'Mochila pronta. Deixe-a junto à porta e reveja-a de 6 em 6 meses.',
});

export const resumoKit = kit.resumo;
export const corpoKit = () => kit.corpo();
export const montarKit = kit.montar;

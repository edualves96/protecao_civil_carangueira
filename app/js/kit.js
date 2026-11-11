// Kit de emergência para 72 horas: lista por categorias, guardada só neste aparelho.
// A lista vem de app/conteudo/kit.json, que se edita na página de edição.
// O que cada pessoa marcou fica guardado pelo nome do item: mudar o nome de um item
// deixa-o por marcar outra vez, sem mexer nos outros.

import { ler, guardar } from './store.js';
import { conteudo, esc } from './conteudo.js';
import { icon } from './icons.js';

const CHAVE = 'kit';
const CHAVE_ABERTOS = 'kit-abertos';

// Ícone de cada categoria, escolhido na página de edição.
const ICONES = {
  agua: 'gota', saude: 'socorro', luz: 'lanterna', documentos: 'documento',
  roupa: 'roupa', ferramentas: 'ferramenta', outro: 'caixa',
};

// "Água engarrafada para 3 dias" -> "agua-engarrafada-para-3-dias"
const idDe = (nome) => String(nome)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Até à versão 0.3.0, os itens marcados guardavam-se por um código curto.
const ANTIGOS = {
  agua: 'Água engarrafada para 3 dias', comida: 'Comida para 3 dias', 'abre-latas': 'Abre-latas manual',
  socorros: 'Estojo de primeiros socorros', medicamentos: 'Medicamentos habituais', oculos: 'Óculos de reserva',
  higiene: 'Produtos de higiene', necessidades: 'Artigos para necessidades especiais',
  lanterna: 'Lanterna com pilhas de reserva', radio: 'Rádio portátil', bateria: 'Bateria externa carregada',
  copias: 'Cópias dos documentos', dinheiro: 'Dinheiro em notas e moedas', 'lista-contactos': 'Lista de contactos em papel',
  chaves: 'Chaves de reserva', 'muda-roupa': 'Uma muda de roupa', agasalho: 'Agasalho e impermeável',
  manta: 'Manta ou cobertor', canivete: 'Canivete multiusos', fita: 'Fita adesiva resistente',
  isqueiro: 'Isqueiro ou fósforos', luvas: 'Luvas de trabalho',
};

function categorias() {
  const usados = new Set();
  return (conteudo.kit?.categorias || []).map((c, n) => ({
    nome: c.nome || '',
    dica: c.dica || '',
    icone: ICONES[c.icone] || ICONES.outro,
    chave: `c${n}`,
    itens: (c.itens || []).filter((i) => i && i.nome).map((i) => {
      let id = idDe(i.nome) || 'item';
      while (usados.has(id)) id += '-2';
      usados.add(id);
      return { id, nome: i.nome, nota: i.nota || '' };
    }),
  }));
}

const idsDe = (cats) => cats.flatMap((c) => c.itens.map((i) => i.id));

function marcados(cats = categorias()) {
  const todos = idsDe(cats);
  const guardados = ler(CHAVE, []);
  const lista = Array.isArray(guardados) ? guardados.map((id) => (ANTIGOS[id] ? idDe(ANTIGOS[id]) : id)) : [];
  return new Set(lista.filter((id) => todos.includes(id)));
}

function marcar(id, feito, cats) {
  const atuais = marcados(cats);
  if (feito) atuais.add(id);
  else atuais.delete(id);
  guardar(CHAVE, [...atuais]);
  return atuais;
}

// Para o início: quantos itens estão prontos.
export function resumoKit() {
  const cats = categorias();
  const total = idsDe(cats).length;
  const feitos = marcados(cats).size;
  return { feitos, total, fracao: total ? feitos / total : 0 };
}

const textoProgresso = (feitos, total) => `${feitos} de ${total} prontos`;
const feitosNa = (c, feitos) => c.itens.filter((i) => feitos.has(i.id)).length;
const completa = (c, feitos) => c.itens.length > 0 && feitosNa(c, feitos) === c.itens.length;
const contaCategoria = (c, feitos) => (completa(c, feitos) ? 'Completo' : `${feitosNa(c, feitos)} de ${c.itens.length}`);
const percentagem = (feitos, total) => (total ? Math.round(feitos / total * 100) : 0);

// Grupos abertos, guardados neste aparelho. Na primeira visita abre-se o primeiro
// grupo por completar, para mostrar logo por onde começar.
function abertos(cats, feitos) {
  const guardados = ler(CHAVE_ABERTOS, null);
  if (Array.isArray(guardados)) return new Set(guardados);
  const primeiro = cats.find((c) => !completa(c, feitos));
  return new Set(primeiro ? [primeiro.chave] : []);
}

// Corpo do ecrã do kit (o cabeçalho vem de screens.js).
export function corpoKit() {
  const cats = categorias();
  const feitos = marcados(cats);
  const total = idsDe(cats).length;
  const textos = conteudo.kit || {};
  const abrir = abertos(cats, feitos);
  const tudo = total > 0 && feitos.size === total;

  const html = cats.map((c) => `
    <details class="kit-cat${completa(c, feitos) ? ' feito' : ''}" data-kit-cat="${c.chave}"${abrir.has(c.chave) ? ' open' : ''}>
      <summary class="kit-sum">
        <span class="kit-ic" aria-hidden="true">${icon(c.icone, 'i kit-ic-cat')}${icon('check', 'i kit-ic-ok')}</span>
        <span class="kit-sum-txt">
          <h2 class="kit-h">${esc(c.nome)}</h2>
          <span class="kit-segs" aria-hidden="true">${c.itens.map((i) => `<i${feitos.has(i.id) ? ' class="on"' : ''}></i>`).join('')}</span>
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
            </li>`).join('')}
        </ul>
      </div>
    </details>`).join('');

  return `
    <div data-kit-lista>
      ${textos.intro ? `<p class="intro">${esc(textos.intro)}</p>` : ''}
      <div class="kit-prog${tudo ? ' feito' : ''}" data-kit-prog>
        <p class="kit-num"><span class="pct" data-kit-feitos>${feitos.size}</span> <span class="kit-de">de ${total} prontos</span></p>
        <div class="seg" aria-hidden="true"><span><i data-kit-barra style="width:${percentagem(feitos.size, total)}%"></i></span></div>
        <p class="kit-fim"${tudo ? '' : ' hidden'} data-kit-fim>${icon('check')}Kit completo. Reveja-o de 6 em 6 meses.</p>
      </div>
      <p class="vh" aria-live="polite" data-kit-aviso></p>
      <div class="kit-ctrl"><button class="kit-todos" type="button" data-kit-todos>${abrir.size === cats.length ? 'Fechar todos' : 'Abrir todos'}</button></div>
      <div class="kit-grupos">${html}</div>
      ${textos.rodape ? `<p class="hint">${esc(textos.rodape)}</p>` : ''}
    </div>`;
}

// Liga as caixas de marcar e os grupos depois de o ecrã aparecer.
export function montarKit(raiz) {
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
    guardar(CHAVE_ABERTOS, grupos.filter((g) => g.open).map((g) => g.dataset.kitCat));
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

    lista.querySelector('[data-kit-feitos]').textContent = feitos.size;
    lista.querySelector('[data-kit-barra]').style.width = `${percentagem(feitos.size, total)}%`;
    const tudo = total > 0 && feitos.size === total;
    lista.querySelector('[data-kit-prog]').classList.toggle('feito', tudo);
    lista.querySelector('[data-kit-fim]').hidden = !tudo;

    let aviso = `${textoProgresso(feitos.size, total)}.`;
    cats.forEach((c) => {
      const g = lista.querySelector(`details[data-kit-cat="${c.chave}"]`);
      const antes = g.classList.contains('feito');
      const agora = completa(c, feitos);
      g.classList.toggle('feito', agora);
      g.querySelector('[data-kit-n]').innerHTML = `<span class="vh">: </span>${contaCategoria(c, feitos)}`;
      g.querySelectorAll('.kit-segs i').forEach((seg, n) => seg.classList.toggle('on', feitos.has(c.itens[n].id)));
      if (agora && !antes) {
        piscar(g.querySelector('.kit-ic'), 'acabou');
        aviso += ` ${c.nome}: completo.`;
      }
    });
    if (tudo) aviso += ' Kit completo.';
    lista.querySelector('[data-kit-aviso]').textContent = aviso;
  });
}

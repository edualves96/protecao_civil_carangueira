// Kit de emergência para 72 horas: lista por categorias, guardada só neste aparelho.
// A lista vem de app/conteudo/kit.json, que se edita na página de edição.
// O que cada pessoa marcou fica guardado pelo nome do item: mudar o nome de um item
// deixa-o por marcar outra vez, sem mexer nos outros.

import { ler, guardar } from './store.js';
import { conteudo, esc } from './conteudo.js';

const CHAVE = 'kit';

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
const contaCategoria = (c, feitos) => `${c.itens.filter((i) => feitos.has(i.id)).length} de ${c.itens.length}`;
const percentagem = (feitos, total) => (total ? Math.round(feitos / total * 100) : 0);

// Corpo do ecrã do kit (o cabeçalho vem de screens.js).
export function corpoKit() {
  const cats = categorias();
  const feitos = marcados(cats);
  const total = idsDe(cats).length;
  const textos = conteudo.kit || {};

  const html = cats.map((c) => `
    <section class="kit-cat" aria-labelledby="kc-${c.chave}">
      <h2 class="sh kit-h" id="kc-${c.chave}">${esc(c.nome)} <span class="kit-n" data-kit-cat="${c.chave}">${contaCategoria(c, feitos)}</span></h2>
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
    </section>`).join('');

  return `
    <div data-kit-lista>
      ${textos.intro ? `<p class="intro">${esc(textos.intro)}</p>` : ''}
      <div class="kit-prog">
        <p class="kit-num"><span class="pct" data-kit-feitos>${feitos.size}</span> <span class="kit-de">de ${total} prontos</span></p>
        <div class="seg" aria-hidden="true"><span><i data-kit-barra style="width:${percentagem(feitos.size, total)}%"></i></span></div>
      </div>
      <p class="vh" aria-live="polite" data-kit-aviso></p>
      ${html}
      ${textos.rodape ? `<p class="hint">${esc(textos.rodape)}</p>` : ''}
    </div>`;
}

// Liga as caixas de marcar depois de o ecrã aparecer.
export function montarKit(raiz) {
  const lista = raiz.querySelector('[data-kit-lista]');
  if (!lista) return;
  const cats = categorias();
  const total = idsDe(cats).length;

  lista.addEventListener('change', (e) => {
    const caixa = e.target.closest('input[data-kit]');
    if (!caixa) return;
    const feitos = marcar(caixa.dataset.kit, caixa.checked, cats);

    lista.querySelector('[data-kit-feitos]').textContent = feitos.size;
    lista.querySelector('[data-kit-barra]').style.width = `${percentagem(feitos.size, total)}%`;
    lista.querySelector('[data-kit-aviso]').textContent = `${textoProgresso(feitos.size, total)}.`;
    cats.forEach((c) => {
      lista.querySelector(`[data-kit-cat="${c.chave}"]`).textContent = contaCategoria(c, feitos);
    });
  });
}

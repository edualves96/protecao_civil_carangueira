// Kit de emergência para 72 horas: lista por categorias, guardada só neste aparelho.
// Guarda-se a lista de itens marcados (por id), por isso pode acrescentar ou retirar
// itens sem estragar o que as pessoas já marcaram.

import { ler, guardar } from './store.js';

export const KIT = [
  {
    id: 'agua-comida',
    nome: 'Água e comida',
    dica: 'Para 3 dias. Ajuste ao número de pessoas da casa.',
    itens: [
      { id: 'agua', nome: 'Água engarrafada para 3 dias', nota: 'Pelo menos 3 litros por pessoa, por dia: cerca de 9 litros por pessoa.' },
      { id: 'comida', nome: 'Comida para 3 dias', nota: 'Que não precise de frio nem de ser cozinhada e que a família goste de comer: conservas, bolachas, frutos secos.' },
      { id: 'abre-latas', nome: 'Abre-latas manual' },
    ],
  },
  {
    id: 'saude',
    nome: 'Saúde e higiene',
    dica: 'Inclua o que cada pessoa da casa usa todos os dias.',
    itens: [
      { id: 'socorros', nome: 'Estojo de primeiros socorros', nota: 'Veja de vez em quando o que tem e os prazos de validade.' },
      { id: 'medicamentos', nome: 'Medicamentos habituais', nota: 'Para pelo menos 3 dias, com a lista dos medicamentos e uma cópia das receitas.' },
      { id: 'oculos', nome: 'Óculos de reserva', nota: 'E outras coisas de que precise todos os dias, como pilhas para o aparelho auditivo.' },
      { id: 'higiene', nome: 'Produtos de higiene', nota: 'Toalhetes, sabonete, papel higiénico, produtos menstruais e sacos do lixo.' },
      { id: 'necessidades', nome: 'Artigos para necessidades especiais', nota: 'Para bebés, pessoas dependentes, animais de estimação ou quem usa canadianas, andarilho ou cadeira de rodas.' },
    ],
  },
  {
    id: 'luz',
    nome: 'Luz e comunicação',
    dica: 'Para ter luz e saber o que se passa se faltar a energia.',
    itens: [
      { id: 'lanterna', nome: 'Lanterna com pilhas de reserva' },
      { id: 'radio', nome: 'Rádio portátil', nota: 'A pilhas ou de dar à manivela, para ouvir as indicações da Proteção Civil sem luz nem internet.' },
      { id: 'bateria', nome: 'Bateria externa carregada', nota: 'E o cabo do telemóvel.' },
      { id: 'apito', nome: 'Apito', nota: 'Para pedir ajuda se ficar preso.' },
    ],
  },
  {
    id: 'documentos',
    nome: 'Documentos e dinheiro',
    dica: 'Guarde tudo junto, numa bolsa fácil de levar.',
    itens: [
      { id: 'copias', nome: 'Cópias dos documentos', nota: 'Cartão de Cidadão, cartão de utente, seguros e informação de saúde, num saco impermeável.' },
      { id: 'dinheiro', nome: 'Dinheiro em notas e moedas' },
      { id: 'lista-contactos', nome: 'Lista de contactos em papel', nota: 'Família, médico e vizinhos.' },
      { id: 'chaves', nome: 'Chaves de reserva', nota: 'De casa e do carro.' },
    ],
  },
  {
    id: 'roupa',
    nome: 'Roupa e abrigo',
    dica: 'Escolha conforme a estação do ano.',
    itens: [
      { id: 'muda-roupa', nome: 'Uma muda de roupa', nota: 'E calçado confortável e resistente.' },
      { id: 'agasalho', nome: 'Agasalho e impermeável' },
      { id: 'manta', nome: 'Manta ou cobertor', nota: 'Uma manta térmica ocupa pouco espaço.' },
    ],
  },
  {
    id: 'ferramentas',
    nome: 'Ferramentas',
    dica: 'Para pequenas reparações e para proteger as mãos.',
    itens: [
      { id: 'canivete', nome: 'Canivete multiusos' },
      { id: 'fita', nome: 'Fita adesiva resistente' },
      { id: 'isqueiro', nome: 'Isqueiro ou fósforos', nota: 'Guardados num saco impermeável.' },
      { id: 'luvas', nome: 'Luvas de trabalho' },
    ],
  },
];

const CHAVE = 'kit';
const TODOS = KIT.flatMap((c) => c.itens.map((i) => i.id));

function marcados() {
  const guardados = ler(CHAVE, []);
  return new Set(Array.isArray(guardados) ? guardados.filter((id) => TODOS.includes(id)) : []);
}

function marcar(id, feito) {
  const atuais = marcados();
  if (feito) atuais.add(id);
  else atuais.delete(id);
  guardar(CHAVE, [...atuais]);
  return atuais;
}

// Para o início: quantos itens estão prontos.
export function resumoKit() {
  const feitos = marcados().size;
  return { feitos, total: TODOS.length, fracao: feitos / TODOS.length };
}

const textoProgresso = (feitos, total) => `${feitos} de ${total} prontos`;
const contaCategoria = (c, feitos) => `${c.itens.filter((i) => feitos.has(i.id)).length} de ${c.itens.length}`;

// Corpo do ecrã do kit (o cabeçalho vem de screens.js).
export function corpoKit() {
  const feitos = marcados();
  const total = TODOS.length;

  const categorias = KIT.map((c) => `
    <section class="kit-cat" aria-labelledby="kc-${c.id}">
      <h2 class="sh kit-h" id="kc-${c.id}">${c.nome} <span class="kit-n" data-kit-cat="${c.id}">${contaCategoria(c, feitos)}</span></h2>
      ${c.dica ? `<p class="kit-dica">${c.dica}</p>` : ''}
      <ul class="checks">
        ${c.itens.map((i) => `
          <li>
            <label class="check">
              <input type="checkbox" data-kit="${i.id}"${feitos.has(i.id) ? ' checked' : ''}>
              <span class="check-txt">
                <span class="check-t">${i.nome}</span>
                ${i.nota ? `<span class="check-d">${i.nota}</span>` : ''}
              </span>
            </label>
          </li>`).join('')}
      </ul>
    </section>`).join('');

  return `
    <div data-kit-lista>
      <p class="intro">O essencial para aguentar 3 dias (72 horas) sem ajuda, sem luz ou sem água da torneira. Marque o que já tem e ajuste a lista às pessoas da sua família.</p>
      <div class="kit-prog">
        <p class="kit-num"><span class="pct" data-kit-feitos>${feitos.size}</span> <span class="kit-de">de ${total} prontos</span></p>
        <div class="seg" aria-hidden="true"><span><i data-kit-barra style="width:${Math.round(feitos.size / total * 100)}%"></i></span></div>
      </div>
      <p class="vh" aria-live="polite" data-kit-aviso></p>
      ${categorias}
      <p class="hint">Fica guardado só neste aparelho. Reveja o kit de 6 em 6 meses e troque a água, a comida e as pilhas antes de passarem do prazo.</p>
    </div>`;
}

// Liga as caixas de marcar depois de o ecrã aparecer.
export function montarKit(raiz) {
  const lista = raiz.querySelector('[data-kit-lista]');
  if (!lista) return;
  const total = TODOS.length;

  lista.addEventListener('change', (e) => {
    const caixa = e.target.closest('input[data-kit]');
    if (!caixa) return;
    const feitos = marcar(caixa.dataset.kit, caixa.checked);

    lista.querySelector('[data-kit-feitos]').textContent = feitos.size;
    lista.querySelector('[data-kit-barra]').style.width = `${Math.round(feitos.size / total * 100)}%`;
    lista.querySelector('[data-kit-aviso]').textContent = `${textoProgresso(feitos.size, total)}.`;
    KIT.forEach((c) => {
      lista.querySelector(`[data-kit-cat="${c.id}"]`).textContent = contaCategoria(c, feitos);
    });
  });
}

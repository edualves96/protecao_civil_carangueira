// Imprimir (ou guardar em PDF) uma folha simples, a preto e branco, em A4.
// A folha é montada à parte e só ela aparece na impressão; o ecrã não muda.
// Sem bateria, o papel continua a funcionar.

import { esc } from './conteudo.js';

const hoje = () => new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function imprimir(conteudoHtml, titulo) {
  let folha = document.getElementById('folha');
  if (!folha) {
    folha = document.createElement('div');
    folha.id = 'folha';
    folha.className = 'folha';
    folha.setAttribute('aria-hidden', 'true');
    document.body.append(folha);
  }
  folha.innerHTML = `
    <header class="folha-cab"><b>Proteção Civil · Caranguejeira</b><span>upcc.pt · impresso a ${hoje()}</span></header>
    <h1>${esc(titulo)}</h1>
    ${conteudoHtml}
    <p class="folha-112">Em caso de emergência, ligue <b>112</b>.</p>`;

  const raiz = document.documentElement;
  const tituloAntes = document.title;
  document.title = titulo; // é o nome sugerido para o PDF
  raiz.classList.add('a-imprimir');
  const fim = () => {
    raiz.classList.remove('a-imprimir');
    document.title = tituloAntes;
    window.removeEventListener('afterprint', fim);
  };
  window.addEventListener('afterprint', fim);
  window.print();
}

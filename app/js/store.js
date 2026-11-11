// Guarda pequenas preferências neste aparelho. Nunca sai do telemóvel.
// O armazenamento pode não estar disponível (modo privado, definições do navegador),
// por isso a app tem de funcionar sem ele.

const PREFIXO = 'pcc:';

export function ler(chave, padrao) {
  try {
    const valor = localStorage.getItem(PREFIXO + chave);
    return valor === null ? padrao : JSON.parse(valor);
  } catch {
    return padrao;
  }
}

export function guardar(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: ignora */
  }
}

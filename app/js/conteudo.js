// Conteúdo editável da app: kit, contactos, guias e outros textos, em ficheiros JSON
// na pasta app/conteudo/. É editado na página de edição (Pages CMS, ver README) e
// carregado quando a app abre. Sem rede, o service worker entrega a última cópia.

const FICHEIROS = ['kit', 'mochila', 'pontos', 'contactos', 'guias', 'textos'];

export const conteudo = {};

export async function carregarConteudo() {
  await Promise.all(FICHEIROS.map(async (nome) => {
    const resposta = await fetch(`conteudo/${nome}.json`, { cache: 'no-cache' });
    if (!resposta.ok) throw new Error(`${nome}: ${resposta.status}`);
    conteudo[nome] = await resposta.json();
  }));
}

// O texto vindo da edição entra sempre como texto, nunca como HTML.
const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);

// Uma linha em branco separa parágrafos.
export const paragrafos = (texto) => String(texto ?? '')
  .split(/\n\s*\n/)
  .map((p) => p.trim())
  .filter(Boolean)
  .map((p) => `<p>${esc(p)}</p>`)
  .join('');

// "808 24 24 24" -> "808242424", para usar em href="tel:…"
export const paraTel = (num) => String(num).replace(/[^\d+]/g, '');

// Só ligações para sites (nunca "javascript:" ou outros esquemas).
export const ligacaoSegura = (url) => (/^https?:\/\//i.test(String(url || '').trim()) ? String(url).trim() : '');

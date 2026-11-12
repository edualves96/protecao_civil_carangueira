// Cópia de segurança: os dados da pessoa (kit, mochila, plano, pontos de encontro,
// simulacros…) só existem neste aparelho. Para mudar de telemóvel, guarda-se um
// ficheiro e repõe-se no novo. Os dados do IPMA e do Fogos.pt não entram: voltam a vir.

import { icon } from './icons.js';
import { VERSAO } from './versao.js';

const PREFIXO = 'pcc:';
const FORA = ['ipma-avisos', 'ipma-sismos', 'fogos'];

function lerTudo() {
  const dados = {};
  try {
    for (let n = 0; n < localStorage.length; n += 1) {
      const chave = localStorage.key(n);
      if (!chave || !chave.startsWith(PREFIXO)) continue;
      const nome = chave.slice(PREFIXO.length);
      if (FORA.includes(nome)) continue;
      dados[nome] = JSON.parse(localStorage.getItem(chave));
    }
  } catch { /* sem armazenamento */ }
  return dados;
}

export function corpoCopia() {
  return `
    <h2>Os seus dados</h2>
    <p>O kit, a mochila e o plano da família ficam só neste aparelho. Se mudar de telemóvel, guarde uma cópia e reponha-a no novo.</p>
    <div class="copia">
      <button class="btn-copia" type="button" data-copia-guardar>${icon('download')}Guardar uma cópia</button>
      <label class="btn-copia btn-copia-2">${icon('share')}Repor uma cópia<input type="file" accept="application/json,.json" data-copia-repor hidden></label>
    </div>
    <p class="copia-msg" aria-live="polite" data-copia-msg></p>`;
}

export function montarCopia(raiz) {
  const msg = raiz.querySelector('[data-copia-msg]');
  raiz.querySelector('[data-copia-guardar]')?.addEventListener('click', () => {
    const dados = lerTudo();
    const hoje = new Date().toISOString().slice(0, 10);
    const ficheiro = new Blob([JSON.stringify({ app: 'upcc', versao: VERSAO, data: new Date().toISOString(), dados }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(ficheiro);
    a.download = `upcc-copia-${hoje}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    msg.textContent = `Cópia guardada (${Object.keys(dados).length} partes). Guarde o ficheiro num sítio seguro, por exemplo no email.`;
  });

  raiz.querySelector('[data-copia-repor]')?.addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const copia = JSON.parse(await f.text());
      if (copia?.app !== 'upcc' || !copia.dados || typeof copia.dados !== 'object') throw new Error('formato');
      const quando = copia.data ? new Date(copia.data).toLocaleDateString('pt-PT') : 'data desconhecida';
      // eslint-disable-next-line no-alert
      if (!confirm(`Repor a cópia de ${quando}? Substitui o que está guardado neste aparelho.`)) return;
      Object.entries(copia.dados).forEach(([nome, valor]) => {
        if (!/^[a-z0-9-]+$/.test(nome) || FORA.includes(nome)) return;
        localStorage.setItem(PREFIXO + nome, JSON.stringify(valor));
      });
      msg.textContent = 'Cópia reposta. A abrir a app de novo…';
      setTimeout(() => location.reload(), 800);
    } catch {
      msg.textContent = 'Este ficheiro não é uma cópia desta app.';
    }
  });
}

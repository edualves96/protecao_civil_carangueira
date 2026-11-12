// Busca as ocorrências ativas no Fogos.pt e guarda as do distrito de Leiria em
// app/dados/fogos.json, que a app lê. Corre no GitHub Actions de 10 em 10 minutos.
//
// A chave da API fica num segredo do GitHub (FOGOS_API_KEY) e nunca vai para a app:
// a app é pública e qualquer pessoa veria uma chave escrita no código.
// Para testar no computador:  FOGOS_API_KEY=... node scripts/fogos.mjs
//
// Termos do Fogos.pt: indicar sempre "Fonte: Fogos.pt" com ligação, uso não comercial,
// e não usar como fonte única em emergência (https://fogos.pt/pt/api-termos).

import { mkdirSync, writeFileSync } from 'node:fs';

const CHAVE = process.env.FOGOS_API_KEY;
const SAIDA = 'app/dados/fogos.json';
const DISTRITO = 'Leiria';
const CARANGUEJEIRA = { lat: 39.7438, lon: -8.7084 };

const rad = (g) => (g * Math.PI) / 180;
function distancia(lat, lon) {
  const dLat = rad(lat - CARANGUEJEIRA.lat);
  const dLon = rad(lon - CARANGUEJEIRA.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(CARANGUEJEIRA.lat)) * Math.cos(rad(lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

const dados = { obtido: new Date().toISOString(), ok: false, total: 0, ocorrencias: [] };

if (!CHAVE) {
  console.warn('Falta o segredo FOGOS_API_KEY: a app vai mostrar "sem dados".');
} else {
  try {
    const resposta = await fetch('https://api.fogos.pt/v2/incidents/active', {
      headers: { 'X-API-Key': CHAVE, 'User-Agent': 'UPCC-Caranguejeira/1.0 (+https://upcc.pt)' },
      signal: AbortSignal.timeout(20000),
    });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const json = await resposta.json();
    const lista = Array.isArray(json.data) ? json.data : [];
    dados.ok = true;
    dados.total = lista.length;
    dados.ocorrencias = lista
      .filter((o) => o.district === DISTRITO && Number.isFinite(o.lat) && Number.isFinite(o.lng))
      .map((o) => ({
        id: String(o.id),
        natureza: o.natureza || '',
        incendio: Boolean(o.isFire),
        estado: o.status || '',
        codigo: Number(o.statusCode) || 0,
        cor: /^[0-9A-Fa-f]{6}$/.test(o.statusColor || '') ? `#${o.statusColor}` : '#8A8F96',
        inicio: o.dateTime?.sec ? o.dateTime.sec * 1000 : null,
        local: o.localidade || o.location || '',
        freguesia: o.freguesia || '',
        concelho: o.concelho || '',
        lat: o.lat,
        lon: o.lng,
        km: Math.round(distancia(o.lat, o.lng) * 10) / 10,
        operacionais: Number(o.man) || 0,
        terrestres: Number(o.terrain) || 0,
        aereos: Number(o.aerial) || 0,
        importante: Boolean(o.important),
      }))
      .sort((a, b) => a.km - b.km);
    console.log(`Fogos.pt: ${dados.total} ocorrências ativas no país, ${dados.ocorrencias.length} no distrito de ${DISTRITO}.`);
  } catch (erro) {
    console.warn(`Não foi possível obter dados do Fogos.pt: ${erro.message}`);
  }
}

mkdirSync('app/dados', { recursive: true });
writeFileSync(SAIDA, `${JSON.stringify(dados)}\n`);

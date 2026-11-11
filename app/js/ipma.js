// Dados públicos do IPMA: avisos meteorológicos e sismos.
// O IPMA aceita pedidos feitos diretamente do telemóvel, sem chave nem servidor nosso.
// A última resposta fica guardada no aparelho para se poder consultar sem rede.
// Condições do IPMA: indicar sempre a fonte, com ligação para o site (api.ipma.pt).

import { ler, guardar } from './store.js';

const API = 'https://api.ipma.pt/open-data';
export const SITE_AVISOS = 'https://www.ipma.pt/pt/otempo/prev-sam/';
export const SITE_SISMOS = 'https://www.ipma.pt/pt/geofisica/sismologia/';

const AREA_AVISOS = 'LRA'; // distrito de Leiria
const AREA_SISMOS = 7; // Continente e Madeira
const CARANGUEJEIRA = { lat: 39.746, lon: -8.707 };

const VALIDADE = 10 * 60 * 1000; // volta a pedir passados 10 minutos
const PAUSA_ERRO = 30 * 1000; // depois de uma falha, espera antes de tentar de novo
const ESPERA = 10 * 1000; // desiste de um pedido sem resposta passados 10 segundos
export const RECENTE = 6 * 60 * 60 * 1000; // sem atualizar há mais de 6 horas, não dizemos "Sem avisos"

/* ---------- Pedidos e cópia guardada ---------- */

async function pedir(url) {
  const controlo = new AbortController();
  const limite = setTimeout(() => controlo.abort(), ESPERA);
  try {
    const resposta = await fetch(url, { signal: controlo.signal, cache: 'no-cache' });
    if (!resposta.ok) throw new Error(`IPMA ${resposta.status}`);
    return await resposta.json();
  } finally {
    clearTimeout(limite);
  }
}

// Uma fonte de dados: pede ao IPMA, guarda o resultado e diz se mudou.
function fonte(chave, url, extrair) {
  let pedido = null;
  let ultimaTentativa = -Infinity;
  let falhou = false;

  return {
    guardado: () => ler(chave, null),
    falhou: () => falhou,
    atualizar() {
      if (pedido) return pedido;
      const antes = ler(chave, null);
      const agora = Date.now();
      if (antes && agora - antes.obtido < VALIDADE) return Promise.resolve({ pediu: false, mudou: false });
      if (agora - ultimaTentativa < PAUSA_ERRO) return Promise.resolve({ pediu: false, mudou: false });
      ultimaTentativa = agora;

      pedido = pedir(url)
        .then((json) => {
          const lista = extrair(json);
          const mudou = !antes || falhou || JSON.stringify(antes.lista) !== JSON.stringify(lista);
          guardar(chave, { obtido: Date.now(), lista });
          falhou = false;
          return { pediu: true, mudou };
        })
        .catch(() => {
          const mudou = !falhou;
          falhou = true;
          return { pediu: true, mudou };
        })
        .finally(() => { pedido = null; });
      return pedido;
    },
  };
}

export const avisos = fonte('ipma-avisos', `${API}/forecast/warnings/warnings_www.json`, (json) => {
  if (!Array.isArray(json)) throw new Error('formato');
  return json
    .filter((a) => a.idAreaAviso === AREA_AVISOS && a.awarenessLevelID !== 'green')
    .map((a) => ({
      tipo: a.awarenessTypeName,
      nivel: a.awarenessLevelID,
      inicio: a.startTime,
      fim: a.endTime,
      texto: (a.text || '').trim(),
    }));
});

export const sismos = fonte('ipma-sismos', `${API}/observation/seismic/${AREA_SISMOS}.json`, (json) => {
  if (!json || !Array.isArray(json.data)) throw new Error('formato');
  return json.data
    .map((s) => {
      const lat = Number(s.lat);
      const lon = Number(s.lon);
      const mag = Number(s.magnitud);
      return {
        hora: Date.parse(`${s.time}Z`), // o IPMA dá a hora dos sismos em UTC
        mag: mag > -9 ? mag : null, // -99 quer dizer que ainda não há magnitude
        km: Math.round(distancia(lat, lon)),
        rumo: Math.round(rumo(lat, lon)), // direção a partir de Caranguejeira, em graus (0 = norte)
        regiao: String(s.obsRegion || '').replace(/\s+/g, ' ').trim(),
        local: s.local || '',
        sentido: s.sensed === true,
        grau: s.degree || '',
      };
    })
    // Só o que interessa a quem vive em Caranguejeira: tudo até 100 km e, até 400 km,
    // os sismos sentidos ou com magnitude 3 ou mais. A Madeira e o Atlântico distante ficam de fora.
    .filter((s) => Number.isFinite(s.hora) && Number.isFinite(s.km)
      && (s.km <= 100 || (s.km <= 400 && (s.sentido || (s.mag !== null && s.mag >= 3)))));
});

function distancia(lat, lon) {
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(lat - CARANGUEJEIRA.lat);
  const dLon = rad(lon - CARANGUEJEIRA.lon);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(CARANGUEJEIRA.lat)) * Math.cos(rad(lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

function rumo(lat, lon) {
  const rad = (g) => (g * Math.PI) / 180;
  const dLon = rad(lon - CARANGUEJEIRA.lon);
  const y = Math.sin(dLon) * Math.cos(rad(lat));
  const x = Math.cos(rad(CARANGUEJEIRA.lat)) * Math.sin(rad(lat))
    - Math.sin(rad(CARANGUEJEIRA.lat)) * Math.cos(rad(lat)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/* ---------- Horas ---------- */

const LISBOA = 'Europe/Lisbon';
const fmtPartes = new Intl.DateTimeFormat('en-GB', {
  timeZone: LISBOA, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
});
const fmtHora = new Intl.DateTimeFormat('pt-PT', { timeZone: LISBOA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const fmtSemana = new Intl.DateTimeFormat('pt-PT', { timeZone: LISBOA, weekday: 'long' });
const fmtData = new Intl.DateTimeFormat('pt-PT', { timeZone: LISBOA, day: 'numeric', month: 'short' });

function partesLisboa(ms) {
  const p = Object.fromEntries(fmtPartes.formatToParts(ms).map((x) => [x.type, Number(x.value)]));
  return { ...p, utc: Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) };
}

// As horas dos avisos vêm sem fuso horário. Lemo-las como hora de Portugal
// continental, como no site do IPMA (a confirmar com o IPMA).
function horaPortugal(texto) {
  const [data, hora = '00:00'] = String(texto).split('T');
  const [a, m, d] = data.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  const comoUtc = Date.UTC(a, m - 1, d, h, min);
  const desvio = partesLisboa(comoUtc).utc - Math.floor(comoUtc / 60000) * 60000;
  return comoUtc - desvio;
}

const diaLisboa = (ms) => {
  const p = partesLisboa(ms);
  return Date.UTC(p.year, p.month - 1, p.day);
};

export const hora = (ms) => fmtHora.format(ms);

// "hoje", "amanhã", "quinta" ou "14 nov."
export function dia(ms, agora = Date.now()) {
  const dias = Math.round((diaLisboa(ms) - diaLisboa(agora)) / 864e5);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  if (dias === -1) return 'ontem';
  if (dias > 1 && dias < 7) return fmtSemana.format(ms).replace('-feira', '');
  return fmtData.format(ms);
}

export const quando = (ms, agora = Date.now()) => `${dia(ms, agora)} às ${hora(ms)}`;

// Meia-noite (hora de Portugal) do dia de `ms`, ou de `mais` dias depois.
export function meiaNoite(ms, mais = 0) {
  const p = partesLisboa(ms);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + mais));
  return horaPortugal(`${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}T00:00`);
}

/* ---------- Avisos do distrito ---------- */

export const NIVEIS = {
  yellow: { id: 'amarelo', nome: 'Aviso amarelo', peso: 1 },
  orange: { id: 'laranja', nome: 'Aviso laranja', peso: 2 },
  red: { id: 'vermelho', nome: 'Aviso vermelho', peso: 3 },
};

// Tipos de aviso do IPMA: nome a mostrar e guia "O que fazer se…" a abrir.
const TIPOS = {
  'Precipitação': { nome: 'Chuva forte', risco: 'cheias', guia: 'O que fazer com chuva forte' },
  'Vento': { nome: 'Vento forte', risco: 'tempestade', guia: 'O que fazer com vento forte' },
  'Trovoada': { nome: 'Trovoada', risco: 'tempestade', guia: 'O que fazer com trovoada' },
  'Tempo Quente': { nome: 'Tempo quente', risco: 'calor', guia: 'O que fazer com calor' },
  'Tempo Frio': { nome: 'Tempo frio', risco: 'frio', guia: 'O que fazer com frio' },
  'Neve': { nome: 'Neve', risco: 'frio', guia: 'O que fazer com neve' },
  'Nevoeiro': { nome: 'Nevoeiro' },
  // A agitação marítima só afeta a costa do distrito, não Caranguejeira.
  'Agitação Marítima': { nome: 'Agitação marítima', costa: true },
};

// Avisos que ainda não acabaram, do mais grave para o menos grave.
// Períodos seguidos do mesmo tipo e nível juntam-se num só.
export function avisosDoDistrito(dados, agora = Date.now()) {
  if (!dados) return [];
  const lista = dados.lista
    .filter((a) => NIVEIS[a.nivel])
    .map((a) => ({
      ...(TIPOS[a.tipo] || { nome: a.tipo }),
      nivel: NIVEIS[a.nivel],
      ini: horaPortugal(a.inicio),
      fim: horaPortugal(a.fim),
      texto: a.texto,
      tipo: a.tipo,
    }))
    .sort((x, y) => x.ini - y.ini);

  const juntos = [];
  for (const a of lista) {
    const anterior = juntos.find((b) => b.tipo === a.tipo && b.nivel === a.nivel && b.fim === a.ini);
    if (anterior) {
      anterior.fim = a.fim;
      if (a.texto && !anterior.texto.includes(a.texto)) anterior.texto = `${anterior.texto} ${a.texto}`.trim();
    } else {
      juntos.push({ ...a });
    }
  }

  return juntos
    .filter((a) => a.fim > agora)
    .map((a) => ({ ...a, emVigor: a.ini <= agora }))
    .sort((x, y) => y.nivel.peso - x.nivel.peso || x.ini - y.ini);
}

// "até hoje às 21:00", "amanhã, das 06:00 às 18:00" ou "de quinta às 06:00 até sexta às 00:00"
export function periodo(a, agora = Date.now()) {
  if (a.emVigor) return `até ${quando(a.fim, agora)}`;
  if (diaLisboa(a.ini) === diaLisboa(a.fim)) return `${dia(a.ini, agora)}, das ${hora(a.ini)} às ${hora(a.fim)}`;
  return `de ${quando(a.ini, agora)} até ${quando(a.fim, agora)}`;
}

// Texto da hora da última atualização, para mostrar junto dos dados.
export function textoObtido(f) {
  const g = f.guardado();
  if (!g) return f.falhou() ? 'Sem ligação ao IPMA' : 'A consultar o IPMA…';
  const q = quando(g.obtido);
  return f.falhou() || !navigator.onLine ? `Sem ligação. Dados de ${q}` : `Atualizado ${q}`;
}

// Pede dados novos. Se mudarem, a app volta a desenhar o ecrã; senão só atualiza a hora.
export function atualizarEcra(raiz, f) {
  f.atualizar().then((r) => {
    if (r.mudou) window.dispatchEvent(new CustomEvent('pcc:dados'));
    else if (r.pediu) {
      raiz.querySelectorAll('[data-obtido]').forEach((el) => { el.textContent = textoObtido(f); });
      // O ponto "ao vivo" pulsa uma vez: os dados acabaram de ser confirmados.
      raiz.querySelectorAll('.vivo').forEach((el) => {
        el.classList.remove('pulsar');
        void el.getBoundingClientRect();
        el.classList.add('pulsar');
      });
    }
  });
}

// Estado do ponto "ao vivo" junto da hora: cheio com dados frescos, vazio sem ligação.
export const classeVivo = (f) => (f.falhou() || !navigator.onLine ? 'vivo vivo-off' : 'vivo');

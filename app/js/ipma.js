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

// Previsão diária para Leiria, a localidade do IPMA mais perto de Caranguejeira (cerca de 9 km).
// O IPMA dá 5 dias; a app mostra hoje e os 3 seguintes.
const LOCAL_PREVISAO = 1100900; // Leiria
const LEIRIA = { lat: 39.7473, lon: -8.8069 };
// O IPMA usa -99 para "sem valor".
const num = (v) => (Number.isFinite(Number(v)) && Number(v) > -90 ? Number(v) : null);
export const previsao = fonte('ipma-previsao', `${API}/forecast/meteorology/cities/daily/${LOCAL_PREVISAO}.json`, (json) => {
  if (!json || !Array.isArray(json.data)) throw new Error('formato');
  return json.data
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.forecastDate))
    .map((d) => ({
      data: d.forecastDate,
      min: num(d.tMin),
      max: num(d.tMax),
      tipo: Number(d.idWeatherType),
      chuva: num(d.precipitaProb),
      ventoDir: String(d.predWindDir || ''),
      ventoClasse: Number(d.classWindSpeed),
    }));
});

// Previsão hora a hora (de hora a hora nos 3 primeiros dias, depois de 3 em 3 horas).
// O IPMA usa estes dados no seu site, mas não fazem parte dos dados abertos documentados:
// se deixarem de vir, os dias continuam a aparecer, só sem a régua das horas.
export const horas = fonte('ipma-horas', `https://api.ipma.pt/public-data/forecast/aggregate/${LOCAL_PREVISAO}.json`, (json) => {
  if (!Array.isArray(json)) throw new Error('formato');
  return json
    .filter((x) => (x.idPeriodo === 1 || x.idPeriodo === 3) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(x.dataPrev))
    .map((x) => ({ quando: x.dataPrev.slice(0, 16), temp: num(x.tMed), tipo: Number(x.idTipoTempo), chuva: num(x.probabilidadePrecipita) }))
    .filter((x) => x.temp !== null)
    .sort((a, b) => (a.quando < b.quando ? -1 : 1));
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

/* ---------- Previsão do tempo ---------- */

// Tipos de tempo do IPMA (weather-type-classe.json), em português corrente, com o ícone.
const TEMPO = {
  1: ['Céu limpo', 'sol'],
  2: ['Céu pouco nublado', 'solnuvem'],
  3: ['Céu parcialmente nublado', 'solnuvem'],
  4: ['Céu muito nublado', 'nuvem'],
  5: ['Nuvens altas', 'solnuvem'],
  6: ['Aguaceiros ou chuva', 'chuva'],
  7: ['Aguaceiros fracos', 'chuva'],
  8: ['Aguaceiros fortes', 'chuva'],
  9: ['Chuva ou aguaceiros', 'chuva'],
  10: ['Chuva fraca ou chuvisco', 'chuva'],
  11: ['Chuva forte', 'chuva'],
  12: ['Períodos de chuva', 'chuva'],
  13: ['Períodos de chuva fraca', 'chuva'],
  14: ['Períodos de chuva forte', 'chuva'],
  15: ['Chuvisco', 'chuva'],
  16: ['Neblina', 'nevoeiro'],
  17: ['Nevoeiro ou nuvens baixas', 'nevoeiro'],
  18: ['Neve', 'snow'],
  19: ['Trovoada', 'trovoada'],
  20: ['Aguaceiros e possível trovoada', 'trovoada'],
  21: ['Granizo', 'chuva'],
  22: ['Geada', 'snow'],
  23: ['Chuva e possível trovoada', 'trovoada'],
  24: ['Nuvens de trovoada', 'nuvem'],
  25: ['Períodos de céu muito nublado', 'nuvem'],
  26: ['Nevoeiro', 'nevoeiro'],
  27: ['Céu nublado', 'nuvem'],
  28: ['Aguaceiros de neve', 'snow'],
  29: ['Chuva e neve', 'snow'],
  30: ['Chuva e neve', 'snow'],
};
const VENTO = { 1: 'fraco', 2: 'moderado', 3: 'forte', 4: 'muito forte' };
const DE_ONDE = { N: 'norte', NE: 'nordeste', E: 'leste', SE: 'sudeste', S: 'sul', SW: 'sudoeste', W: 'oeste', NW: 'noroeste' };
export const graus = (t) => (t === null ? '–' : `${Math.round(t)}°`);

// Hoje e os dias seguintes (até `quantos`), já com o texto a mostrar. Uma previsão
// guardada continua a servir sem rede enquanto tiver o dia de hoje.
export function previsaoDias(dados, agora = Date.now(), quantos = 4) {
  if (!dados || !Array.isArray(dados.lista)) return [];
  const hoje = diaLisboa(agora);
  return dados.lista
    .map((d) => {
      const [a, m, dd] = d.data.split('-').map(Number);
      const meioDia = horaPortugal(`${a}-${m}-${dd}T12:00`);
      const [texto, icone] = TEMPO[d.tipo] || ['Sem informação', 'nuvem'];
      const vento = VENTO[d.ventoClasse] ? `Vento ${VENTO[d.ventoClasse]}${DE_ONDE[d.ventoDir] ? ` de ${DE_ONDE[d.ventoDir]}` : ''}` : '';
      const nome = dia(meioDia, agora);
      return {
        ...d,
        dias: Math.round((Date.UTC(a, m - 1, dd) - hoje) / 864e5),
        nome: nome.charAt(0).toUpperCase() + nome.slice(1),
        texto, icone, vento,
      };
    })
    .filter((d) => d.dias >= 0)
    .slice(0, quantos);
}

// A previsão de hoje, se a cópia guardada a tiver.
export function previsaoHoje(dados, agora = Date.now()) {
  const d = previsaoDias(dados, agora, 1)[0];
  return d && d.dias === 0 ? d : null;
}

// Nascer e pôr do sol em Leiria num dia ("AAAA-MM-DD"), pela equação do nascer do sol
// (com erro de poucos minutos). Serve para a régua das horas mostrar a noite.
export function solDoDia(data) {
  const [a, m, d] = data.split('-').map(Number);
  const rad = Math.PI / 180;
  const n = Math.round(Date.UTC(a, m - 1, d, 12) / 864e5 + 2440587.5 - 2451545 + 0.0008);
  const j = n - LEIRIA.lon / 360;
  const M = (357.5291 + 0.98560028 * j) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const transito = 2451545 + j + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
  const senDecl = Math.sin(lambda * rad) * Math.sin(23.4397 * rad);
  const cosW = (Math.sin(-0.833 * rad) - Math.sin(LEIRIA.lat * rad) * senDecl) / (Math.cos(LEIRIA.lat * rad) * Math.cos(Math.asin(senDecl)));
  const w = Math.acos(Math.max(-1, Math.min(1, cosW))) / rad / 360;
  const paraMs = (jd) => (jd - 2440587.5) * 864e5;
  return { nascer: paraMs(transito - w), por: paraMs(transito + w) };
}

// As horas de um dia, com o tempo em palavras, o ícone (lua de noite) e a probabilidade
// de chuva (o IPMA só a dá de 3 em 3 horas: as outras horas usam a mais próxima).
export function horasDoDia(dados, data) {
  if (!dados || !Array.isArray(dados.lista)) return [];
  const todas = dados.lista.map((h) => ({ ...h, ms: horaPortugal(h.quando) }));
  const comChuva = todas.filter((h) => h.chuva !== null);
  const { nascer, por } = solDoDia(data);
  return todas
    .filter((h) => h.quando.startsWith(data))
    .map((h) => {
      const [texto, cena] = TEMPO[h.tipo] || ['Sem informação', 'nuvem'];
      const noite = h.ms < nascer || h.ms > por;
      let chuva = h.chuva;
      if (chuva === null) {
        const perto = comChuva.reduce((melhor, c) => (Math.abs(c.ms - h.ms) < Math.abs(melhor.ms - h.ms) ? c : melhor), { ms: Infinity });
        if (Math.abs(perto.ms - h.ms) <= 2 * 3600e3) chuva = perto.chuva;
      }
      const icone = noite && cena === 'sol' ? 'lua' : noite && cena === 'solnuvem' ? 'luanuvem' : cena;
      return { ms: h.ms, hora: hora(h.ms), h: partesLisboa(h.ms).hour, temp: h.temp, texto, cena, icone, noite, chuva };
    });
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

// Avisar a família: uma mensagem (SMS) a dizer que está bem e onde está.
// Funciona sem internet: o GPS não precisa de dados e uma SMS só precisa de rede.
// Não há servidor nem registo: a localização só sai do telemóvel na mensagem que a pessoa
// envia. Quem recebe toca na ligação e vê o sítio em palavras e no mapa (#/aqui/...).
// A localização vai depois do "#", que o navegador nunca envia ao servidor do site.

import { conteudo, esc, paraTel } from './conteudo.js';
import { icon } from './icons.js';
import { quando, hora } from './ipma.js';
import { lerPlano, lerEncontro } from './plano.js';
import { criarMapa } from './mapa.js';

const CENTRO = { lat: 39.7438, lon: -8.7084 }; // Caranguejeira
const SITE = 'https://upcc.pt/';
const SEM_NOME = 'Sítio escolhido no mapa';

/* ---------- Onde fica, em palavras (sem internet) ---------- */

const RAD = Math.PI / 180;
function distancia(a, b) {
  const dLat = (b.lat - a.lat) * RAD;
  const dLon = (b.lon - a.lon) * RAD;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}
function rumo(a, b) {
  const y = Math.sin((b.lon - a.lon) * RAD) * Math.cos(b.lat * RAD);
  const x = Math.cos(a.lat * RAD) * Math.sin(b.lat * RAD) - Math.sin(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos((b.lon - a.lon) * RAD);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}
const RUMOS = ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'];
const paraRumo = (graus) => RUMOS[Math.round(graus / 45) % 8];
export const metros = (m) => (m < 1000 ? `${Math.max(50, Math.round(m / 50) * 50)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);
const valido = (x) => x && Number.isFinite(x.lat) && Number.isFinite(x.lon);
// A margem do GPS (precisão), em passos de 10 m: "margem de 20 m".
const margemTxt = (m) => (m < 1000 ? `margem de ${Math.max(10, Math.round(m / 10) * 10)} m` : `posição aproximada, margem de ${metros(m)}`);

// "Perto de: Junta de Freguesia de Caranguejeira (300 m a norte)". Usa os locais de
// referência (conteudo/pontos.json) e os pontos de encontro deste telemóvel.
// `seus`: quem recebe vê "o seu ponto de encontro 1", porque os pontos são os do seu telemóvel.
export function ondeFica(pos, { seus = false } = {}) {
  const e = lerEncontro();
  const sitios = (conteudo.pontos?.pontos || []).filter(valido).map((x) => ({ lat: x.lat, lon: x.lon, nome: x.nome }));
  [['perto', 1], ['longe', 2]].forEach(([id, n]) => {
    const x = e[id];
    if (!valido(x)) return;
    const base = `${seus ? 'o seu ' : ''}ponto de encontro ${n}`;
    sitios.push({ lat: x.lat, lon: x.lon, nome: x.nome && x.nome !== SEM_NOME ? `${base} (${x.nome})` : base });
  });
  const maisPerto = sitios.map((s) => ({ s, d: distancia(s, pos) })).sort((a, b) => a.d - b.d)[0];
  if (maisPerto && maisPerto.d <= 60) return `Junto a: ${maisPerto.s.nome}`;
  if (maisPerto && maisPerto.d <= 2000) return `Perto de: ${maisPerto.s.nome} (${metros(maisPerto.d)} a ${paraRumo(rumo(maisPerto.s, pos))})`;
  const d = distancia(CENTRO, pos);
  if (d <= 150) return 'No centro de Caranguejeira';
  return `A ${metros(d)} do centro de Caranguejeira, a ${paraRumo(rumo(CENTRO, pos))}`;
}

/* ---------- Ligação e mensagem ---------- */

// #/aqui/LAT_LON_MARGEM_MINUTO_ESTADO: só caracteres que as apps de mensagens reconhecem
// sempre como parte da ligação. MINUTO são os minutos desde 1970 (cabe em 8 algarismos).
export function ligacao(pos, margem, estado, quandoMs = Date.now()) {
  const m = Math.max(0, Math.round(margem || 0));
  return `${SITE}#/aqui/${pos.lat.toFixed(5)}_${pos.lon.toFixed(5)}_${m}_${Math.round(quandoMs / 60000)}_${estado === 'ajuda' ? 'a' : 'b'}`;
}

export function lerLigacao(sub) {
  const [lat, lon, margem, minuto, estado] = String(sub || '').split('_');
  const p = { lat: Number(lat), lon: Number(lon) };
  if (!valido(p) || Math.abs(p.lat) > 90 || Math.abs(p.lon) > 180) return null;
  const m = Number(margem);
  const t = Number(minuto) * 60000;
  return {
    ...p,
    margem: Number.isFinite(m) && m > 0 && m < 100000 ? m : 0,
    quando: Number.isFinite(t) && t > Date.UTC(2024, 0, 1) && t < Date.now() + 864e5 ? t : null,
    estado: estado === 'a' ? 'ajuda' : estado === 'b' ? 'bem' : '',
  };
}

const NO_PONTO = { perto: 1, longe: 2 };

function compor({ estado, onde, gps, agora = Date.now() }) {
  const abre = estado === 'ajuda' ? 'Preciso de ajuda' : 'Estou bem';
  const h = hora(agora);
  const e = lerEncontro();
  if (onde === 'gps' && gps) {
    return `${abre}. ${ondeFica(gps)}, às ${h}. Ver no mapa: ${ligacao(gps, gps.margem, estado, agora)}`;
  }
  if (NO_PONTO[onde] && e[onde]) {
    const x = e[onde];
    const nome = x.nome && x.nome !== SEM_NOME ? ` (${x.nome})` : '';
    return `${abre}. Estou no ponto de encontro ${NO_PONTO[onde]}${nome}, às ${h}. Ver no mapa: ${ligacao(x, 0, estado, agora)}`;
  }
  if (onde === 'casa') return `${abre}. Estou em casa, às ${h}.`;
  return `${abre} (${h}).`;
}

// O iPhone separa o texto do número com "&"; o Android com "?".
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const sms = (tel, texto) => `sms:${tel ? paraTel(tel) : ''}${IOS ? '&' : '?'}body=${encodeURIComponent(texto)}`;

/* ---------- Ecrã: avisar a família ---------- */

export function corpoAvisar() {
  const e = lerEncontro();
  const { fora } = lerPlano();
  const opcao = (valor, titulo, desc, extra = '') => `
    <li><label class="op">
      <input type="radio" name="av-onde" value="${valor}"${valor === 'gps' ? ' checked' : ''}>
      <span class="op-txt"><span class="op-t">${titulo}</span>${desc ? `<span class="op-d"${extra}>${desc}</span>` : ''}</span>
    </label></li>`;
  const ponto = (id) => (e[id] ? opcao(id, `No ponto de encontro ${NO_PONTO[id]}`, esc(e[id].nome)) : '');
  const nomeFora = esc(fora.nome.trim() || 'contacto fora da região');

  return `
    <div data-avisar>
      <p class="intro">Diga à família que está bem e onde está, numa mensagem. Funciona sem internet: basta haver rede para mensagens (SMS).</p>

      <section class="guia-sec" aria-labelledby="av-t1">
        <h2 class="sh" id="av-t1">Como está?</h2>
        <fieldset class="seg-op av-estado">
          <legend class="vh">Como está</legend>
          <label class="seg-op-i"><input type="radio" name="av-estado" value="bem" checked><span>${icon('check')}Estou bem</span></label>
          <label class="seg-op-i av-ajuda"><input type="radio" name="av-estado" value="ajuda"><span>${icon('alert')}Preciso de ajuda</span></label>
        </fieldset>
        <p class="av-112" data-av-112 hidden>Em perigo? <a href="tel:112">Ligue 112</a>. Ao ligar, o telemóvel envia a sua localização ao 112 sozinho.</p>
      </section>

      <section class="guia-sec" aria-labelledby="av-t2">
        <h2 class="sh" id="av-t2">Onde está?</h2>
        <ul class="ops">
          ${opcao('gps', 'Onde estou agora', 'Toque para usar o GPS do telemóvel. Não precisa de internet.', ' data-gps-txt aria-live="polite"')}
          ${opcao('casa', 'Em casa', '')}
          ${ponto('perto')}
          ${ponto('longe')}
          ${opcao('nada', 'Não dizer onde estou', '')}
        </ul>
      </section>

      <section class="guia-sec" aria-labelledby="av-t3">
        <h2 class="sh" id="av-t3">Mensagem</h2>
        <label class="fld av-msg">
          <span class="fld-a" id="av-msg-a">Pode mudar o texto antes de enviar.</span>
          <textarea rows="5" data-msg aria-labelledby="av-t3" aria-describedby="av-msg-a"></textarea>
        </label>
        <button class="av-repor" type="button" data-repor hidden>Voltar ao texto feito pela app</button>
      </section>

      <section class="guia-sec" aria-labelledby="av-t4">
        <h2 class="sh" id="av-t4">Enviar</h2>
        <div class="av-env">
          ${fora.tel.trim() ? `<a class="av-b av-b1" data-sms="${esc(fora.tel)}" href="sms:">${icon('mensagem')}<span>SMS para ${nomeFora}<small>${esc(fora.tel)}</small></span></a>` : ''}
          <a class="av-b${fora.tel.trim() ? ' av-b2' : ' av-b1'}" data-sms="" href="sms:">${icon('mensagem')}<span>${fora.tel.trim() ? 'SMS para outra pessoa' : 'Escolher a quem enviar'}<small>Abre as mensagens do telemóvel</small></span></a>
          <button class="av-b av-b2" type="button" data-partilhar hidden>${icon('share')}<span>Outras apps<small>WhatsApp e outras, precisam de internet</small></span></button>
          <button class="av-b av-b2" type="button" data-copiar>${icon('documento')}<span data-copiar-txt>Copiar a mensagem</span></button>
        </div>
        ${fora.tel.trim() ? '' : '<p class="fld-a av-dica">Junte o telefone de alguém fora da região no <a href="#/plano">plano da família</a> para o ter aqui à mão.</p>'}
      </section>

      <p class="meta">A localização só sai do telemóvel na mensagem que enviar. A app não a guarda nem a envia para nenhum servidor. Para partilhar a localização em tempo real, use o WhatsApp ou o Google Maps.</p>
    </div>`;
}

export function montarAvisar(raiz) {
  const zona = raiz.querySelector('[data-avisar]');
  if (!zona) return;
  const caixa = zona.querySelector('[data-msg]');
  const repor = zona.querySelector('[data-repor]');
  const gpsTxt = zona.querySelector('[data-gps-txt]');
  const aviso112 = zona.querySelector('[data-av-112]');
  let gps = null;
  let procurar = 0; // pedidos ao GPS: só conta a resposta do último
  let mudou = false; // a pessoa escreveu na mensagem: a app não lhe muda o texto

  const escolha = (nome) => zona.querySelector(`input[name="${nome}"]:checked`)?.value;
  const texto = () => compor({ estado: escolha('av-estado'), onde: escolha('av-onde'), gps });
  const atualizar = () => {
    if (!mudou) caixa.value = texto();
    aviso112.hidden = escolha('av-estado') !== 'ajuda';
  };

  function pedirPosicao() {
    if (!('geolocation' in navigator)) {
      gpsTxt.textContent = 'Este telemóvel não consegue dar a posição. Escolha outra opção.';
      return;
    }
    const n = ++procurar;
    gpsTxt.textContent = 'A procurar a sua posição… Sem internet, pode demorar até um minuto. Perto de uma janela é mais rápido.';
    navigator.geolocation.getCurrentPosition((p) => {
      if (n !== procurar) return;
      gps = { lat: p.coords.latitude, lon: p.coords.longitude, margem: p.coords.accuracy };
      gpsTxt.textContent = `${ondeFica(gps)} · ${margemTxt(gps.margem)}`;
      atualizar();
    }, (erro) => {
      if (n !== procurar) return;
      gps = null; // uma posição antiga já não diz onde está

      gpsTxt.textContent = erro.code === 1
        ? 'A localização está desligada para esta app. Ligue-a nas definições do telemóvel, ou escolha outra opção.'
        : 'Não foi possível saber a posição. Tente perto de uma janela ou na rua, ou escolha outra opção.';
      atualizar();
    }, { enableHighAccuracy: true, timeout: 60000, maximumAge: 60000 });
  }

  zona.addEventListener('change', atualizar);
  // Cada toque em "Onde estou agora" pede a posição: a primeira vez (a opção já vem escolhida,
  // por isso não há "change") e depois para a atualizar, por exemplo depois de andar.
  zona.querySelector('input[value="gps"]').addEventListener('click', pedirPosicao);

  caixa.addEventListener('input', () => { mudou = caixa.value !== texto(); repor.hidden = !mudou; });
  repor.addEventListener('click', () => { mudou = false; repor.hidden = true; atualizar(); caixa.focus(); });

  // A hora entra no texto no momento de enviar, mesmo que o ecrã esteja aberto há algum tempo.
  zona.querySelectorAll('[data-sms]').forEach((a) => a.addEventListener('click', () => {
    atualizar();
    a.href = sms(a.dataset.sms, caixa.value);
  }));

  const partilhar = zona.querySelector('[data-partilhar]');
  if (navigator.share) {
    partilhar.hidden = false;
    partilhar.addEventListener('click', () => { atualizar(); navigator.share({ text: caixa.value }).catch(() => {}); });
  }
  const copiarTxt = zona.querySelector('[data-copiar-txt]');
  zona.querySelector('[data-copiar]').addEventListener('click', async () => {
    atualizar();
    try {
      await navigator.clipboard.writeText(caixa.value);
      copiarTxt.textContent = 'Copiada. Cole-a numa mensagem.';
    } catch {
      caixa.select();
      copiarTxt.textContent = 'Selecionada. Copie-a com o menu do telemóvel.';
    }
    setTimeout(() => { copiarTxt.textContent = 'Copiar a mensagem'; }, 4000);
  });

  atualizar();
  // Se a app já tem licença para a localização, procura logo; senão, espera pelo toque.
  navigator.permissions?.query({ name: 'geolocation' })
    .then((r) => { if (r.state === 'granted' && escolha('av-onde') === 'gps' && !gps) pedirPosicao(); })
    .catch(() => {});
}

/* ---------- Ecrã: localização recebida ---------- */

const comoChegar = (x) => `https://www.google.com/maps/dir/?api=1&destination=${x.lat.toFixed(5)},${x.lon.toFixed(5)}`;

export function corpoAqui(sub) {
  const x = lerLigacao(sub);
  if (!x) {
    return `
      <div class="soon"><h2 class="soon-k">Esta ligação não tem uma localização</h2>
      <p class="soon-t">Pode ter ficado cortada na mensagem. Peça para a enviarem outra vez.</p></div>
      <a class="next" href="#/avisar">Enviar a sua localização${icon('arrow')}</a>`;
  }
  const estado = x.estado === 'ajuda'
    ? `<p class="aqui-estado aqui-ajuda">${icon('alert')}Pediu ajuda</p>`
    : x.estado === 'bem' ? `<p class="aqui-estado aqui-bem">${icon('check')}Está bem</p>` : '';
  const detalhes = [
    x.quando ? `Enviada ${quando(x.quando)}` : '',
    x.margem ? margemTxt(x.margem) : '',
  ].filter(Boolean).join(' · ');

  return `
    <div data-aqui>
      ${estado}
      <p class="aqui-onde">${esc(ondeFica(x, { seus: true }))}</p>
      ${detalhes ? `<p class="obtido">${detalhes}</p>` : ''}
      ${x.estado === 'ajuda' ? '<p class="av-112">Se for uma emergência, <a href="tel:112">ligue 112</a> e diga onde a pessoa está.</p>' : ''}
      <div class="mapa mapa-aqui" data-mapa>
        <div class="mapa-mosaicos" data-mosaicos></div>
        <div class="mapa-marcas" data-marcas></div>
        <div class="mapa-ctl">
          <button type="button" data-zoom="1" aria-label="Aproximar">${icon('mais')}</button>
          <button type="button" data-zoom="-1" aria-label="Afastar">${icon('menos')}</button>
          <button type="button" data-eu aria-label="Mostrar onde estou">${icon('alvo')}</button>
        </div>
        <p class="mapa-off">Sem internet, o mapa não aparece. O sítio e as coordenadas continuam aqui.</p>
        <a class="mapa-atr" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>
      </div>
      <p class="mapa-msg" aria-live="polite" data-aqui-msg></p>
      <a class="next" href="${comoChegar(x)}" target="_blank" rel="noopener">Como chegar${icon('external')}</a>
      <p class="aqui-coord">Coordenadas: <b data-coord>${x.lat.toFixed(5)}, ${x.lon.toFixed(5)}</b></p>
      <a class="next" href="#/avisar">Responder com a sua localização${icon('arrow')}</a>
      <p class="meta">Esta localização veio numa mensagem. A app não a guarda nem a envia para nenhum servidor.</p>
    </div>`;
}

export function montarAqui(raiz, sub) {
  const zona = raiz.querySelector('[data-aqui]');
  const x = lerLigacao(sub);
  if (!zona || !x) return;
  const msg = zona.querySelector('[data-aqui-msg]');
  const mapa = criarMapa(zona.querySelector('[data-mapa]'));
  let eu = null;
  const pinos = () => mapa.pinos([
    { lat: x.lat, lon: x.lon, classe: `pino-pessoa${x.estado === 'ajuda' ? ' ajuda' : ''}`, html: `<span>${icon(x.estado === 'ajuda' ? 'alert' : 'pessoas')}</span>` },
    ...(eu ? [{ lat: eu.lat, lon: eu.lon, classe: 'pino-aqui', html: '' }] : []),
  ]);
  mapa.centrar(x.lat, x.lon, 16);
  pinos();
  zona.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => mapa.zoom(Number(b.dataset.zoom))));
  zona.querySelector('[data-eu]').addEventListener('click', () => {
    if (!('geolocation' in navigator)) { msg.textContent = 'Este telemóvel não consegue mostrar a sua posição.'; return; }
    msg.textContent = 'A procurar a sua posição…';
    navigator.geolocation.getCurrentPosition((p) => {
      eu = { lat: p.coords.latitude, lon: p.coords.longitude };
      pinos();
      const d = distancia(eu, x);
      msg.textContent = d < 60 ? 'Está no mesmo sítio.' : `A pessoa está a ${metros(d)} de si, a ${paraRumo(rumo(eu, x))}. O ponto azul é onde está agora.`;
    }, () => { msg.textContent = 'Não foi possível saber onde está. Verifique se a localização está ligada.'; },
    { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 });
  });
}

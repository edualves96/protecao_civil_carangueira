// Pontos de encontro: um mapa simples (mosaicos do OpenStreetMap, sem bibliotecas) onde
// a família escolhe dois sítios: perto de casa (1) e fora do bairro (2). Os locais de
// referência vêm de app/conteudo/pontos.json, que a Proteção Civil edita.

import { conteudo, esc } from './conteudo.js';
import { icon } from './icons.js';
import { lerEncontro, guardarEncontro } from './plano.js';

const CENTRO = { lat: 39.7438, lon: -8.7084 }; // Caranguejeira
const TAM = 256;
const ZOOM = { min: 11, max: 18, inicio: 15 };
const MOSAICO = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

const LADOS = {
  perto: { n: 1, nome: 'Perto de casa', ajuda: 'Um sítio a pé, para quando não podem ficar em casa (por exemplo, um incêndio).' },
  longe: { n: 2, nome: 'Fora do bairro', ajuda: 'Para quando não podem voltar ao bairro (por exemplo, uma cheia ou estradas cortadas).' },
};

const TIPOS = { encontro: 'Ponto de encontro oficial', abrigo: 'Abrigo', junta: 'Junta de Freguesia', saude: 'Saúde', escola: 'Escola', bombeiros: 'Bombeiros', gnr: 'GNR', outro: 'Referência' };

// Coordenadas <-> píxeis do mundo (projeção usada pelos mapas da web).
const paraX = (lon, z) => ((lon + 180) / 360) * TAM * 2 ** z;
const paraY = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TAM * 2 ** z;
};
const paraLon = (x, z) => (x / (TAM * 2 ** z)) * 360 - 180;
const paraLat = (y, z) => {
  const n = Math.PI - (2 * Math.PI * y) / (TAM * 2 ** z);
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
};

const comoChegar = (x) => `https://www.google.com/maps/dir/?api=1&destination=${x.lat.toFixed(6)},${x.lon.toFixed(6)}`;

export function criarMapa(el, { aoTocar = () => {} } = {}) {
  const camada = el.querySelector('[data-mosaicos]');
  const marcas = el.querySelector('[data-marcas]');
  let z = ZOOM.inicio;
  let cx = paraX(CENTRO.lon, z);
  let cy = paraY(CENTRO.lat, z);
  let pinos = [];
  let pedido = 0;
  const imgs = new Map();

  const desenhar = () => {
    pedido = 0;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const x0 = cx - w / 2;
    const y0 = cy - h / 2;
    const n = 2 ** z;
    const usados = new Set();
    for (let tx = Math.floor(x0 / TAM); tx <= Math.floor((x0 + w) / TAM); tx += 1) {
      for (let ty = Math.floor(y0 / TAM); ty <= Math.floor((y0 + h) / TAM); ty += 1) {
        if (ty < 0 || ty >= n) continue;
        const chave = `${z}/${tx}/${ty}`;
        usados.add(chave);
        let img = imgs.get(chave);
        if (!img) {
          img = new Image(TAM, TAM);
          img.alt = '';
          img.draggable = false;
          img.decoding = 'async';
          img.onerror = () => el.classList.add('sem-mapa');
          img.src = MOSAICO(z, ((tx % n) + n) % n, ty);
          imgs.set(chave, img);
          camada.append(img);
        }
        img.style.transform = `translate(${Math.round(tx * TAM - x0)}px, ${Math.round(ty * TAM - y0)}px)`;
      }
    }
    imgs.forEach((img, chave) => { if (!usados.has(chave)) { img.remove(); imgs.delete(chave); } });
    pinos.forEach((p) => {
      p.el.style.transform = `translate(${Math.round(paraX(p.lon, z) - x0)}px, ${Math.round(paraY(p.lat, z) - y0)}px)`;
    });
  };
  const pedir = () => { if (!pedido) pedido = requestAnimationFrame(desenhar); };

  const zoom = (dz, px = el.clientWidth / 2, py = el.clientHeight / 2) => {
    const nz = Math.min(ZOOM.max, Math.max(ZOOM.min, z + dz));
    if (nz === z) return;
    const lon = paraLon(cx - el.clientWidth / 2 + px, z);
    const lat = paraLat(cy - el.clientHeight / 2 + py, z);
    z = nz;
    cx = paraX(lon, z) - px + el.clientWidth / 2;
    cy = paraY(lat, z) - py + el.clientHeight / 2;
    pedir();
  };

  // Dica por cima do mapa, que se apaga sozinha.
  const dica = document.createElement('p');
  dica.className = 'mapa-dica';
  dica.setAttribute('aria-hidden', 'true');
  el.append(dica);
  let dicaT = 0;
  const mostrarDica = (txt) => {
    dica.textContent = txt;
    el.classList.add('com-dica');
    clearTimeout(dicaT);
    dicaT = setTimeout(() => el.classList.remove('com-dica'), 1600);
  };

  // O mapa não prende a página. Com o rato, arrastar move o mapa e Ctrl + roda aproxima.
  // Com o dedo, um dedo desliza a página e dois dedos movem e aproximam o mapa.
  // Um toque ou clique sem arrastar escolhe o sítio.
  let arrasto = null;
  let multi = false;
  el.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('button, a')) return;
    if (!ev.isPrimary) { arrasto = null; return; }
    multi = false;
    arrasto = { x: ev.clientX, y: ev.clientY, cx, cy, moveu: false, toque: ev.pointerType === 'touch' };
    if (!arrasto.toque) el.setPointerCapture(ev.pointerId);
  });
  el.addEventListener('pointermove', (ev) => {
    if (!arrasto || !ev.isPrimary) return;
    const dx = ev.clientX - arrasto.x;
    const dy = ev.clientY - arrasto.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) arrasto.moveu = true;
    if (arrasto.toque) return;
    cx = arrasto.cx - dx;
    cy = arrasto.cy - dy;
    pedir();
  });
  el.addEventListener('pointerup', (ev) => {
    if (!arrasto || !ev.isPrimary) return;
    const a = arrasto;
    arrasto = null;
    if (a.moveu || multi) return;
    const r = el.getBoundingClientRect();
    const x = cx - r.width / 2 + (ev.clientX - r.left);
    const y = cy - r.height / 2 + (ev.clientY - r.top);
    aoTocar({ lat: paraLat(y, z), lon: paraLon(x, z) });
  });
  el.addEventListener('pointercancel', () => { arrasto = null; });

  let gesto = null;
  const meio = (t) => ({
    x: (t[0].clientX + t[1].clientX) / 2,
    y: (t[0].clientY + t[1].clientY) / 2,
    d: Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY) || 1,
  });
  el.addEventListener('touchstart', (ev) => {
    if (ev.touches.length !== 2) return;
    multi = true;
    arrasto = null;
    gesto = { ...meio(ev.touches), cx, cy };
  }, { passive: true });
  el.addEventListener('touchmove', (ev) => {
    if (ev.touches.length === 1) {
      if (arrasto?.moveu) mostrarDica('Para mover o mapa, use dois dedos');
      return;
    }
    if (!gesto || ev.touches.length !== 2) return;
    ev.preventDefault();
    const m = meio(ev.touches);
    cx = gesto.cx - (m.x - gesto.x);
    cy = gesto.cy - (m.y - gesto.y);
    const escala = m.d / gesto.d;
    if (escala > 1.5 || escala < 0.67) {
      const r = el.getBoundingClientRect();
      zoom(escala > 1 ? 1 : -1, m.x - r.left, m.y - r.top);
      gesto = { ...m, cx, cy };
    }
    pedir();
  }, { passive: false });
  el.addEventListener('touchend', (ev) => { if (ev.touches.length < 2) gesto = null; }, { passive: true });

  el.addEventListener('wheel', (ev) => {
    if (!ev.ctrlKey && !ev.metaKey) { mostrarDica('Para aproximar, use Ctrl + roda do rato ou os botões + e −'); return; }
    ev.preventDefault();
    const r = el.getBoundingClientRect();
    zoom(ev.deltaY < 0 ? 1 : -1, ev.clientX - r.left, ev.clientY - r.top);
  }, { passive: false });
  new ResizeObserver(pedir).observe(el);

  return {
    zoom,
    centrar(lat, lon, nz = z) { z = nz; cx = paraX(lon, z); cy = paraY(lat, z); pedir(); },
    pinos(lista) {
      marcas.innerHTML = '';
      pinos = lista.map((p) => {
        const b = document.createElement(p.acao ? 'button' : 'span');
        b.className = `pino ${p.classe}`;
        b.innerHTML = p.html;
        if (p.acao) {
          b.type = 'button';
          b.setAttribute('aria-label', p.rotulo);
          b.addEventListener('click', p.acao);
        } else {
          b.setAttribute('aria-hidden', 'true');
        }
        marcas.append(b);
        return { ...p, el: b };
      });
      pedir();
    },
  };
}

export function corpoEncontro() {
  const dados = conteudo.pontos || {};
  const e = lerEncontro();
  const escolha = (lado) => {
    const l = LADOS[lado];
    const x = e[lado];
    return `
      <button class="esc" type="button" data-lado="${lado}" aria-pressed="${lado === 'perto'}">
        <span class="enc-n enc-n${l.n}" aria-hidden="true">${l.n}</span>
        <span class="esc-txt"><b>${l.nome}</b><span data-lado-nome="${lado}">${x ? esc(x.nome) : 'Por escolher'}</span></span>
        <span class="esc-ok" aria-hidden="true">${icon('check')}</span>
      </button>`;
  };
  const pontos = (dados.pontos || []).filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon));

  return `
    <div data-encontro>
      ${dados.intro ? `<p class="intro">${esc(dados.intro)}</p>` : ''}
      <div class="esc-grupo" role="group" aria-label="Que ponto está a escolher">${escolha('perto')}${escolha('longe')}</div>
      <p class="esc-ajuda" data-esc-ajuda>${LADOS.perto.ajuda} Toque no mapa ou escolha um local da lista.</p>
      <div class="mapa" data-mapa>
        <div class="mapa-mosaicos" data-mosaicos></div>
        <div class="mapa-marcas" data-marcas></div>
        <div class="mapa-ctl">
          <button type="button" data-zoom="1" aria-label="Aproximar">${icon('mais')}</button>
          <button type="button" data-zoom="-1" aria-label="Afastar">${icon('menos')}</button>
          <button type="button" data-aqui aria-label="Mostrar onde estou">${icon('alvo')}</button>
        </div>
        <p class="mapa-off">Sem internet, o mapa não aparece. Os pontos escolhidos e a lista continuam aqui.</p>
        <a class="mapa-atr" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>
      </div>
      <p class="mapa-msg" aria-live="polite" data-mapa-msg></p>
      <div class="mapa-conf" data-conf hidden></div>
      <label class="fld" for="enc-nome" data-renomear hidden>
        <span class="fld-r">Nome deste sítio</span>
        <input id="enc-nome" type="text" autocomplete="off" placeholder="Por exemplo: Largo da igreja">
      </label>
      <section class="guia-sec" aria-labelledby="ref-t">
        <h2 class="sh" id="ref-t">Locais de referência</h2>
        ${dados.aviso ? `<p class="nota">${esc(dados.aviso)}</p>` : ''}
        <ul class="refs">
          ${pontos.map((x, i) => `
            <li class="ref">
              <span class="ref-ic" aria-hidden="true">${icon('pin')}</span>
              <span class="ref-txt"><b>${esc(x.nome)}</b><span>${esc(TIPOS[x.tipo] || TIPOS.outro)}${x.morada ? ` · ${esc(x.morada)}` : ''}</span>${x.nota ? `<span>${esc(x.nota)}</span>` : ''}</span>
              <button class="ref-usar" type="button" data-usar="${i}">Usar</button>
            </li>`).join('')}
        </ul>
      </section>
      <section class="guia-sec" aria-labelledby="enc-t" data-escolhidos>
        <h2 class="sh" id="enc-t">Os vossos pontos</h2>
        <ul class="enc-fim" data-enc-fim></ul>
      </section>
      <a class="next" href="#/plano">Voltar ao plano da família${icon('arrow')}</a>
    </div>`;
}

export function montarEncontro(raiz) {
  const zona = raiz.querySelector('[data-encontro]');
  if (!zona) return;
  const dados = conteudo.pontos || {};
  const refs = (dados.pontos || []).filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon));
  let e = lerEncontro();
  let lado = 'perto';
  let aqui = null;
  const msg = zona.querySelector('[data-mapa-msg]');
  const renomear = zona.querySelector('[data-renomear]');
  const campoNome = renomear.querySelector('input');
  const mapaEl = zona.querySelector('[data-mapa]');

  const listaFinal = () => {
    zona.querySelector('[data-enc-fim]').innerHTML = Object.entries(LADOS).map(([id, l]) => {
      const x = e[id];
      return `
        <li class="enc-l"><span class="enc-n enc-n${l.n}" aria-hidden="true">${l.n}</span>
          <span><b>${l.nome}</b>${x ? esc(x.nome) : '<i>Por escolher</i>'}</span>
          ${x ? `<a class="ref-usar" href="${comoChegar(x)}" target="_blank" rel="noopener">Como chegar</a>` : ''}</li>`;
    }).join('');
  };

  // Um toque no mapa só propõe o sítio: guarda-se depois de "Usar este sítio".
  // Trocar um ponto já escolhido deixa "Desfazer" à vista.
  const conf = zona.querySelector('[data-conf]');
  let proposta = null;

  const esconderConf = () => { conf.hidden = true; conf.innerHTML = ''; };
  const mostrarConf = (texto, botoes, foco = false) => {
    conf.innerHTML = `<p aria-live="polite">${esc(texto)}</p>
      <div class="conf-b">${botoes.map(([t], i) => `<button type="button" class="conf-${i ? 'sec' : 'pri'}" data-b="${i}">${t}</button>`).join('')}</div>`;
    conf.hidden = false;
    conf.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', botoes[Number(b.dataset.b)][1]));
    if (foco) conf.querySelector('button').focus({ preventScroll: true });
  };

  const mapa = criarMapa(mapaEl, {
    aoTocar: (pos) => propor({ nome: 'Sítio escolhido no mapa', ...pos }),
  });

  const desenharPinos = () => {
    const lista = refs.map((x, i) => ({
      lat: x.lat, lon: x.lon, classe: 'pino-ref', html: icon('pin'),
      rotulo: `${x.nome}: usar como ponto ${LADOS[lado].n}`, acao: () => escolher(refs[i]),
    }));
    Object.entries(LADOS).forEach(([id, l]) => {
      const x = e[id];
      if (x) lista.push({ lat: x.lat, lon: x.lon, classe: `pino-esc pino-${id}`, html: `<span>${l.n}</span>` });
    });
    if (proposta) lista.push({ lat: proposta.lat, lon: proposta.lon, classe: `pino-esc pino-${lado} pino-proposta`, html: `<span>${LADOS[lado].n}</span>` });
    if (aqui) lista.push({ lat: aqui.lat, lon: aqui.lon, classe: 'pino-aqui', html: '' });
    mapa.pinos(lista);
  };

  const atualizarLado = (l) => {
    const x = e[l];
    zona.querySelector(`[data-lado-nome="${l}"]`).textContent = x ? x.nome : 'Por escolher';
    zona.querySelector(`[data-lado="${l}"]`).classList.toggle('feito', Boolean(x));
  };

  function propor(pos) {
    proposta = pos;
    const l = LADOS[lado];
    const troca = e[lado] ? ` Fica no lugar de "${e[lado].nome}".` : '';
    msg.textContent = '';
    desenharPinos();
    mostrarConf(`Usar este sítio como ponto ${l.n} (${l.nome.toLowerCase()})?${troca}`, [
      ['Usar este sítio', () => escolher(proposta, true)],
      ['Cancelar', () => { proposta = null; esconderConf(); desenharPinos(); }],
    ]);
  }

  function desfazer(l, antes) {
    e = { ...e, [l]: antes };
    guardarEncontro(e);
    atualizarLado(l);
    renomear.hidden = true;
    esconderConf();
    msg.textContent = `Ponto ${LADOS[l].n} reposto: ${antes.nome}.`;
    desenharPinos();
    listaFinal();
  }

  function escolher(x, doMapa = false) {
    const l = lado;
    const antes = e[l] || null;
    proposta = null;
    e = { ...e, [l]: { nome: x.nome, lat: x.lat, lon: x.lon } };
    guardarEncontro(e);
    atualizarLado(l);
    msg.textContent = `Ponto ${LADOS[l].n} (${LADOS[l].nome.toLowerCase()}): ${x.nome}. Guardado.`;
    if (antes) mostrarConf(`Trocou "${antes.nome}" por este sítio.`, [['Desfazer', () => desfazer(l, antes)]]);
    else esconderConf();
    renomear.hidden = !doMapa;
    if (doMapa) { campoNome.value = ''; campoNome.dataset.lado = l; campoNome.focus({ preventScroll: true }); }
    desenharPinos();
    listaFinal();
    // Depois de escolher o primeiro, passa sozinho para o segundo se ainda faltar.
    const outro = l === 'perto' ? 'longe' : 'perto';
    if (!doMapa && !e[outro]) setTimeout(() => mudarLado(outro), 600);
  }

  function mudarLado(novo) {
    // Um sítio proposto e não confirmado era para o outro ponto: deixa de valer.
    if (proposta && novo !== lado) { proposta = null; esconderConf(); }
    lado = novo;
    zona.querySelectorAll('[data-lado]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lado === lado)));
    zona.querySelector('[data-esc-ajuda]').textContent = `${LADOS[lado].ajuda} Toque no mapa ou escolha um local da lista.`;
    renomear.hidden = true;
    desenharPinos();
  }

  campoNome.addEventListener('input', () => {
    const l = campoNome.dataset.lado;
    if (!l || !e[l]) return;
    const nome = campoNome.value.trim() || 'Sítio escolhido no mapa';
    e = { ...e, [l]: { ...e[l], nome } };
    guardarEncontro(e);
    zona.querySelector(`[data-lado-nome="${l}"]`).textContent = nome;
    listaFinal();
  });

  zona.querySelectorAll('[data-lado]').forEach((b) => {
    if (e[b.dataset.lado]) b.classList.add('feito');
    b.addEventListener('click', () => mudarLado(b.dataset.lado));
  });
  zona.querySelectorAll('[data-usar]').forEach((b) => b.addEventListener('click', () => {
    const x = refs[Number(b.dataset.usar)];
    mapa.centrar(x.lat, x.lon);
    escolher(x);
    mapaEl.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }));
  zona.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => mapa.zoom(Number(b.dataset.zoom))));
  zona.querySelector('[data-aqui]').addEventListener('click', () => {
    if (!('geolocation' in navigator)) { msg.textContent = 'Este aparelho não consegue mostrar a sua localização.'; return; }
    msg.textContent = 'A procurar a sua localização…';
    navigator.geolocation.getCurrentPosition((pos) => {
      aqui = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      mapa.centrar(aqui.lat, aqui.lon, 16);
      desenharPinos();
      msg.textContent = 'O ponto azul é onde está agora. A localização não é guardada nem enviada.';
    }, () => { msg.textContent = 'Não foi possível saber onde está. Verifique se a localização está ligada.'; }, { enableHighAccuracy: true, timeout: 10000 });
  });

  // Começa no ponto já escolhido, se houver; senão no centro de Caranguejeira.
  const primeiro = e.perto || e.longe;
  if (primeiro) mapa.centrar(primeiro.lat, primeiro.lon);
  if (e.perto && !e.longe) mudarLado('longe');
  else desenharPinos();
  listaFinal();
}

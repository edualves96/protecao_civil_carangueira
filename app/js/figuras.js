// Figuras dos guias visuais: pictogramas de 64×64 que mostram o gesto de cada passo,
// no estilo dos cartões de segurança. Cada figura está desenhada na posição FINAL:
// é isso que se vê sem animação (movimento reduzido, ou antes de a figura aparecer).
// A animação parte de outra posição e acaba aqui. Os movimentos (classes fx-*) estão
// em app.css; os partilhados aceitam variáveis: --dx, --dy (de onde parte), --d (atraso).

/* ---------- Peças ---------- */

const em = (x, y, conteudo, s = 1) =>
  `<g transform="translate(${x} ${y})${s === 1 ? '' : ` scale(${s})`}">${conteudo}</g>`;
const mov = (classe, conteudo, estilo = '') =>
  `<g class="${classe}"${estilo ? ` style="${estilo}"` : ''}>${conteudo}</g>`;
const nao = (x1, y1, x2, y2, atraso = '600ms') =>
  `<line class="f-nao fx-riscar" pathLength="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="--d:${atraso}"/>`;

const CHAO = '<line class="f-l" x1="4" y1="57" x2="60" y2="57"/>';

// Pessoas com os pés em (0,0), cerca de 31 de altura.
const PESSOA = '<circle class="f-h" cx="0" cy="-26" r="4.5"/><path class="f-p" d="M0-20v11M0-17l-5 6M0-17l5 6M0-9l-4 9M0-9l4 9"/>';
const ANDAR = '<circle class="f-h" cx="2" cy="-26" r="4.5"/><path class="f-p" d="M1-20l-2 11M.5-17l5 5M.5-17l-5 4M-1-9l5 9M-1-9l-5 9"/>';
const ANDAR_ESQ = '<circle class="f-h" cx="-2" cy="-26" r="4.5"/><path class="f-p" d="M-1-20l2 11M-.5-17l-5 5M-.5-17l5 4M1-9l-5 9M1-9l5 9"/>';
const AGACHADA = '<circle class="f-h" cx="4" cy="-15" r="4.5"/><path class="f-p" d="M1-11l-8 5M-7-6l5 3v3M0-12l2-9 6 1"/>';
const IDOSA = '<circle class="f-h" cx="-2" cy="-25" r="4.5"/><path class="f-p" d="M-1-19l1 10M-1-16l-5 5M0-9l-3 9M0-9l3 9"/><path class="f-bengala" d="M-6-11v11"/>';

const casa = (x, y, w, h, classe = 'f-branco') => {
  const parede = y + Math.round(h * 0.42);
  return `<path class="${classe}" d="M${x} ${y + h}V${parede}L${x + w / 2} ${y}L${x + w} ${parede}V${y + h}z"/>`;
};
const casaLinha = (x, y, w, h) => casa(x, y, w, h, 'f-l');

const ARVORE = '<path class="f-tronco" d="M0 0v-14"/><circle class="f-copa" cx="0" cy="-22" r="10"/>';
// Carro visto de lado, com as rodas no chão em (0,0); cerca de 34 de comprimento.
const CARRO = '<path class="f-carro" d="M-1-6v-7l5-1 5-7h13l5 7 6 1v7z"/><path class="f-vidro-carro" d="M10-19h11l3 5H7z"/><circle class="f-roda" cx="7" cy="-5" r="4.5"/><circle class="f-roda" cx="26" cy="-5" r="4.5"/>';
const SOL = '<circle class="f-sol" r="7"/><path class="f-raios" d="M0-11v-4M0 11v4M-11 0h-4M11 0h4M-7.8-7.8l-2.8-2.8M7.8 7.8l2.8 2.8M-7.8 7.8l-2.8 2.8M7.8-7.8l2.8-2.8"/>';
// Nuvem de fumo com o canto de baixo à esquerda em (0,0); cerca de 32 × 16.
const NUVEM = '<path class="f-fumo" d="M3 0h22a6 6 0 0 0 1-12 9 9 0 0 0-17-2A6 6 0 0 0 3 0z"/>';
const VENTOINHA = '<circle class="f-l" r="11"/><path class="f-pa" d="M0 0c-3-6 0-11 3-10s2 7-3 10zM0 0c6.5 1 9.5 5.5 7.5 7.5S.5 6 0 0zM0 0c-3.5 5.5-9 6-9.5 3.5S-5.5-1 0 0z"/><circle class="f-h" r="2.2"/>';
const agua = (y) => `<path class="f-agua" d="M-12 ${y}c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0V64H-12z"/>`;
const visto = (x, y, r = 10) =>
  `<circle class="f-ok" cx="${x}" cy="${y}" r="${r}"/><path class="f-visto" d="M${x - r / 2} ${y}l${r * 0.4} ${r * 0.4} ${r * 0.7}-${r * 0.8}"/>`;

// Chama com a base em (0,0), virada para cima, com cerca de 16 de largura e 21 de altura.
const CHAMA = `
  <path class="f-fogo" d="M0 0C-5 0-8-3.2-8-7.4c0-5 4-7.6 5.2-13.6 2.6 2.4 3.4 5 3.2 7.6 1.6-1.2 2.6-3 2.8-5 3 2.8 4.8 6.4 4.8 10.6C8-3.4 4.8 0 0 0z"/>
  <path class="f-fogo2" d="M0 0c-2.6 0-4.2-1.6-4.2-3.8 0-2.6 2-4 2.8-7 1.4 1.4 2 2.8 1.8 4.4 1-.6 1.6-1.6 1.8-2.8 1.6 1.6 2.4 3.4 2.4 5.6C4.6-1.6 2.6 0 0 0z"/>`;
const chama = (x, y, escala = 1, efeito = 'fx-tremer') =>
  `<g transform="translate(${x} ${y}) scale(${escala})"><g class="${efeito}">${CHAMA}</g></g>`;

/* ---------- Figuras ---------- */

const FIGURAS = {
  /* Incêndio em casa */

  // Uma pessoa corre para a porta, com o fogo atrás.
  sair: `
    <line class="f-l" x1="4" y1="57" x2="60" y2="57"/>
    <path class="f-folha" d="M46 13l-6 4v36l6 4z"/>
    <path class="f-l" d="M46 57V13h11v44"/>
    ${chama(7, 57, 0.62)}
    <g class="fx-correr">
      <circle class="f-h" cx="33" cy="19" r="4.5"/>
      <path class="f-p" d="M31 25l-4 13"/>
      <path class="f-p" d="M30 28l6 4 3-3M30 28l-6 3-3-3"/>
      <path class="f-p" d="M27 38l6 6-1 8M27 38l-6 3-3-6"/>
    </g>`,

  // A porta fecha-se sobre a divisão a arder.
  porta: `
    <line class="f-l" x1="4" y1="57" x2="60" y2="57"/>
    <rect class="f-escuro" x="19" y="14" width="26" height="43"/>
    ${chama(32, 55, 1.15)}
    <g class="fx-fechar">
      <rect class="f-folha" x="19" y="14" width="26" height="43"/>
      <circle class="f-h" cx="40" cy="36" r="2"/>
    </g>
    <path class="f-l" d="M17 57V12h30v45"/>
    <path class="f-l" d="M22 7c5-3 13-3 18 0M37 4l3 3-4 2"/>`,

  // O telemóvel liga para o 112.
  ligar: `
    <g class="fx-vibrar">
      <rect class="f-branco" x="21" y="7" width="22" height="50" rx="5"/>
      <line class="f-l" x1="28" y1="13" x2="36" y2="13"/>
      <text class="f-num" x="32" y="38">112</text>
    </g>
    <g class="fx-ondas">
      <path class="f-onda" d="M48 25c3 3 3 9 0 12M16 25c-3 3-3 9 0 12"/>
      <path class="f-onda f-onda2" d="M53 20c5 5 5 17 0 22M11 20c-5 5-5 17 0 22"/>
    </g>`,

  // Fumo em cima; a pessoa avança de gatas, junto ao chão.
  fumo: `
    <line class="f-l" x1="4" y1="57" x2="60" y2="57"/>
    <g class="fx-fumo">
      <path class="f-fumo" d="M2 5h60v19c-5 4-10 4-15 0s-10-4-15 0-10 4-15 0-10-4-15 0z"/>
    </g>
    <g class="fx-gatas">
      <circle class="f-h" cx="45" cy="37" r="4.5"/>
      <path class="f-p" d="M40 41l-15 1"/>
      <path class="f-p" d="M39 42l2 12M36 42l-1 12"/>
      <path class="f-p" d="M25 42l-2 12h-9"/>
    </g>`,

  // A mão sente o calor na porta fechada.
  quente: `
    <rect class="f-folha" x="30" y="9" width="25" height="48"/>
    <circle class="f-h" cx="35" cy="34" r="2"/>
    <g class="fx-calor">
      <path class="f-calor" d="M42 49c-3-4 3-7 0-11s3-7 0-11 3-7 0-11"/>
      <path class="f-calor" d="M49 49c-3-4 3-7 0-11s3-7 0-11 3-7 0-11"/>
    </g>
    <g class="fx-mao">
      <path class="f-braco" d="M8 58l8-12"/>
      <rect class="f-h" x="12" y="34" width="13" height="14" rx="4"/>
      <path class="f-dedo" d="M14.5 35v-8M18.5 35v-10M22.5 35v-9M12.5 41l-4.5-4"/>
    </g>`,

  // Desce pelas escadas; o elevador está riscado.
  escadas: `
    <path class="f-l" d="M4 31h12v6h10v6h10v6h10v6h14"/>
    <rect class="f-branco" x="42" y="5" width="16" height="21" rx="1.5"/>
    <line class="f-l" x1="50" y1="5" x2="50" y2="26"/>
    ${nao(39, 3, 61, 28, '900ms')}
    <g class="fx-descer">
      <circle class="f-h" cx="32" cy="24" r="4"/>
      <path class="f-p" d="M32 29l-1 7"/>
      <path class="f-p" d="M32 30l-4 4M32 30l4 3"/>
      <path class="f-p" d="M31 36l-3 6M31 36l4 5"/>
    </g>`,

  // À janela, a pessoa acena com um pano.
  janela: `
    <rect class="f-vidro" x="12" y="9" width="40" height="33"/>
    <circle class="f-h" cx="26" cy="27" r="4.5"/>
    <path class="f-p" d="M26 33v9M26 35l-6 7"/>
    <g class="fx-acenar">
      <path class="f-p" d="M28 34l10-12"/>
      <rect class="f-branco" x="35" y="11" width="10" height="9" rx="1.5"/>
    </g>
    <rect class="f-l" x="12" y="9" width="40" height="33"/>
    <path class="f-peitoril" d="M7 43h50"/>`,

  // Deitada no chão, a pessoa rola e apaga as chamas.
  rolar: `
    <line class="f-l" x1="4" y1="57" x2="60" y2="57"/>
    <path class="f-l" d="M19 35c6-7 19-7 25 0M40 30l4 5-6 1"/>
    <g class="fx-rolar">
      <circle class="f-h" cx="13" cy="49" r="4.5"/>
      <path class="f-p" d="M19 50h18l12 1M37 50l12-3"/>
      <path class="f-p" d="M21 49l-6-6"/>
      ${chama(31, 47, 0.7, 'fx-apagar')}
    </g>`,

  // A tampa cai sobre a frigideira e a chama apaga-se.
  tampa: `
    <line class="f-l" x1="4" y1="51" x2="60" y2="51"/>
    ${chama(27, 40, 0.95, 'fx-apagar')}
    <path class="f-tacho" d="M9 40h36l-3 8H12z"/>
    <path class="f-pega" d="M45 42l13-3"/>
    <g class="fx-tampa">
      <path class="f-branco" d="M8 39.5c4-8 34-8 38 0z"/>
      <rect class="f-h" x="24" y="29" width="6" height="3.5" rx="1.75"/>
    </g>`,

  /* Sismo */

  // Agachado debaixo da mesa, que abana.
  mesa: `
    ${CHAO}
    ${mov('fx-abanar', '<path class="f-mesa" d="M8 31h48"/><path class="f-p" d="M13 33v24M51 33v24"/>')}
    ${mov('fx-mover', em(31, 57, AGACHADA, 1.05), '--dx:-16px')}
    <path class="f-tremor fx-surgir" d="M2 20l3-3 3 3 3-3M53 20l3-3 3 3 3-3" style="--d:300ms"/>`,

  // A casa abana; sair pela porta está riscado.
  ficar: `
    ${mov('fx-abanar', casa(5, 20, 34, 37) + casaLinha(5, 20, 34, 37))}
    ${em(22, 56, PESSOA, 0.72)}
    <path class="f-seta" d="M43 40h14M52 35l5 5-5 5"/>
    ${nao(42, 30, 60, 50, '500ms')}
    ${CHAO}`,

  // Afasta-se do prédio para um espaço aberto.
  aberto: `
    ${CHAO}
    <rect class="f-branco" x="4" y="12" width="20" height="45"/>
    <path class="f-janelas" d="M9 19h4M15 19h4M9 27h4M15 27h4M9 35h4M15 35h4M9 43h4M15 43h4"/>
    ${em(53, 57, ARVORE)}
    ${mov('fx-mover', em(36, 57, ANDAR, 0.85), '--dx:-12px')}`,

  // Agachado contra uma parede interior, longe da janela.
  parede: `
    ${CHAO}
    <rect class="f-vidro" x="6" y="12" width="16" height="20"/>
    <path class="f-l" d="M6 12h16v20H6zM14 12v20"/>
    <rect class="f-h" x="50" y="6" width="7" height="51"/>
    ${mov('fx-mover', em(40, 57, AGACHADA, 1.05), '--dx:-14px')}`,

  // Na rua, afasta-se do prédio de onde caem tijolos.
  rua: `
    ${CHAO}
    <rect class="f-branco" x="4" y="10" width="22" height="47"/>
    <path class="f-janelas" d="M9 18h4M17 18h4M9 27h4M17 27h4M9 36h4M17 36h4M9 45h4M17 45h4"/>
    ${mov('fx-cair', '<rect class="f-tijolo" x="28" y="53" width="7" height="4"/>', '--dy:-30px; --d:150ms')}
    ${mov('fx-cair', '<rect class="f-tijolo" x="36" y="53" width="6" height="4"/>', '--dy:-22px; --d:450ms')}
    ${mov('fx-mover', em(52, 57, ANDAR, 0.85), '--dx:-14px')}`,

  // O carro abranda e para.
  carro: `
    ${CHAO}
    <path class="f-rasto fx-rasto" d="M3 40h8M6 47h8"/>
    ${mov('fx-mover', em(20, 57, CARRO), '--dx:-20px; --dur:1.2s')}`,

  // Garrafa de gás; acender um fósforo está riscado.
  gas: `
    <path class="f-garrafa" d="M12 27a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v30H12z"/>
    <path class="f-l" d="M19 21v-5h10v5M24 16v-4M12 35h24"/>
    <line class="f-pau" x1="44" y1="56" x2="52" y2="38"/>
    ${chama(52.5, 37, 0.45)}
    ${nao(38, 28, 62, 58, '400ms')}`,

  /* Incêndio rural */

  // Afasta-se da árvore a arder.
  afastar: `
    ${CHAO}
    ${em(14, 57, ARVORE)}
    ${chama(14, 40, 1)}
    ${mov('fx-fumo', em(2, 14, NUVEM, 0.8))}
    ${mov('fx-mover', em(42, 57, ANDAR, 0.85), '--dx:-14px')}`,

  // Sai de casa pelo caminho indicado.
  evacuar: `
    <line class="f-l" x1="4" y1="57" x2="28" y2="57"/>
    ${casa(4, 26, 22, 31)}${casaLinha(4, 26, 22, 31)}
    <path class="f-tracejado" d="M30 57h22"/>
    <path class="f-seta-azul" d="M52 52l6 5-6 5"/>
    ${mov('fx-mover', em(42, 57, ANDAR, 0.8), '--dx:-12px')}`,

  // O carro não entra no fumo.
  'fumo-estrada': `
    ${CHAO}
    ${mov('fx-fumo', '<path class="f-fumo" d="M34 57V36c0-6 6-9 10-6 2-6 11-6 13 0 5-1 7 4 5 8v19z"/>')}
    ${mov('fx-mover', em(4, 57, CARRO, 0.7), '--dx:-10px')}
    <path class="f-seta" d="M29 46h8M33 42l4 4-4 4"/>
    ${nao(25, 36, 41, 56, '600ms')}`,

  // As portadas fecham-se; o fumo fica lá fora.
  'casa-fechar': `
    ${casa(8, 12, 48, 45)}
    <rect class="f-escuro" x="22" y="33" width="20" height="16"/>
    ${mov('fx-fechar', '<rect class="f-folha" x="22" y="33" width="10" height="16"/>')}
    ${mov('fx-fechar', '<rect class="f-folha" x="32" y="33" width="10" height="16"/>', 'transform-origin:100% 50%')}
    <rect class="f-l" x="22" y="33" width="20" height="16"/>
    ${casaLinha(8, 12, 48, 45)}
    ${mov('fx-fumo', em(1, 13, NUVEM, 0.55))}`,

  // A torneira enche o balde.
  baldes: `
    <path class="f-l" d="M18 8h16v6M28 14v3"/>
    ${mov('fx-chover', '<path class="f-gota" d="M28 20c-2 3-2.5 5 0 5s2-2 0-5z"/>')}
    <path class="f-branco" d="M14 30h28l-3 27H17z"/>
    ${mov('fx-encher', '<path class="f-agua" d="M15.2 39h25.6l-1.9 18H17.1z"/>', '--d:200ms')}
    <path class="f-l" d="M14 30h28l-3 27H17zM14 30c0-11 28-11 28 0"/>`,

  // Pano molhado sobre a boca e o nariz.
  pano: `
    ${mov('fx-fumo', em(40, 16, NUVEM, 0.7))}
    <circle class="f-h" cx="28" cy="32" r="15"/>
    <circle class="f-olho" cx="34" cy="27" r="2.2"/>
    ${mov('fx-mover', '<path class="f-pano" d="M12 33h33v6c0 7-7 11-16.5 11S12 46 12 39z"/>', '--dy:12px')}
    ${mov('fx-chover', '<path class="f-gota" d="M22 53c-1.6 2.4-2 3.8 0 3.8s1.6-1.4 0-3.8zM34 53c-1.6 2.4-2 3.8 0 3.8s1.6-1.4 0-3.8z"/>', '--d:700ms')}`,

  /* Cheias */

  // O carro na água; atravessar está riscado.
  'nao-atravessar': `
    ${em(12, 52, CARRO, 0.95)}
    ${mov('fx-mover', agua(42), '--dx:-8px; --dur:1.6s')}
    ${nao(6, 12, 52, 54, '500ms')}`,

  // Sobe as escadas enquanto a água sobe.
  subir: `
    <path class="f-l" d="M4 52h12v-8h10v-8h10v-8h10v-8h14"/>
    ${mov('fx-subir', agua(50))}
    ${mov('fx-mover', em(41, 28, ANDAR, 0.7), '--dx:-20px; --dy:16px')}`,

  // O rádio dá as indicações.
  radio: `
    ${mov('fx-vibrar', '<rect class="f-branco" x="12" y="26" width="40" height="26" rx="4"/><circle class="f-l" cx="24" cy="39" r="7"/><circle class="f-h" cx="24" cy="39" r="2"/><path class="f-l" d="M36 34h10M36 39h10M36 44h10M44 26l8-16"/>')}
    ${mov('fx-ondas', '<path class="f-onda" d="M7 31c-3 4-3 12 0 16M57 33c3 4 3 10 0 14"/><path class="f-onda f-onda2" d="M2.5 27c-4.5 6-4.5 18 0 24M61.5 29c4 5 4 17 0 22"/>')}`,

  // A água sobe dentro de casa; suba.
  'agua-casa': `
    ${casa(6, 8, 52, 49)}
    ${mov('fx-encher', '<path class="f-agua" d="M8 44c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0V56H8z"/>')}
    <path class="f-seta" d="M32 38V20M26 26l6-6 6 6"/>
    ${casaLinha(6, 8, 52, 49)}`,

  // Cabo caído a faiscar; a pessoa afasta-se.
  cabo: `
    ${CHAO}
    <path class="f-poste" d="M14 57V10M8 14h12"/>
    <path class="f-cabo" d="M18 14c6 6 12 22 16 41"/>
    ${mov('fx-pulsar', '<path class="f-faisca" d="M34 47v-5M29 50l-4-2M39 50l4-2M30 45l-3-3M38 45l3-3"/>')}
    ${mov('fx-mover', em(52, 57, ANDAR, 0.75), '--dx:-12px')}`,

  // Pode voltar para casa quando disserem que é seguro.
  voltar: `
    ${CHAO}
    ${casa(6, 18, 34, 39)}${casaLinha(6, 18, 34, 39)}
    <rect class="f-folha" x="18" y="41" width="10" height="16"/>
    ${mov('fx-surgir', visto(49, 22), '--d:300ms')}
    ${em(50, 57, PESSOA, 0.7)}`,

  /* Calor */

  // O copo enche-se de água.
  beber: `
    ${mov('fx-chover', '<path class="f-gota" d="M32 1c-2 3-2.5 5 0 5s2-2 0-5z"/>')}
    <path class="f-branco" d="M20 10h24l-3 47H23z"/>
    ${mov('fx-encher', '<path class="f-agua" d="M21.3 28h21.4l-1.7 29H23z"/>', '--d:150ms')}
    <path class="f-l" d="M20 10h24l-3 47H23z"/>`,

  // Sol forte; fique em casa.
  'sol-casa': `
    ${CHAO}
    ${casa(6, 24, 36, 33)}${casaLinha(6, 24, 36, 33)}
    <rect class="f-folha" x="19" y="43" width="10" height="14"/>
    ${em(50, 15, mov('fx-girar', SOL))}`,

  // O estore desce e tapa o sol.
  persianas: `
    ${em(53, 12, SOL, 0.65)}
    <rect class="f-vidro" x="6" y="14" width="36" height="38"/>
    ${mov('fx-baixar', '<rect class="f-estore" x="6" y="14" width="36" height="28"/><path class="f-ripas" d="M6 21h36M6 28h36M6 35h36"/>')}
    <rect class="f-l" x="6" y="14" width="36" height="38"/>
    <path class="f-peitoril" d="M2 52h44"/>`,

  // Sentada, ao fresco, com um copo de água.
  tonturas: `
    ${CHAO}
    <path class="f-cadeira" d="M14 30v27M14 44h14v13"/>
    <circle class="f-h" cx="22" cy="24" r="4.5"/>
    <path class="f-p" d="M21 30l1 12h11v14M22 33l8 5"/>
    <path class="f-branco" d="M30 32h6l-1 8h-4z"/>
    <path class="f-l" d="M48 27v30M42 57h12"/>
    ${em(48, 16, mov('fx-girar', VENTOINHA))}`,

  // Ninguém fica dentro do carro ao sol.
  'carro-calor': `
    ${CHAO}
    ${em(14, 57, CARRO, 1.05)}
    <circle class="f-h" cx="30" cy="39.5" r="2.8"/>
    ${em(51, 13, mov('fx-pulsar', SOL), 0.75)}
    ${nao(10, 26, 56, 58, '450ms')}`,

  // Visita a quem vive sozinho.
  vizinho: `
    ${CHAO}
    ${em(46, 57, IDOSA)}
    ${mov('fx-mover', em(24, 57, ANDAR), '--dx:-12px')}
    ${mov('fx-surgir', '<path class="f-coracao" d="M35 20c-2.5-3.5-8-1.5-6 3l6 6 6-6c2-4.5-3.5-6.5-6-3z"/>', '--d:900ms')}`,

  /* Tempestade */

  // Vento lá fora; fique em casa, longe da janela.
  'casa-vento': `
    ${CHAO}
    ${casa(20, 16, 38, 41)}${casaLinha(20, 16, 38, 41)}
    <rect class="f-vidro" x="27" y="38" width="10" height="10"/>
    <rect class="f-l" x="27" y="38" width="10" height="10"/>
    ${em(49, 57, PESSOA, 0.65)}
    ${mov('fx-vento', '<path class="f-vento" d="M2 26h12c3 0 4-4 1-5M2 34h15M2 42h10c3 0 4 4 1 5"/>')}`,

  // A árvore verga com o vento; a pessoa afasta-se.
  arvore: `
    ${CHAO}
    ${mov('fx-dobrar', em(18, 57, ARVORE, 1.1))}
    ${mov('fx-vento', '<path class="f-vento" d="M2 14h10M4 22h8"/>')}
    ${mov('fx-mover', em(48, 57, ANDAR, 0.82), '--dx:-12px')}`,

  // Trovoada; abrigar-se debaixo da árvore está riscado.
  trovoada: `
    ${CHAO}
    <path class="f-nuvem" d="M6 22h28a7 7 0 0 0 1-14 10 10 0 0 0-19-3 7 7 0 0 0-10 6 5.5 5.5 0 0 0 0 11z"/>
    ${mov('fx-flash', '<path class="f-raio" d="M22 22l-6 13h6l-4 13 12-17h-6l4-9z"/>')}
    ${em(47, 57, ARVORE, 0.95)}
    ${em(54, 57, PESSOA, 0.55)}
    ${nao(34, 26, 62, 58, '700ms')}`,

  // Ramo preso no fio; tentar tirá-lo está riscado.
  ramos: `
    <path class="f-poste" d="M8 57V12M56 57V12M3 16h10M51 16h10"/>
    <path class="f-cabo" d="M8 16c14 10 34 10 48 0"/>
    ${mov('fx-abanar', '<path class="f-ramo" d="M26 23l12 9M30 26l-3 6M34 29l2 6"/><circle class="f-copa" cx="27" cy="33" r="3"/><circle class="f-copa" cx="36.5" cy="36" r="3"/><circle class="f-copa" cx="40" cy="31" r="2.6"/>')}
    ${mov('fx-mover', '<path class="f-braco" d="M34 66l-2-12"/><rect class="f-h" x="26" y="42" width="12" height="12" rx="4"/><path class="f-dedo" d="M28.5 43v-6M32 43v-7M35.5 43v-6"/>', '--dy:8px')}
    ${nao(18, 34, 48, 62, '600ms')}`,

  /* Frio */

  // Gorro e cachecol por cima da roupa.
  camadas: `
    ${mov('fx-chover', '<path class="f-neve" d="M8 12v6M5 15h6M54 20v6M51 23h6M10 40v6M7 43h6M55 46v6M52 49h6"/>')}
    ${em(32, 59, PESSOA, 1.3)}
    ${mov('fx-cair', '<path class="f-gorro" d="M25 24.5a7 7 0 0 1 14 0z"/><circle class="f-gorro" cx="32" cy="16.5" r="2.2"/>', '--dy:-12px; --d:200ms')}
    ${mov('fx-surgir', '<path class="f-cachecol" d="M27 30.5h10v3.5H27zM34 33l2 9h-3.5l-1.5-8z"/>', '--d:600ms')}`,

  // Fogareiro a deitar fumo, riscado.
  aquecer: `
    ${CHAO}
    ${mov('fx-fumo', '<path class="f-fumo-l" d="M26 30c-3-4 3-7 0-11s3-7 0-11M36 30c-3-4 3-7 0-11s3-7 0-11"/>')}
    ${chama(31, 44, 0.85)}
    <path class="f-tacho" d="M16 43h30l-4 8H20z"/>
    <path class="f-l" d="M21 51l-3 6M41 51l3 6"/>
    ${nao(10, 12, 54, 58, '500ms')}`,

  // A janela abre-se e o ar renova-se.
  arejar: `
    <rect class="f-vidro" x="10" y="10" width="44" height="40"/>
    ${mov('fx-vento', '<path class="f-ar" d="M18 22c7-4 14 4 22 0M18 30c7-4 14 4 22 0M18 38c7-4 14 4 22 0"/>', '--d:300ms')}
    ${mov('fx-abrir', '<path class="f-folha" d="M10 10l9 4v32l-9 4z"/>')}
    ${mov('fx-abrir', '<path class="f-folha" d="M54 10l-9 4v32l9 4z"/>', 'transform-origin:100% 50%')}
    <rect class="f-l" x="10" y="10" width="44" height="40"/>
    <path class="f-peitoril" d="M6 50h52"/>`,

  // O aquecedor deita gás; a pessoa sai.
  co: `
    ${CHAO}
    <rect class="f-branco" x="5" y="32" width="20" height="25" rx="2"/>
    <path class="f-l" d="M9 37h12"/>
    <rect class="f-escuro" x="9" y="42" width="12" height="10" rx="1"/>
    ${chama(15, 51, 0.36)}
    ${mov('fx-fumo', '<path class="f-fumo-l" d="M11 28c-3-4 3-7 0-11s3-7 0-11M19 28c-3-4 3-7 0-11s3-7 0-11"/>')}
    <path class="f-folha" d="M44 22l-5 3v29l5 3z"/>
    <path class="f-l" d="M44 57V22h15v35"/>
    <circle class="f-h" cx="41.5" cy="40" r="1.6"/>
    ${mov('fx-mover', em(32, 57, ANDAR, 0.8), '--dx:-8px')}`,

  // À noite, o aquecedor desliga-se.
  dormir: `
    ${CHAO}
    <path class="f-lua" d="M13 6a9 9 0 1 0 10 13 7 7 0 1 1-10-13z"/>
    <rect class="f-folha" x="6" y="39" width="9" height="5" rx="2"/>
    <rect class="f-branco" x="6" y="44" width="28" height="6"/>
    <path class="f-cama" d="M4 36v21M4 50h32v7"/>
    <rect class="f-branco" x="42" y="34" width="15" height="23" rx="2"/>
    <path class="f-l" d="M46 40h7M46 45h7M46 50h7"/>
    ${mov('fx-surgir', '<path class="f-desligar" d="M49.5 14v7M44.5 17a7 7 0 1 0 10 0"/>', '--d:200ms')}`,

  /* Matérias perigosas */

  // O fumo vai com o vento; a pessoa vai para o lado contrário.
  vento: `
    ${CHAO}
    <path class="f-seta" d="M4 12h14M14 8l4 4-4 4"/>
    <path class="f-fumo-l" d="M40 32c2-5 6-9 10-11"/>
    ${mov('fx-mover', em(36, 16, NUVEM, 0.85), '--dx:-12px; --dur:1.6s')}
    <rect class="f-branco" x="22" y="34" width="22" height="17"/>
    <rect class="f-placa" x="28" y="39" width="10" height="6"/>
    <path class="f-carro" d="M44 51V40h6l5 5v6z"/>
    <circle class="f-roda" cx="28" cy="53" r="3.5"/>
    <circle class="f-roda" cx="49" cy="53" r="3.5"/>
    ${mov('fx-mover', em(10, 57, ANDAR_ESQ, 0.75), '--dx:10px')}`,

  // Filmar com o telemóvel está riscado.
  'nao-filmar': `
    <rect class="f-branco" x="18" y="8" width="28" height="48" rx="5"/>
    <circle class="f-l" cx="32" cy="24" r="7"/>
    <circle class="f-h" cx="32" cy="24" r="3"/>
    ${mov('fx-pulsar', '<circle class="f-fogo" cx="32" cy="43" r="4"/>')}
    ${nao(10, 8, 54, 58, '500ms')}`,

  // A escola protege as crianças.
  escola: `
    ${CHAO}
    <path class="f-l" d="M28 14V3"/>
    <path class="f-bandeira" d="M28 3h10l-2.5 3 2.5 3H28z"/>
    <path class="f-branco" d="M5 28L28 14l23 14z"/>
    <rect class="f-branco" x="8" y="28" width="40" height="29"/>
    <rect class="f-folha" x="23" y="42" width="10" height="15"/>
    <path class="f-janelas" d="M12 35h6M38 35h6M12 45h6M38 45h6"/>
    ${mov('fx-surgir', visto(51, 44, 9), '--d:300ms')}`,

  // Um duche para tirar o produto.
  lavar: `
    ${CHAO}
    <path class="f-l" d="M12 6h18v6"/>
    <path class="f-tacho" d="M24 12h12l-2 4H26z"/>
    ${mov('fx-chover', '<path class="f-gota" d="M27 19c-1.6 2.4-2 4 0 4s1.6-1.6 0-4zM31 23c-1.6 2.4-2 4 0 4s1.6-1.6 0-4zM35 19c-1.6 2.4-2 4 0 4s1.6-1.6 0-4z"/>')}
    ${em(31, 57, PESSOA, 0.9)}`,

  /* Falha de energia */

  // A lanterna acende; a vela está riscada.
  lanterna: `
    ${mov('fx-surgir', '<path class="f-luz" d="M30 25L62 10v32z"/>', '--d:250ms; transform-origin:0 50%')}
    <path class="f-branco" d="M6 20h16l8-5v20l-8-5H6z"/>
    <rect class="f-h" x="11" y="22.5" width="5" height="5" rx="1"/>
    <rect class="f-branco" x="45" y="46" width="7" height="11"/>
    ${chama(48.5, 46, 0.45)}
    ${nao(38, 40, 60, 62, '600ms')}`,

  // A ficha sai da tomada.
  tomada: `
    <rect class="f-branco" x="40" y="20" width="20" height="24" rx="3"/>
    <circle class="f-h" cx="46.5" cy="32" r="2"/>
    <circle class="f-h" cx="53.5" cy="32" r="2"/>
    ${mov('fx-mover', '<path class="f-l" d="M4 48c8 0 12-15 20-15"/><rect class="f-branco" x="24" y="27" width="10" height="12" rx="2"/><path class="f-l" d="M34 30.5h4M34 35.5h4"/>', '--dx:6px')}`,

  // A porta do frigorífico fecha-se.
  frigorifico: `
    <rect class="f-vidro" x="16" y="6" width="32" height="52" rx="3"/>
    <path class="f-l" d="M20 30h24M20 42h24"/>
    ${mov('fx-fechar', '<rect class="f-branco" x="16" y="6" width="32" height="52" rx="3"/><path class="f-l" d="M16 24h32"/><path class="f-pega" d="M42 12v7M42 30v12"/>')}`,

  // Gerador dentro de casa, riscado.
  gerador: `
    ${casa(4, 6, 56, 51)}
    ${mov('fx-fumo', '<path class="f-fumo-l" d="M24 34c-3-4 3-7 0-11M31 34c-3-4 3-7 0-11"/>')}
    <rect class="f-tacho" x="16" y="38" width="26" height="16" rx="2"/>
    <path class="f-l-claro" d="M21 43h8M21 48h8"/>
    <path class="f-l" d="M42 44h6v-6"/>
    ${casaLinha(4, 6, 56, 51)}
    ${nao(8, 26, 56, 60, '500ms')}`,

  // Aparelho médico com a bateria a acabar.
  medico: `
    <rect class="f-branco" x="6" y="10" width="38" height="28" rx="3"/>
    <path class="f-pulso fx-riscar" pathLength="1" d="M10 26h8l3-8 4 14 3-6h12"/>
    <path class="f-l" d="M25 38v8M17 46h16"/>
    <rect class="f-branco" x="44" y="46" width="15" height="9" rx="1.5"/>
    <path class="f-l" d="M61 49v3"/>
    ${mov('fx-pulsar', '<rect class="f-fogo" x="46.5" y="48.5" width="3.5" height="4"/>')}`,
};

export function figura(nome) {
  const desenho = FIGURAS[nome];
  if (!desenho) return '';
  return `<svg class="fig-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${desenho}</svg>`;
}

// Cada figura mostra o gesto uma vez quando aparece no ecrã; um toque repete-o.
let observador = null;

function tocar(fig) {
  fig.classList.remove('play');
  void fig.getBoundingClientRect(); // obriga o navegador a recomeçar a animação
  fig.classList.add('play');
}

export function montarFiguras(raiz) {
  const zona = raiz.querySelector('[data-guia-visual]');
  if (!zona) return;
  const figs = zona.querySelectorAll('.fig');

  if (observador) observador.disconnect();
  if ('IntersectionObserver' in window) {
    observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        tocar(e.target);
        observador.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    figs.forEach((f) => observador.observe(f));
  }

  zona.addEventListener('click', (e) => {
    const fig = e.target.closest('.fig');
    if (!fig) return;
    fig.style.setProperty('--atraso', '0ms');
    tocar(fig);
  });
}

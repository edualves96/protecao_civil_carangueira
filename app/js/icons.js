// Ícones de traço simples (24×24). Desenhados para a app.

const PONTO = 'fill="currentColor" stroke="none"';

const P = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  // Ícones das categorias do kit
  gota: '<path d="M12 3c3.6 4.3 6 7.7 6 10.8a6 6 0 0 1-12 0C6 10.7 8.4 7.3 12 3z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.4"/>',
  socorro: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7M12 10.5v6M9 13.5h6"/>',
  lanterna: '<path d="M7 3h10v3l-2.5 4V21h-5V10L7 6z"/><path d="M7 6h10M12 13.5v2.5"/>',
  documento: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h4"/>',
  roupa: '<path d="M9 4 4 6.5l1.8 4.2L8 9.8V20h8V9.8l2.2.9L20 6.5 15 4a3 3 0 0 1-6 0z"/>',
  ferramenta: '<path d="M15.5 3.5a4.5 4.5 0 0 0-4.3 5.9L4 16.6 7.4 20l7.2-7.2a4.5 4.5 0 0 0 5.9-4.3l-2.8 1.1-2.2-2.2z"/>',
  caixa: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  quake: '<path d="M2 12h4l3-8 4 16 3-8h6"/>',
  fire: '<path d="M12 22c4 0 7-2.7 7-6.8 0-3.6-2.6-6-4.2-8.7-.5 2-1.5 3.2-2.8 3.9C12.3 7 11 4.4 8.5 2c.3 3.6-3.5 6.6-3.5 11.2C5 19.3 8 22 12 22z"/>',
  flood: '<path d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 14c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/>',
  heat: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/><path d="M12 10v7"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
  snow: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  share: '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M6 11H5v10h14V11h-1"/>',
  'plus-square': '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>',
  dots: `<circle cx="12" cy="5" r="1.8" ${PONTO}/><circle cx="12" cy="12" r="1.8" ${PONTO}/><circle cx="12" cy="19" r="1.8" ${PONTO}/>`,
  'dots-h': `<circle cx="5" cy="12" r="1.8" ${PONTO}/><circle cx="12" cy="12" r="1.8" ${PONTO}/><circle cx="19" cy="12" r="1.8" ${PONTO}/>`,
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
};

export function icon(nome, classe = 'i') {
  return `<svg class="${classe}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[nome] || ''}</svg>`;
}

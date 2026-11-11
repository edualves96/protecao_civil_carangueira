// Contactos úteis. Só os números confirmados numa fonte oficial aparecem e se podem
// ligar com um toque; cada um mostra a fonte e a data em que foi confirmado.
//
// Para confirmar um número local: verifique-o numa fonte oficial ou junto da própria
// entidade, preencha `num`, `fonte` e `consultado`, e mude `confirmado` para true.
// Um número errado numa emergência é pior do que nenhum, por isso os que estão por
// confirmar não mostram número.

export const CONTACTOS = [
  {
    titulo: 'Emergência',
    itens: [
      {
        nome: 'Número Europeu de Emergência',
        num: '112',
        desc: 'Ambulância, bombeiros ou polícia. Grátis, a qualquer hora.',
        sos: true,
        confirmado: true,
        fonte: { nome: 'gov.pt', url: 'https://www.gov.pt/linhas-uteis' },
        consultado: '11/11/2026',
      },
    ],
  },
  {
    titulo: 'Linhas nacionais',
    itens: [
      {
        nome: 'SNS 24',
        num: '808 24 24 24',
        desc: 'Aconselhamento de saúde a qualquer hora. Se não for uma emergência, ligue antes de ir às urgências.',
        confirmado: true,
        fonte: { nome: 'sns24.gov.pt', url: 'https://www.sns24.gov.pt/' },
        consultado: '11/11/2026',
      },
      {
        nome: 'Centro de Informação Antivenenos',
        num: '800 250 250',
        desc: 'Intoxicações com medicamentos, produtos de limpeza, plantas ou químicos. Grátis, 24 horas.',
        confirmado: true,
        fonte: { nome: 'gov.pt', url: 'https://www.gov.pt/guias/linhas-de-apoio-e-outros-contactos-uteis' },
        consultado: '11/11/2026',
      },
      {
        nome: 'E-REDES: avarias de eletricidade',
        num: '800 506 506',
        desc: 'Falta de luz, cabos caídos ou postes danificados. Grátis, 24 horas.',
        confirmado: true,
        fonte: { nome: 'e-redes.pt', url: 'https://www.e-redes.pt/pt-pt/ajuda/perguntas-frequentes/relacao-com-o-cliente-e-atendimento' },
        consultado: '11/11/2026',
      },
    ],
  },
  {
    titulo: 'Na freguesia e no concelho',
    itens: [
      {
        nome: 'Junta de Freguesia de Caranguejeira',
        num: '244 734 437',
        desc: 'Contacto geral da Junta, na Rua do Comércio, 54.',
        confirmado: true,
        fonte: { nome: 'jfcaranguejeira.pt', url: 'https://jfcaranguejeira.pt/' },
        consultado: '11/11/2026',
      },
      {
        nome: 'Bombeiros que servem Caranguejeira',
        num: null,
        desc: 'Número direto por confirmar com a Proteção Civil Municipal.',
        confirmado: false,
      },
      {
        nome: 'Posto local da GNR',
        num: null,
        desc: 'Número e posto responsável por confirmar.',
        confirmado: false,
      },
      {
        nome: 'Proteção Civil Municipal de Leiria',
        num: null,
        desc: 'Número direto por confirmar com a Câmara Municipal.',
        confirmado: false,
        // Pista: 244 849 700, "Central Municipal de Operações de Socorro de Leiria",
        // num comunicado da Câmara Municipal de Leiria de 2021. Confirmar se ainda é este.
      },
    ],
  },
];

// "808 24 24 24" -> "808242424", para usar em href="tel:…"
export const paraTel = (num) => num.replace(/\s/g, '');

// Versão da app e o que mudou em cada uma ("Novidades", em Sobre a app).
// Ao publicar uma versão nova: mude VERSAO aqui e em sw.js, e junte uma entrada ao topo.
// A mesma história está em CHANGELOG.md, para quem mantém a app.

export const VERSAO = '0.11.0';

export const NOVIDADES = [
  {
    versao: '0.11.0',
    data: '24/11/2026',
    itens: [
      'A temperatura de hoje no topo do início: a máxima, a mínima, a probabilidade de chuva e um desenho do tempo, com a previsão do IPMA para Leiria.',
      'Na página dos avisos, um cartão para hoje e cada um dos 3 dias seguintes, com a máxima, a mínima, a chuva e o vento.',
      'Em cada dia, deslize a nuvem para ver a temperatura, o tempo e a chuva hora a hora. O fundo do cartão muda com o tempo: sol, nuvens, chuva, trovoada, nevoeiro ou neve, e de noite fica escuro, com lua e estrelas.',
      'A previsão fica guardada no telemóvel e continua a aparecer sem rede.',
    ],
  },
  {
    versao: '0.10.0',
    data: '17/11/2026',
    itens: [
      'Avisar a família: uma SMS a dizer que está bem (ou que precisa de ajuda) e onde está. Funciona sem internet, basta haver rede.',
      'O sítio vai em palavras, por exemplo "Perto de: Junta de Freguesia de Caranguejeira (300 m a norte)", e com uma ligação para o mapa.',
      'Quem recebe a SMS toca na ligação e vê onde a pessoa está, a que distância fica e como lá chegar.',
      'A localização só sai do telemóvel na mensagem que enviar. A app não a guarda nem a envia para nenhum servidor.',
    ],
  },
  {
    versao: '0.9.0',
    data: '16/11/2026',
    itens: [
      'O topo do início mostra o que é mais grave para Caranguejeira: um incêndio ativo a menos de 10 km, senão um aviso do IPMA, senão verde. Os incêndios noutros pontos do distrito passam para uma linha por baixo.',
      'Dados dos fogos com mais de uma hora deixam de aparecer como atuais, no início e na página dos fogos. A app diz se é falta de rede ou atraso do Fogos.pt.',
      'Nos mapas, um dedo volta a deslizar a página; para mover o mapa, use dois dedos.',
      'Tocar no mapa dos pontos de encontro pergunta antes de guardar, e trocar um ponto pode ser desfeito.',
      'Menu mais curto: os três kits, o plano com os pontos de encontro e o simulacro com o quiz ficam juntos, com separadores. Os contactos úteis sobem para o topo.',
    ],
  },
  {
    versao: '0.8.1',
    data: '14/11/2026',
    itens: [
      'O topo do início passa a mostrar os fogos: vermelho com um incêndio ativo perto de Caranguejeira, laranja com incêndios noutros pontos do distrito e verde sem incêndios.',
      'Os avisos do tempo do IPMA ficam numa linha logo a seguir.',
      'Em computadores com ecrã mais baixo, o menu lateral cabe inteiro, sem barra de deslizar.',
    ],
  },
  {
    versao: '0.8.0',
    data: '12/11/2026',
    itens: [
      'Kit do carro: o que ter no carro para esperar várias horas numa estrada cortada.',
      'O kit de emergência e o kit do carro perguntam quantas pessoas vivem consigo e calculam a água (por exemplo, 27 litros para 3 pessoas).',
      'Dois guias novos: "Ordem para sair de casa" e "Falta de água prolongada".',
      'Esta lista de novidades.',
    ],
  },
  {
    versao: '0.7.0',
    data: '12/11/2026',
    itens: [
      'Fogos: as ocorrências ativas no distrito de Leiria num mapa e numa lista, com dados do Fogos.pt, e um aviso no início se houver um incêndio ativo a menos de 10 km.',
      'Imprimir o kit, a mochila, os contactos e o plano da família numa folha A4.',
      'Itens opcionais (bebés, animais, extras) já não contam para acabar o kit e a mochila.',
      'Guardar uma cópia dos seus dados e repô-la noutro telemóvel.',
      'Simulacro: treinar a saída de casa com cronómetro.',
      'Quiz com 13 perguntas sobre autoproteção.',
    ],
  },
  {
    versao: '0.6.0',
    data: '12/11/2026',
    itens: [
      'Plano da família: quem vive em casa, contactos, pontos de encontro e como sair.',
      'Pontos de encontro num mapa de Caranguejeira, com "Onde estou" e "Como chegar".',
      'Prazos de validade da água, comida, medicamentos e pilhas, com aviso no início quando algo está a acabar.',
      'O início mostra quanto falta no kit, na mochila, no plano e nos pontos de encontro.',
    ],
  },
  {
    versao: '0.5.0',
    data: '12/11/2026',
    itens: [
      'Kit mochila de emergência, para 3 a 5 dias fora de casa.',
      'Guia "Como arrumar a mochila": a mochila desenhada enche-se à medida que se desce pelos passos.',
      'Ligações e botões mais fáceis de tocar, e o que falta sempre à vista.',
    ],
  },
  {
    versao: '0.4.1',
    data: '11/11/2026',
    itens: [
      'Kit de emergência com grupos que abrem e fecham, ícones e progresso por grupo.',
      'Sismos com o diagrama ao lado da lista nos ecrãs grandes.',
      'Nome oficial da unidade e lápis para quem gere a app editar o conteúdo.',
    ],
  },
  {
    versao: '0.4.0',
    data: '11/11/2026',
    itens: [
      'Novo endereço: upcc.pt.',
      'Avisos com uma linha do tempo dos próximos 3 dias.',
      'Sismos num diagrama com Caranguejeira ao centro.',
      'A Proteção Civil passa a poder editar o kit, os contactos e os guias.',
    ],
  },
  {
    versao: '0.3.0',
    data: '11/11/2026',
    itens: [
      'Avisos do IPMA para o distrito de Leiria, em direto e guardados para ver sem rede.',
      'Sismos recentes registados pelo IPMA perto de Caranguejeira.',
    ],
  },
  {
    versao: '0.2.0',
    data: '11/11/2026',
    itens: [
      'Guias "O que fazer se…" com figuras animadas para 9 riscos.',
      'Contactos úteis: toque para ligar, só números confirmados.',
      'Kit de emergência para 72 horas.',
    ],
  },
  {
    versao: '0.1.0',
    data: '11/11/2026',
    itens: [
      'Primeira versão: a app instala-se no telemóvel e funciona sem internet.',
    ],
  },
];

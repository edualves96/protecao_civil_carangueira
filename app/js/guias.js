// "O que fazer se…": um guia visual para cada risco.
//
// Cada guia tem:
// - primeiro: os passos principais, numerados, pela ordem em que se fazem;
// - se: situações escritas como pergunta (q), com a resposta (t) e o porquê (d);
// - mais: o que não é urgente (depois, para estar preparado), recolhido por defeito.
// `fig` é o nome da figura em figuras.js. Os números de telefone passam a ligar com um toque.
//
// Textos escritos a partir das recomendações da ANEPC, do IPMA e do SNS 24.
// Antes de divulgar a app, devem ser revistos pela Proteção Civil Municipal de Leiria
// (é uma tarefa do plano; não se mostra aviso de "provisório" na app).

export const FONTE_GUIAS = 'Baseado nas recomendações da Autoridade Nacional de Emergência e Proteção Civil (ANEPC).';
export const SEGUIR_AUTORIDADES = 'Siga sempre as indicações dos serviços de emergência e das autoridades locais.';

export const GUIAS_VISUAIS = {
  sismo: {
    primeiro: {
      titulo: 'Quando o chão tremer',
      passos: [
        { fig: 'mesa', t: 'Baixe-se, proteja-se e aguarde.', d: 'Debaixo de uma mesa resistente, agarrado a ela, até o chão parar de tremer.' },
        { fig: 'ficar', t: 'Não fuja para a rua.', d: 'Nem use o elevador ou as escadas enquanto o chão tremer.' },
        { fig: 'aberto', t: 'Quando parar, saia com calma para um espaço aberto.', d: 'Pelas escadas, longe de edifícios. Leve o kit e conte com réplicas.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'parede', q: 'Não há mesa?', t: 'Baixe-se junto a uma parede interior.', d: 'Longe de janelas e de móveis que possam cair. Proteja a cabeça com os braços.' },
        { fig: 'rua', q: 'Está na rua?', t: 'Afaste-se de edifícios e de cabos.', d: 'E também de muros, árvores e postes.' },
        { fig: 'carro', q: 'Está a conduzir?', t: 'Pare num local seguro e fique no carro.', d: 'Longe de pontes, túneis e edifícios.' },
        { fig: 'gas', q: 'Cheira a gás?', t: 'Não acenda nada e saia.', d: 'Nem luzes, nem fósforos, nem isqueiros. Feche a torneira do gás e abra as janelas.' },
      ],
    },
    mais: [
      {
        titulo: 'Depois do sismo',
        passos: [
          ['Conte as pessoas que estão consigo e veja se há feridos.', 'Ajude sem se pôr em perigo.'],
          ['Ligue 112 só para emergências,', 'para não bloquear as linhas.'],
          ['Se o edifício tiver estragos, não volte a entrar.', 'Desligue a eletricidade, o gás e a água, se o puder fazer em segurança.'],
          ['Vá para o ponto de encontro', 'combinado com a família.'],
          ['Ouça a rádio', 'e siga as indicações das autoridades.'],
        ],
      },
      {
        titulo: 'Para estar preparado',
        passos: [
          ['Fixe à parede', 'estantes, armários altos e outros móveis pesados que possam tombar.'],
          ['Ponha os objetos pesados', 'nas prateleiras de baixo.'],
          ['Mantenha as saídas de casa desimpedidas.', ''],
          ['Saiba onde se desliga', 'a água, o gás e a eletricidade de casa.'],
          ['Escolha os sítios mais seguros', 'de cada divisão: debaixo de mesas resistentes e junto a paredes interiores.'],
          ['Prepare o kit de emergência', 'e combine um ponto de encontro com a família.'],
        ],
      },
    ],
  },

  'incendio-rural': {
    primeiro: {
      titulo: 'Se vir um incêndio',
      passos: [
        { fig: 'ligar', t: 'Ligue 112.', d: 'Diga onde é o fogo: localidade, rua ou um sítio conhecido.' },
        { fig: 'afastar', t: 'Afaste-se do fumo e das chamas.', d: 'Não tente apagar sozinho um fogo grande.' },
        { fig: 'evacuar', t: 'Se mandarem sair, saia cedo.', d: 'Pelo caminho que a GNR e os bombeiros indicarem. Leve o kit.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'fumo-estrada', q: 'Fumo ou chamas no caminho?', t: 'Não atravesse.', d: 'Nem a pé nem de carro. Nunca fuja para o mato nem encosta acima.' },
        { fig: 'casa-fechar', q: 'Não pode sair de casa?', t: 'Fique dentro e feche tudo.', d: 'Portas, janelas e portadas. Tape as frinchas com panos molhados.' },
        { fig: 'baldes', q: 'O fogo está perto de casa?', t: 'Encha baldes com água.', d: 'E a banheira e os lavatórios. Tenha a mangueira pronta.' },
        { fig: 'pano', q: 'Há fumo?', t: 'Proteja a boca e o nariz.', d: 'Com um pano molhado.' },
      ],
    },
    mais: [
      {
        titulo: 'Depois do incêndio',
        passos: [
          ['Só volte para casa quando as autoridades disserem que é seguro.', ''],
          ['Se a casa tiver estragos ou cheirar a gás,', 'não entre e peça ajuda.'],
          ['Vigie a casa e o terreno durante várias horas.', 'Apague com água qualquer brasa ou fumo que volte a aparecer.'],
          ['Afaste-se de árvores, postes e cabos queimados', 'e de materiais ainda quentes. Podem cair ou queimar sem aviso.'],
        ],
      },
      {
        titulo: 'Para estar preparado',
        passos: [
          ['Limpe o mato à volta da casa', 'numa faixa de pelo menos 50 metros.'],
          ['Mantenha livres os acessos e as saídas da casa.', ''],
          ['Saiba como sair da zona', 'e combine com a família onde se encontram.'],
          ['Em dias de risco, acompanhe os avisos', 'e as indicações das autoridades.'],
          ['Guarde a lenha, o gás e outros produtos que ardem', 'longe das paredes da casa.'],
          ['Não faça queimas nem fogueiras', 'sem confirmar primeiro se são permitidas nesse dia.'],
          ['Não deite beatas para o chão', 'nem pela janela do carro.'],
        ],
      },
    ],
  },

  cheias: {
    primeiro: {
      titulo: 'Durante as cheias',
      passos: [
        { fig: 'nao-atravessar', t: 'Não atravesse zonas alagadas.', d: 'Nem a pé nem de carro. A água pode esconder buracos e arrastar um carro.' },
        { fig: 'subir', t: 'Vá para um sítio mais alto.', d: 'Longe de rios e ribeiras. Nunca para caves nem garagens.' },
        { fig: 'radio', t: 'Ouça a rádio e siga as indicações.', d: 'Se mandarem sair, saia logo e leve o kit.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'agua-casa', q: 'A água entrou em casa?', t: 'Desligue a luz e o gás e suba.', d: 'Se o puder fazer em segurança. Vá para um andar mais alto.' },
        { fig: 'cabo', q: 'Vê cabos elétricos caídos?', t: 'Afaste-se.', d: 'E não toque na água à volta deles.' },
        { fig: 'voltar', q: 'A água já baixou?', t: 'Só volte quando disserem que é seguro.', d: 'Não toque em aparelhos nem fios molhados.' },
      ],
    },
    mais: [
      {
        titulo: 'Depois das cheias',
        passos: [
          ['Não volte a ligar a eletricidade', 'antes de um eletricista confirmar que a instalação está seca e segura.'],
          ['Não beba água da torneira nem coma alimentos', 'que possam ter estado em contacto com a água, até ter a certeza de que são seguros.'],
          ['Limpe e desinfete', 'tudo o que a água tocou. Use luvas e botas.'],
          ['Fotografe os estragos', 'antes de limpar, para o seguro.'],
        ],
      },
      {
        titulo: 'Para estar preparado',
        passos: [
          ['Saiba se a sua casa fica numa zona que costuma inundar.', 'Pergunte na Junta de Freguesia.'],
          ['Conheça os sítios mais altos', 'e os caminhos para sair da sua zona.'],
          ['Guarde documentos e medicamentos essenciais', 'num sítio alto e fácil de levar.'],
          ['Mantenha limpos', 'os algerozes, as caleiras e as sarjetas junto a casa.'],
          ['Se houver aviso de cheia, tire o carro das zonas baixas,', 'se o puder fazer em segurança.'],
        ],
      },
    ],
  },

  calor: {
    primeiro: {
      titulo: 'Enquanto estiver muito calor',
      passos: [
        { fig: 'beber', t: 'Beba água muitas vezes.', d: 'Mesmo sem sede. Evite álcool e bebidas muito açucaradas.' },
        { fig: 'sol-casa', t: 'Fique em casa entre as 11 e as 17 horas.', d: 'São as horas de mais calor. Evite esforços.' },
        { fig: 'persianas', t: 'Feche as persianas durante o dia.', d: 'E abra as janelas à noite, para refrescar a casa.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'ligar', q: 'Alguém está confuso ou desmaiou?', t: 'Ligue 112.', d: 'Também se tiver a pele muito quente e seca. Leve-a para um sítio fresco e molhe-a com água.' },
        { fig: 'tonturas', q: 'Dor de cabeça ou tonturas?', t: 'Descanse num sítio fresco e beba água.', d: 'Se não passar, ligue para o SNS 24, 808 24 24 24.' },
        { fig: 'carro-calor', q: 'Vai deixar o carro?', t: 'Não deixe ninguém lá dentro.', d: 'Nem crianças, nem pessoas idosas, nem animais.' },
        { fig: 'vizinho', q: 'Alguém perto vive sozinho?', t: 'Ligue-lhe ou faça uma visita.', d: 'Sobretudo a pessoas idosas ou doentes.' },
      ],
    },
    mais: [
      {
        titulo: 'Mais conselhos',
        passos: [
          ['Use roupa leve e de cor clara,', 'chapéu e protetor solar quando sair.'],
          ['Tome duches de água fresca.', ''],
          ['Passe algumas horas num sítio fresco', 'ou com ar condicionado, se a casa estiver muito quente.'],
        ],
      },
      {
        titulo: 'Para estar preparado',
        passos: [
          ['Tenha água em casa', 'e deixe as tarefas mais pesadas para as horas mais frescas.'],
          ['Prepare um sítio fresco para descansar,', 'na divisão mais fresca da casa.'],
          ['Combine com vizinhos e familiares', 'quem vai ver como estão as pessoas mais frágeis.'],
        ],
      },
    ],
  },

  tempestade: {
    primeiro: {
      titulo: 'Durante a tempestade',
      passos: [
        { fig: 'casa-vento', t: 'Fique em casa, longe das janelas.', d: 'Evite sair e conduzir.' },
        { fig: 'arvore', t: 'Afaste-se de árvores, postes e muros.', d: 'E de andaimes e placas que possam cair. Não se abrigue junto deles.' },
        { fig: 'cabo', t: 'Não toque em cabos elétricos caídos.', d: 'Afaste-se e ligue para a E-REDES, 800 506 506. Se houver perigo, ligue 112.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'carro', q: 'Está a conduzir?', t: 'Abrande e pare num local seguro.', d: 'Longe de árvores e cabos.' },
        { fig: 'trovoada', q: 'Há trovoada?', t: 'Não se abrigue debaixo de árvores.', d: 'E afaste-se de vedações e estruturas de metal.' },
        { fig: 'ramos', q: 'Ramos ou objetos presos nos fios?', t: 'Não tente tirá-los.', d: 'Cuidado também com telhas e vidros soltos que ainda possam cair.' },
        { fig: 'vizinho', q: 'A tempestade passou?', t: 'Veja como estão os vizinhos.', d: 'Sobretudo quem vive sozinho.' },
      ],
    },
    mais: [
      {
        titulo: 'Para estar preparado',
        passos: [
          ['Prenda ou guarde', 'vasos, estendais, toldos e outros objetos soltos em varandas e quintais.'],
          ['Não deixe o carro debaixo de árvores', 'nem junto a estruturas frágeis.'],
          ['Verifique o telhado, as chaminés e os algerozes', 'antes do inverno.'],
          ['Tenha uma lanterna e um rádio a pilhas,', 'com pilhas de reserva, e o telemóvel carregado.'],
        ],
      },
    ],
  },

  frio: {
    primeiro: {
      titulo: 'Enquanto estiver muito frio',
      passos: [
        { fig: 'camadas', t: 'Vista várias camadas de roupa.', d: 'Proteja a cabeça, as mãos e os pés. Troque logo a roupa molhada.' },
        { fig: 'aquecer', t: 'Nunca aqueça a casa com braseiras ou fogareiros.', d: 'Nem com aquecedores a gás numa divisão fechada: libertam monóxido de carbono, um gás que mata.' },
        { fig: 'arejar', t: 'Areje a casa todos os dias.', d: 'Mesmo que por pouco tempo.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'ligar', q: 'Alguém treme muito ou está confuso?', t: 'Ligue 112.', d: 'Leve a pessoa para um sítio quente e aqueça-a aos poucos, com mantas.' },
        { fig: 'co', q: 'Dor de cabeça junto ao aquecedor?', t: 'Abra as janelas e saia.', d: 'Também se tiver enjoos ou tonturas. Pode ser monóxido de carbono. Ligue 112.' },
        { fig: 'dormir', q: 'Vai dormir?', t: 'Desligue os aquecedores.', d: 'E mantenha-os longe de cortinas, roupa e móveis.' },
        { fig: 'vizinho', q: 'Alguém perto vive sozinho?', t: 'Ligue-lhe ou faça uma visita.', d: 'Sobretudo a pessoas idosas ou doentes.' },
      ],
    },
    mais: [
      {
        titulo: 'Mais conselhos',
        passos: [
          ['Faça refeições quentes', 'e beba líquidos quentes. Evite bebidas alcoólicas.'],
          ['Saia o menos possível', 'e esteja pouco tempo ao frio.'],
          ['Evite conduzir com gelo na estrada.', ''],
        ],
      },
      {
        titulo: 'Para estar preparado',
        passos: [
          ['Tenha roupa quente e mantas', 'à mão.'],
          ['Verifique se os aquecedores estão em bom estado.', 'Não use um aparelho danificado sem o mandar ver.'],
          ['Combine com vizinhos e familiares', 'quem acompanha as pessoas idosas, isoladas ou doentes.'],
        ],
      },
    ],
  },

  'incendio-casa': {
    primeiro: {
      titulo: 'Se houver fogo em casa',
      passos: [
        { fig: 'sair', t: 'Avise todos e saia.', d: 'Não volte atrás para ir buscar nada.' },
        { fig: 'porta', t: 'Feche as portas ao sair.', d: 'Atrasa o fogo e o fumo.' },
        { fig: 'ligar', t: 'Ligue 112 já cá fora.', d: 'Diga a morada e se ainda há alguém lá dentro.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'fumo', q: 'Há fumo?', t: 'Baixe-se e ande de gatas.', d: 'Junto ao chão o ar é mais limpo.' },
        { fig: 'quente', q: 'A porta está quente?', t: 'Não abra.', d: 'Toque-lhe antes com as costas da mão. Se aquecer, procure outra saída.' },
        { fig: 'escadas', q: 'Mora num prédio?', t: 'Desça pelas escadas.', d: 'Nunca use o elevador.' },
        { fig: 'janela', q: 'Ficou preso?', t: 'Feche a porta e peça ajuda à janela.', d: 'Tape as frinchas da porta com panos molhados.' },
        { fig: 'rolar', q: 'A roupa pegou fogo?', t: 'Pare, deite-se e role.', d: 'Tape a cara com as mãos até apagar.' },
        { fig: 'tampa', q: 'Óleo a arder na frigideira?', t: 'Desligue o fogão e tape.', d: 'Com uma tampa ou um pano húmido. Nunca deite água.' },
      ],
    },
    mais: [
      {
        titulo: 'Depois do incêndio',
        passos: [
          ['Fique num sítio seguro', 'e espere pelos bombeiros.'],
          ['Só volte a entrar', 'quando os bombeiros disserem que é seguro.'],
          ['Não ligue aparelhos nem a eletricidade', 'na zona atingida pelo fogo ou pela água usada para o apagar.'],
        ],
      },
      {
        titulo: 'Para prevenir',
        passos: [
          ['Instale detetores de fumo', 'e teste-os uma vez por mês.'],
          ['Tenha uma manta ignífuga ou um extintor na cozinha', 'e saiba usá-los.'],
          ['Combine com a família', 'por onde sair de casa e onde se encontram lá fora.'],
          ['Guarde fósforos e isqueiros', 'longe das crianças.'],
          ['Não cozinhe sem vigiar', 'e não ligue muitos aparelhos à mesma tomada.'],
        ],
      },
    ],
  },

  'materias-perigosas': {
    primeiro: {
      titulo: 'Se vir um acidente',
      passos: [
        { fig: 'vento', t: 'Afaste-se para o lado de onde vem o vento.', d: 'Não atravesse fumo, derrames nem zonas vedadas.' },
        { fig: 'nao-filmar', t: 'Não se aproxime para ver nem filmar.', d: 'Não toque em nada e não fume nem acenda chamas.' },
        { fig: 'ligar', t: 'Ligue 112 já em segurança.', d: 'Diga onde é e o que viu. Se puder, os números da placa laranja do veículo.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'casa-fechar', q: 'Mandaram ficar em casa?', t: 'Feche portas e janelas.', d: 'Desligue a ventilação, tape as frinchas e fique numa divisão interior.' },
        { fig: 'escola', q: 'Os filhos estão na escola?', t: 'Não os vá buscar.', d: 'A escola tem um plano para os proteger.' },
        { fig: 'lavar', q: 'Teve contacto com o produto?', t: 'Tire a roupa e lave-se bem.', d: 'Evite tocar noutras pessoas. Ligue para o Centro de Informação Antivenenos, 800 250 250.' },
      ],
    },
    mais: [
      {
        titulo: 'Até ser seguro',
        passos: [
          ['Se as autoridades mandarem sair,', 'siga o caminho que indicarem.'],
          ['Ouça a rádio', 'e só saia de casa quando as autoridades disserem.'],
          ['Não volte à zona', 'até as autoridades dizerem que é seguro.'],
          ['Areje a casa', 'quando as autoridades disserem que pode.'],
          ['Não apanhe objetos nem animais', 'da zona afetada.'],
        ],
      },
      {
        titulo: 'Para estar preparado',
        passos: [
          ['Saiba como vai receber os avisos', 'das autoridades na sua zona.'],
          ['Tenha à mão', 'os contactos de emergência e uma lanterna.'],
        ],
      },
    ],
  },

  energia: {
    primeiro: {
      titulo: 'Durante a falha de energia',
      passos: [
        { fig: 'lanterna', t: 'Use lanternas, não velas.', d: 'As velas podem causar incêndios.' },
        { fig: 'tomada', t: 'Desligue os aparelhos da tomada.', d: 'Deixe só uma luz ligada para saber quando a energia volta.' },
        { fig: 'frigorifico', t: 'Mantenha o frigorífico fechado.', d: 'E a arca também, para conservar o frio.' },
      ],
    },
    se: {
      titulo: 'E se…',
      passos: [
        { fig: 'gerador', q: 'Tem gerador ou fogareiro?', t: 'Nunca o use dentro de casa.', d: 'Nem grelhadores, nem noutro espaço fechado: libertam monóxido de carbono, um gás que mata.' },
        { fig: 'cabo', q: 'Vê fios caídos?', t: 'Afaste-se.', d: 'Para avisar de uma avaria, ligue para a E-REDES, 800 506 506.' },
        { fig: 'medico', q: 'Alguém depende de um aparelho médico?', t: 'Sem bateria, ligue 112.', d: 'E combine antes uma alternativa com os serviços de saúde.' },
      ],
    },
    mais: [
      {
        titulo: 'Enquanto espera',
        passos: [
          ['Ouça a rádio a pilhas', 'ou a do carro para saber o que se passa.'],
          ['Poupe a bateria do telemóvel.', 'Use-o só para o essencial.'],
        ],
      },
      {
        titulo: 'Quando a energia voltar',
        passos: [
          ['Antes de voltar a ligar os aparelhos,', 'veja se estão secos e sem estragos. Ligue-os aos poucos.'],
          ['Na dúvida, deite fora', 'a comida que ficou demasiado tempo sem frio ou que cheira mal.'],
          ['Peça ajuda', 'se houver fios, aparelhos ou instalações danificados.'],
        ],
      },
      {
        titulo: 'Para estar preparado',
        passos: [
          ['Tenha lanternas, pilhas, um rádio a pilhas e uma bateria externa carregada.', ''],
          ['Guarde água e comida', 'que não precise de frio nem de ser cozinhada, e os medicamentos essenciais.'],
          ['Saiba abrir à mão', 'o portão da garagem e outras portas elétricas.'],
        ],
      },
    ],
  },
};

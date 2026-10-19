import { CBDProduct } from './cbdGuide';

export interface GreenBudzProduct extends CBDProduct {
  flavor?: string;
  cannabinoidRatio?: string;
  volumeOrWeight?: string;
  thcContent?: string;
  cbdContent?: string;
}

export const GREENBUDZ_COMPANY_INFO = {
  name: "GreenBudzCBD",
  fullName: "GreenBudzCBD — Premium Hemp & Medical Extracts (EUA)",
  origin: "Importado (EUA • Anvisa RDC 660/2022)",
  nature: "Laboratório Americano de Biotecnologia em Fitocanabinoides & Extração Live Rosin Solventless",
  validityMonths: 24,
  description: "A GreenBudzCBD é uma marca norte-americana de destaque no desenvolvimento de extratos medicinais de cânhamo, gomas veganas Live Rosin sem solventes (Linha Drops By GreenBudz) e óleos de alta densidade como o Calm Vibe 6000mg. Todos os produtos possuem certificação cGMP e laudo de análise laboratorial COA.",
  catalogSections: [
    "1. Óleos Sublinguais de Alta Concentração (Calm Vibe 6000mg, Full Balance 3000mg, CBD Isolate)",
    "2. Gomas Terapêuticas Live Rosin (Drops By GreenBudz: Looking Glass, Beethoven, Evergreen, Nightshade, Chill Vibe 1:1)",
    "3. Flores Medicinais & Formulas In Natura em THCa (Dried Hemp Formula, Stirred Hemp Formula 14g)",
    "4. Concentrados de Alta Pureza (Isolate THCa Crystalline)"
  ]
};

export const GREENBUDZ_PRODUCTS: GreenBudzProduct[] = [
  // =========================================================================
  // 1. ÓLEOS SUBLINGUAIS DE ALTA CONCENTRAÇÃO (GREENBUDZ PHARMA)
  // =========================================================================
  {
    name: "GreenBudz Calm Vibe Oil 6000mg • 200 mg/ml (30 mL)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Óleo Full Spectrum de Alta Potência (200 mg/mL)",
    volumeOrWeight: "30 mL",
    cannabinoidRatio: "Full Spectrum Alta Densidade",
    priceBRL: 890.00,
    activeIngredients: "Canabidiol (CBD) Full Spectrum 200 mg/mL enriquecido com CBC, CBG, CBN e terpenos naturais",
    concentration: "200 mg/mL de CBD Full Spectrum (6.000 mg por frasco de 30 mL) • 10,0 mg CBD por gota",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL com Cânula Graduada)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    usageInstructions: "• Administrar por via sublingual. Iniciar com 2 a 3 gotas (20 mg a 30 mg) de 12 em 12 horas.\n• Reter o líquido sob a língua por 60 a 90 segundos antes de deglutir.\n• Titular gradualmente a cada 4 a 5 dias até alívio satisfatório dos sintomas.",
    details: ["Frasco 30 mL (~600 gotas)", "Concentração 200 mg/mL (6.000 mg)", "10 mg CBD por gota", "Full Spectrum cGMP", "Importado EUA • Anvisa RDC 660"],
    description: "Formulação de altíssima densidade terapêutica projetada para patologias de difícil controle, dores crônicas severas, insônia grave e crises de ansiedade refratárias.",
    indications: "Dores neuropáticas intensas, fibromialgia severa, distúrbios graves do sono, espasticidade e ansiedade generalizada grave."
  },
  {
    name: "GreenBudz Full Balance Oil 3000mg • 100 mg/ml (30 mL)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Óleo Full Spectrum Equilibrado (100 mg/mL)",
    volumeOrWeight: "30 mL",
    cannabinoidRatio: "Full Spectrum Balanced",
    priceBRL: 490.00,
    activeIngredients: "Canabidiol (CBD) Full Spectrum 100 mg/mL com perfil completo de terpenos aromáticos",
    concentration: "100 mg/mL de CBD Full Spectrum (3.000 mg por frasco de 30 mL) • 5,0 mg CBD por gota",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    usageInstructions: "• Iniciar com 3 a 5 gotas de 12 em 12 horas. Reter por 60 segundos sob a língua.",
    details: ["Frasco 30 mL", "Concentração 100 mg/mL (3.000 mg)", "5 mg CBD por gota", "Full Spectrum Balanced", "Importado EUA"],
    description: "Fórmula versátil e de alta aderência posológica para equilíbrio do sistema endocanabinoide, regulação do estresse e modulação do humor.",
    indications: "Ansiedade moderada, estresse crônico, foco, fadiga mental, dores articulares e prevenção da insônia."
  },
  {
    name: "GreenBudz Isolate CBD Hemp Formula 3000mg • 100 mg/ml (30 mL — 0% THC)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Óleo CBD Isolado Puro (0% THC)",
    volumeOrWeight: "30 mL",
    cannabinoidRatio: "Isolate 0% THC",
    priceBRL: 520.00,
    activeIngredients: "Canabidiol (CBD) Isolado de alta pureza (>99,8%) em veículo de óleo MCT",
    concentration: "100 mg/mL de CBD Isolado (3.000 mg por frasco de 30 mL) • 0,0% THC",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    usageInstructions: "• Administrar sublingual 3 a 5 gotas 2x ao dia. Isento de THC para total segurança profissional.",
    details: ["Frasco 30 mL", "3.000 mg CBD Isolado", "0% THC Garantido", "Veículo MCT Puro", "Atletas WADA & Testes Toxicológicos"],
    description: "Formulação isolada livre de THC desenvolvida para atletas sob controle antidoping, pilotos, militares e indivíduos sensíveis a fitocanabinoides psicoativos.",
    indications: "Ansiedade no esporte, recuperação muscular, foco competitivo, estresse diurno e insônia leve."
  },

  // =========================================================================
  // 2. GOMAS TERAPÊUTICAS LIVE ROSIN & EDIBLES (DROPS BY GREENBUDZ)
  // =========================================================================
  {
    name: "Drops By GreenBudz Goma Looking Glass CBD THC CBC CBG (30 gomas)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Gomas Terapêuticas Live Rosin Multi-Canabinoide",
    volumeOrWeight: "Frasco com 30 gomas",
    flavor: "Framboesa Natural",
    priceBRL: 290.00,
    activeIngredients: "Extrato Live Rosin Solventless rico em CBD, THC, CBC e CBG em gomas de pectina vegana",
    concentration: "Sinergia Multi-Canabinoide (25 mg de canabinoides ativos por goma)",
    pharmaceuticalForm: "Gomas Mastigáveis Veganas (Pectina)",
    quantity: "01 Frasco de 30 gomas",
    administrationRoute: "Via Oral Mastigável",
    usageInstructions: "• Mastigar 01 goma lentamente ao final da tarde ou à noite. Efeito com início entre 30 e 60 minutos e duração prolongada de 6 a 8 horas.",
    details: ["Frasco 30 gomas", "Extrato Live Rosin Solventless", "Sinergia CBD + THC + CBC + CBG", "Gomas Veganas de Pectina", "Sabor Framboesa"],
    description: "Combina a pureza do extrato Live Rosin extraído sem solventes químicos com o efeito entourage dos canabinoides CBD, THC, CBC e CBG.",
    indications: "Estresse profundo, relaxamento muscular, dores persistentes, ansiedade vespertina e regulação funcional."
  },
  {
    name: "Drops By GreenBudz Goma Beethoven THC (30 gomas • Sabor Laranja)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Gomas Terapêuticas Live Rosin Analgésicas / Relaxantes",
    volumeOrWeight: "Frasco com 30 gomas",
    flavor: "Laranja Natural",
    priceBRL: 280.00,
    activeIngredients: "Extrato Live Rosin de alto teor de THC e terpenos miorrelaxantes selecionados em base de pectina",
    concentration: "10 mg THC + Terpenos Entourage por goma",
    pharmaceuticalForm: "Gomas Mastigáveis Veganas",
    quantity: "01 Frasco de 30 gomas",
    administrationRoute: "Via Oral Mastigável",
    usageInstructions: "• Mastigar 01 goma à noite ou pós-treino para relaxamento somático e conforto físico.",
    details: ["Frasco 30 gomas", "Live Rosin Solventless", "Rico em THC & Terpenos", "Sabor Laranja", "Conforto Físico & Analgesia"],
    description: "Desenvolvido para proporcionar alívio físico, descompressão muscular e bem-estar corporal sem sobrecarregar o estômago.",
    indications: "Dor muscular pós-exercício, contraturas, dor miofascial, artrite e tensão física acentuada."
  },
  {
    name: "Drops By GreenBudz Goma Evergreen THC (30 gomas • Sabor Limão)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Gomas Terapêuticas Live Rosin Vitalidade / Foco",
    volumeOrWeight: "Frasco com 30 gomas",
    flavor: "Limão Natural",
    priceBRL: 280.00,
    activeIngredients: "Extrato Live Rosin com THC e terpenos limoneno/pineno para clareza mental e vitalidade",
    concentration: "10 mg THC por goma com terpenos estimulantes naturais",
    pharmaceuticalForm: "Gomas Mastigáveis Veganas",
    quantity: "01 Frasco de 30 gomas",
    administrationRoute: "Via Oral Mastigável",
    usageInstructions: "• Mastigar 01 goma durante o dia para engajamento, sociabilidade e disposição.",
    details: ["Frasco 30 gomas", "Live Rosin Limão", "Terpenos Ativos Limoneno/Pineno", "Sabor Limão Refresh", "Vitalidade Diurna"],
    description: "Formulação diurna orientada à clareza mental, melhora do humor e disposição social sem provocar letargia.",
    indications: "Apatia, desânimo, fadiga crônica, anedonia e fadiga mental."
  },
  {
    name: "Drops By GreenBudz Goma Nightshade (30 gomas • Indução ao Sono)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Gomas Terapêuticas Indutoras de Sono Profundo",
    volumeOrWeight: "Frasco com 30 gomas",
    flavor: "Frutas Vermelhas / Amora",
    priceBRL: 310.00,
    activeIngredients: "Live Rosin com combinação sinérgica de THC, CBD, CBN e Mirceno indutor de sono",
    concentration: "Dose Terapêutica Noturna Típica de 15 mg Canabinoides + CBN por goma",
    pharmaceuticalForm: "Gomas Mastigáveis Veganas",
    quantity: "01 Frasco de 30 gomas",
    administrationRoute: "Via Oral Mastigável",
    usageInstructions: "• Mastigar 01 goma 45 a 60 minutos antes de deitar. Evitar telas brilhantes após a administração.",
    details: ["Frasco 30 gomas", "Combinação THC + CBD + CBN", "Terpeno Mirceno", "Sabor Amora", "Sono Contínuo Reparador"],
    description: "Especialmente desenhada para prevenir despertares noturnos e assegurar um ciclo de sono reparador e profundo.",
    indications: "Insônia inicial e intermediária, despertares frequentes, agitação noturna e ansiedade ao deitar."
  },
  {
    name: "GreenBudz Chill Vibe Gummies - THC 1:1 CBD (30 gomas)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Gomas Terapêuticas Equilibradas 1:1 (THC:CBD)",
    volumeOrWeight: "Frasco com 30 gomas",
    flavor: "Mix de Frutas Tropicais",
    priceBRL: 270.00,
    activeIngredients: "12,5 mg THC + 12,5 mg CBD por goma em matriz oral de alta biodisponibilidade",
    concentration: "25 mg de canabinoides totais por goma (1:1 THC:CBD)",
    pharmaceuticalForm: "Gomas Mastigáveis Terapêuticas",
    quantity: "01 Frasco de 30 gomas",
    administrationRoute: "Via Oral Mastigável",
    usageInstructions: "• Mastigar meio a 1 goma conforme tolerância e recomendação médica.",
    details: ["Frasco 30 gomas", "Equilíbrio 1:1 THC:CBD", "25 mg Canabinoides/Goma", "Sabor Frutas Tropicais"],
    description: "A proporção 1:1 perfeita entre THC e CBD oferece sinergia equilibrada para alívio modulado sem pico eufórico.",
    indications: "Dor moderada a intensa, espasmos, dores inflamatórias e modulação mista do humor."
  },

  // =========================================================================
  // 3. FLORES MEDICINAIS IN NATURA & FORMULAS EM THCa (14g)
  // =========================================================================
  {
    name: "GreenBudz Dried Hemp Formula rico em THCa (14g)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Flor Medicinal In Natura Selecionada em THCa",
    volumeOrWeight: "Embalagem Hermética com 14 gramas",
    thcContent: "Teor elevado de THCa (Tetra-hidrocanabinol Ácido) em flores inteiras",
    priceBRL: 750.00,
    activeIngredients: "Flores medicinais de cânhamo de cultivo orgânico indoor enriquecidas em THCa e terpenos",
    concentration: "High THCa Formula (14 gramas • ~53,50 R$/g)",
    pharmaceuticalForm: "Flor In Natura Inteira Seca para Inalação Vaporizada",
    quantity: "01 Pote / Pacote Hermético de 14g",
    administrationRoute: "Via Inalatória Controlada por Vaporizador de Ervas Secas",
    usageInstructions: "• Utilizar através de vaporizador medicinal de ervas secas com controle de temperatura (180°C a 210°C).\n• Iniciar com micro-inalações de 2 segundos e aguardar 15 minutos para avaliar o efeito.",
    details: ["Pacote 14g", "High THCa Natural", "Cultivo Indoor Orgânico", "Livre de Agrotóxicos", "Inalação por Vaporizador"],
    description: "Flores medicinais rigorosamente selecionadas e curadas para administração inalatória vaporizada com ação analgésica e ansiolítica quase imediata.",
    indications: "Resgate rápido de crises de dor, enxaqueca aguda, picos de ansiedade, espasmos agudos e náuseas."
  },
  {
    name: "GreenBudz Stirred Hemp Formula rico em THCa (14g)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Flor Medicinal In Natura Triturada Blend THCa",
    volumeOrWeight: "Embalagem Hermética de 14 gramas",
    thcContent: "THCa Balanceado com Terpenos Miorrelaxantes",
    priceBRL: 690.00,
    activeIngredients: "Blend de inflorescências medicinais trituradas em moinho farmacêutico",
    concentration: "Pre-ground THCa Formula (14 gramas)",
    pharmaceuticalForm: "Flor In Natura Pronta para Vaporização",
    quantity: "01 Pote de 14g",
    administrationRoute: "Via Inalatória por Vaporizador Medicinal",
    usageInstructions: "• Colocar a fração desejada na câmara de aquecimento do vaporizador. Inalar suavemente.",
    details: ["Pacote 14g", "Pronta para Uso", "Rica em Terpenos e THCa", "Ação Imediata"],
    description: "Fórmula pronta para uso inalatório imediato com padronização de granulometria para aquecimento homogêneo no câmara do vaporizador.",
    indications: "Alívio imediato de dor neuropática, espasmos musculares e momentos de estresse intenso."
  },
  {
    name: "GreenBudz Isolate THCa Hemp Formula (5g)",
    manufacturer: "GreenBudzCBD",
    origin: "Importado",
    type: "Concentrado Cristalino THCa Crystalline (>99% de Pureza)",
    volumeOrWeight: "Pote de Vidro Farmacêutico 5g",
    priceBRL: 450.00,
    activeIngredients: "Tetra-hidrocanabinol Ácido (THCa) cristalino puro em pó/microcristais",
    concentration: ">99% de THCa Cristalino Puro",
    pharmaceuticalForm: "Cristal Concentrado em Pó",
    quantity: "01 Pote de 5g",
    administrationRoute: "Via Inalatória / Vaporização",
    usageInstructions: "• Utilizar micro-fração em vaporizador de concentrados a temperatura controlada sob estrita prescrição médica.",
    details: ["Pote de 5g", "Pureza >99% THCa", "Zero Solventes Residual", "Ação Ultrarrápida Potente"],
    description: "Formulação isolada ultra-pura de THCa projetada para pacientes com alta tolerância que exigem resgate sintomático imediato.",
    indications: "Dor oncológica aguda, dores refratárias extremas e crises neurológicas paroxísticas."
  }
];

export function formatGreenBudzStandardOutput(product: GreenBudzProduct): string {
  const lines = [
    `• PRODUTO: ${product.name}`,
    `• FABRICANTE: ${product.manufacturer} (EUA • Anvisa RDC 660/2022)`,
    `• TIPO / APRESENTAÇÃO: ${product.type} — ${product.pharmaceuticalForm}`,
    `• CONCENTRAÇÃO: ${product.concentration}`,
    `• VIA DE ADMINISTRAÇÃO: ${product.administrationRoute}`,
    `• QUANTIDADE: ${product.quantity}`
  ];

  if (product.priceBRL !== undefined) {
    lines.push(`• VALOR DE IMPORTAÇÃO ESTIMADO: R$ ${product.priceBRL.toFixed(2).replace('.', ',')}`);
  }

  lines.push(`• INDICAÇÕES PRINCIPAIS: ${product.indications}`);
  lines.push(`• MODO DE USO: ${product.usageInstructions}`);

  return lines.join('\n');
}

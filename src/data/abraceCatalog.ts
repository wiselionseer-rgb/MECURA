import { CBDProduct } from './cbdGuide';

export interface AbraceProduct extends CBDProduct {
  colorLine?: 'Laranja' | 'Vermelho' | 'Cinza/Prata' | 'Preto' | 'Azul' | 'Roxo' | 'Flores' | 'Gomas' | 'Pomadas' | 'Sprays';
  ratio?: string;
  volumeOrWeight?: string;
  prescriptionExample?: string;
}

export const ABRACE_COMPANY_INFO = {
  name: "ABRACE",
  fullName: "ABRACE — Associação Brasileira de Apoio Cannabis Esperança",
  origin: "Nacional (Brasil - João Pessoa/PB)",
  nature: "Associação Pioneira de Pacientes e Cultivo Terapêutico Nacional Autorizado",
  validityMonths: 6,
  description: "A ABRACE é uma das mais tradicionais e pioneiras associações de apoio e pesquisa sobre cannabis medicinal no Brasil, fornecendo óleos terapêuticos padronizados por cores, flores in natura, gomas farmacotécnicas, pomadas ricas em canabinoides e sprays orais de resgate agudo com rigoroso controle de qualidade.",
  catalogSections: [
    "1. Óleos de Canabidiol (CBD)",
    "2. Óleos de Tetrahidrocanabinol (THC)",
    "3. Óleos Combinados CBD + THC (1:1)",
    "4. Flores de Cannabis In Natura",
    "5. Gomas de Canabinoides",
    "6. Pomadas e Cremes",
    "7. Sprays de Resgate"
  ]
};

export const ABRACE_PRODUCTS: AbraceProduct[] = [
  // ==========================================
  // 1. ÓLEOS DE CANABIDIOL (CBD)
  // ==========================================
  {
    name: "Óleo Laranja CBD 20 mg/mL — ABRACE (30 mL)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Óleo de Canabidiol (CBD)",
    colorLine: "Laranja",
    activeIngredients: "Canabidiol (CBD) integral",
    concentration: "20 mg/mL de CBD (Total: 600 mg no frasco)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    volumeOrWeight: "30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo Laranja CBD 20 mg/mL — ABRACE, 30 mL. Iniciar com 3 a 5 gotas sublinguais de 12/12h. Titular a cada 4 a 5 dias.",
    usageInstructions: "• Administrar por via sublingual, retendo sob a língua por 60 a 90 segundos antes de engolir para absorção transmucosa ideal.",
    details: ["Frasco 30 mL", "Concentração: 20 mg/mL CBD", "Total: 600 mg CBD", "Linha Laranja ABRACE", "Associação Nacional ABRACE Esperança"],
    description: "Óleo de Canabidiol (CBD) da ABRACE da Linha Laranja (20 mg/mL). Formulação suave ideal para titulação inicial, sensibilidade a canabinoides, crianças e idosos.",
    indications: "Ansiedade leve a moderada, estresse cotidiano, suporte inicial de titulação pediátrica ou geriátrica, modulação leve do sono e tensão psicossomática."
  },
  {
    name: "Óleo Laranja CBD 30 mg/mL — ABRACE (30 mL)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Óleo de Canabidiol (CBD)",
    colorLine: "Laranja",
    activeIngredients: "Canabidiol (CBD) integral",
    concentration: "30 mg/mL de CBD (Total: 900 mg no frasco)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    volumeOrWeight: "30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo Laranja CBD 30 mg/mL — ABRACE, 30 mL. Iniciar com 3 gotas sublinguais 2x ao dia. Ajustar conforme resposta clínica.",
    usageInstructions: "• Administrar sob a língua, mantendo contato com a mucosa por 60 segundos antes da deglutição. Seguir titulação médica.",
    details: ["Frasco 30 mL", "Concentração: 30 mg/mL CBD", "Total: 900 mg CBD", "Linha Laranja ABRACE", "Associação Nacional ABRACE Esperança"],
    description: "Óleo de Canabidiol (CBD) da ABRACE Linha Laranja intermediário (30 mg/mL). Excelente custo-efetividade para manutenção diurna de homeostase.",
    indications: "Ansiedade generalizada, estresse crônico, insônia de conciliação, dores inflamatórias leves a moderadas, TDAH e modulação neuroimune."
  },
  {
    name: "Óleo Vermelho CBD 100 mg/mL — ABRACE (30 mL)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Óleo de Canabidiol (CBD)",
    colorLine: "Vermelho",
    activeIngredients: "Canabidiol (CBD) concentrado",
    concentration: "100 mg/mL de CBD (Total: 3.000 mg no frasco)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    volumeOrWeight: "30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo Vermelho CBD 100 mg/mL — ABRACE, 30 mL. Iniciar com 2 a 3 gotas sublinguais a cada 12 horas. Titular conforme orientação médica.",
    usageInstructions: "• Alta concentração de CBD (100 mg/mL). Reter 60 a 90 segundos sob a língua. Titular lentamente conforme orientação médica.",
    details: ["Frasco 30 mL", "Alta Concentração: 100 mg/mL CBD", "Total: 3.000 mg CBD", "Linha Vermelha ABRACE", "Associação Nacional ABRACE Esperança"],
    description: "Óleo concentrado da Linha Vermelha da ABRACE (100 mg/mL de CBD). Densidade terapêutica elevada para patologias neurológicas e refratárias.",
    indications: "Epilepsia farmacorresistente, Transtorno do Espectro Autista (TEA), espasticidade, neuroproteção, síndromes de dor crônica inflamatória e distúrbios neurocomportamentais."
  },
  {
    name: "Óleo Cinza/Prata CBD 200 mg/mL — ABRACE (30 mL)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Óleo de Canabidiol (CBD)",
    colorLine: "Cinza/Prata",
    activeIngredients: "Canabidiol (CBD) ultra concentrado",
    concentration: "200 mg/mL de CBD (Total: 6.000 mg no frasco)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    volumeOrWeight: "30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo Cinza/Prata CBD 200 mg/mL — ABRACE, 30 mL. Iniciar com 1 a 2 gotas sublinguais 2x ao dia. Titular rigorosamente com o prescritor.",
    usageInstructions: "• Ultra-alta concentração (200 mg/mL). Microdosagem por gotas. Reter sob a língua antes de engolir.",
    details: ["Frasco 30 mL", "Ultra Concentração: 200 mg/mL CBD", "Total: 6.000 mg CBD", "Linha Cinza/Prata ABRACE", "Associação Nacional ABRACE Esperança"],
    description: "Formulação máxima de Canabidiol da ABRACE (Linha Cinza/Prata - 200 mg/mL). Máximo rendimento em volume reduzido para altas demandas farmacológicas.",
    indications: "Epilepsias graves e síndromes convulsivas refratárias (Lennox-Gastaut, Dravet), quadros neurodegenerativos avançados e dor neuropática crônica severa."
  },

  // ==========================================
  // 2. ÓLEOS DE TETRAHIDROCANABINOL (THC)
  // ==========================================
  {
    name: "Óleo Preto THC 30 mg/mL — ABRACE (30 mL)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Óleo de Tetrahidrocanabinol (THC)",
    colorLine: "Preto",
    activeIngredients: "Tetrahidrocanabinol (THC)",
    concentration: "30 mg/mL de THC (Total: 900 mg no frasco)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    volumeOrWeight: "30 mL",
    administrationRoute: "Via Sublingual Noturna / Oral",
    prescriptionExample: "Óleo Preto THC 30 mg/mL — ABRACE, 30 mL. Iniciar com 1 a 2 gotas sublinguais 30 a 60 min antes do repouso noturno.",
    usageInstructions: "• Administrar preferencialmente à noite. Iniciar em dose baixa (1 a 2 gotas) e titular a cada 5 a 7 dias conforme tolerância e orientação médica.",
    details: ["Frasco 30 mL", "Concentração: 30 mg/mL THC", "Total: 900 mg THC", "Linha Preto ABRACE", "Uso Noturno", "Associação Nacional ABRACE Esperança"],
    description: "Óleo da Linha Preto da ABRACE rico em Tetrahidrocanabinol (THC 30 mg/mL). Potente ação agonista CB1 para analgesia profunda, relaxamento muscular e regulação do sono.",
    indications: "Dores crônicas refratárias, insônia severa, espasticidade muscular, rigidez, perda de apetite e cuidados paliativos oncológicos."
  },

  // ==========================================
  // 3. ÓLEOS COMBINADOS CBD + THC (1:1)
  // ==========================================
  {
    name: "Óleo Azul CBD + THC 15 mg/mL + 15 mg/mL (1:1) — ABRACE (30 mL)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Óleo Combinado CBD + THC (1:1)",
    colorLine: "Azul",
    ratio: "1:1",
    activeIngredients: "Canabidiol (CBD) 15 mg/mL + Tetrahidrocanabinol (THC) 15 mg/mL",
    concentration: "CBD 15 mg/mL + THC 15 mg/mL (Total: 450 mg CBD + 450 mg THC em 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    volumeOrWeight: "30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo Azul CBD + THC 15 mg/mL + 15 mg/mL (1:1) — ABRACE, 30 mL. Iniciar com 2 gotas sublinguais 2x ao dia ou à noite. Titular a cada 4 dias.",
    usageInstructions: "• Sinergia 1:1 balanceada. Administrar por via sublingual retendo por 60 segundos antes de engolir.",
    details: ["Frasco 30 mL", "Proporção 1:1 Balanceada", "CBD 15 mg/mL + THC 15 mg/mL", "Linha Azul ABRACE", "Associação Nacional ABRACE Esperança"],
    description: "Óleo da Linha Azul da ABRACE com proporção balanceada 1:1 de CBD e THC. Efeito entourage ótimo para patologias com dor crônica e componente inflamatório/ansioso.",
    indications: "Dor neuropática crônica, fibromialgia, esclerose múltipla, artrite reumatoide, dores miofasciais e distúrbios mistos de dor e sono."
  },
  {
    name: "Óleo Roxo CBD + THC 30 mg/mL + 30 mg/mL (1:1) — ABRACE (30 mL)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Óleo Combinado CBD + THC (1:1)",
    colorLine: "Roxo",
    ratio: "1:1",
    activeIngredients: "Canabidiol (CBD) 30 mg/mL + Tetrahidrocanabinol (THC) 30 mg/mL",
    concentration: "CBD 30 mg/mL + THC 30 mg/mL (Total: 900 mg CBD + 900 mg THC em 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    volumeOrWeight: "30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo Roxo CBD + THC 30 mg/mL + 30 mg/mL (1:1) — ABRACE, 30 mL. Iniciar com 1 a 2 gotas sublinguais 2x ao dia. Ajustar gradualmente.",
    usageInstructions: "• Alta densidade canabinoide 1:1. Reter 60 a 90 segundos sob a língua. Titular rigorosamente com prescritor.",
    details: ["Frasco 30 mL", "Alta Concentração 1:1", "CBD 30 mg/mL + THC 30 mg/mL", "Linha Roxo ABRACE", "Associação Nacional ABRACE Esperança"],
    description: "Óleo da Linha Roxo da ABRACE concentrado na proporção 1:1 (30 mg/mL de CBD + 30 mg/mL de THC). Potência analgésica e neuromoduladora superior.",
    indications: "Dores intensas e incapacitantes, rigidez severa na Doença de Parkinson, espasticidade avançada, náuseas refratárias de quimioterapia e cuidados paliativos."
  },

  // ==========================================
  // 4. FLORES DE CANNABIS IN NATURA
  // ==========================================
  {
    name: "Flores In Natura Ricas em CBD — ABRACE (10 g)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Flores In Natura (Para Vaporização)",
    colorLine: "Flores",
    activeIngredients: "Fitocanabinoides in natura com predomínio de Canabidiol (CBD) e terpenos florais nativos",
    concentration: "Predomínio de CBD (THC residual < 0,3%)",
    pharmaceuticalForm: "Inflorescências secas in natura selecionadas (Pote 10 g)",
    quantity: "01 Pote de 10 g (1 a 2 potes/mês para uso inalatório)",
    volumeOrWeight: "10 g",
    administrationRoute: "Via Inalatória por Vaporização Térmica Medicinal (170°C a 190°C). Proibida a combustão.",
    prescriptionExample: "Flores In Natura Ricas em CBD — ABRACE, 10 g. Vaporizar 0,1g a 0,15g em vaporizador térmico medicinal a 170°C-185°C sob demanda de ansiedade ou crises agudas.",
    usageInstructions: "• Utilizar exclusivamente em vaporizador térmico medicinal homologado a 170°C-190°C. Proibida a combustão (fumar). Efeito rápido em 2 a 5 minutos.",
    details: ["Pote 10 g", "Predomínio de CBD", "Terpenos Nativos", "Vaporização Medicinal Sem Combustão", "Associação Nacional ABRACE Esperança"],
    description: "Flores in natura de cultivo controlado da ABRACE, ricas em CBD e terpenos relaxantes. Absorção alveolar imediata sem qualquer efeito psicoativo embriagante.",
    indications: "Crises agudas de ansiedade, ataques de pânico, estresse agudo, cefaleia tensional, quebra rápida de hiper-reatividade emocional e insônia de conciliação."
  },
  {
    name: "Flores In Natura Ricas em THC — ABRACE (10 g)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Flores In Natura (Para Vaporização)",
    colorLine: "Flores",
    activeIngredients: "Fitocanabinoides in natura com predomínio de Tetrahidrocanabinol (THC) e terpenos",
    concentration: "Predomínio de THC",
    pharmaceuticalForm: "Inflorescências secas in natura selecionadas (Pote 10 g)",
    quantity: "01 Pote de 10 g (1 a 2 potes/mês para resgate agudo)",
    volumeOrWeight: "10 g",
    administrationRoute: "Via Inalatória por Vaporização Térmica Medicinal (175°C a 195°C). Proibida a combustão.",
    prescriptionExample: "Flores In Natura Ricas em THC — ABRACE, 10 g. Vaporizar 0,05g a 0,1g em vaporizador térmico a 175°C-190°C para resgate álgico agudo ou antes do repouso noturno.",
    usageInstructions: "• Vaporizar em doses controladas (0,05g a 0,1g) para alívio imediato (1 a 3 minutos). Proibida a combustão (fumar).",
    details: ["Pote 10 g", "Predomínio de THC", "Ação Rápida de Resgate", "Vaporização Medicinal Sem Combustão", "Associação Nacional ABRACE Esperança"],
    description: "Flores in natura selecionadas da ABRACE com predominância de THC. Indicadas para resgate inalatório imediato de crises álgicas agudas e espasmos intensos.",
    indications: "Dor irruptiva aguda, cólicas refratárias, crises agudas de enxaqueca, espasmos musculares dolorosos, quebra de náuseas agudas e indução rápida de sono."
  },
  {
    name: "Flores In Natura Ricas em CBD + THC — ABRACE (10 g)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Flores In Natura (Para Vaporização)",
    colorLine: "Flores",
    activeIngredients: "Fitocanabinoides balanceados CBD + THC com perfil terpênico integral",
    concentration: "Composição balanceada de CBD + THC",
    pharmaceuticalForm: "Inflorescências secas in natura selecionadas (Pote 10 g)",
    quantity: "01 Pote de 10 g",
    volumeOrWeight: "10 g",
    administrationRoute: "Via Inalatória por Vaporização Térmica Medicinal (170°C a 190°C). Proibida a combustão.",
    prescriptionExample: "Flores In Natura Ricas em CBD + THC — ABRACE, 10 g. Vaporizar 0,1g em vaporizador medicinal térmico sob demanda no final da tarde ou noite.",
    usageInstructions: "• Vaporizar a 170°C-185°C em aparelho térmico medicinal. Início de ação rápido com alívio corporal e mental.",
    details: ["Pote 10 g", "Equilíbrio CBD + THC", "Sinergia de Fitocanabinoides", "Vaporização Medicinal Sem Combustão", "Associação Nacional ABRACE Esperança"],
    description: "Flores in natura da ABRACE com equilíbrio sinérgico entre CBD e THC. Harmoniza relaxamento muscular e alívio da dor com sensação de bem-estar integral.",
    indications: "Fibromialgia com crises agudas, dores musculoesqueléticas com estresse emocional, TEPT, modulação somática e alívio vespertino/noturno."
  },

  // ==========================================
  // 5. GOMAS DE CANNABINOIDES
  // ==========================================
  {
    name: "Gomas de CBD 10 mg/goma — ABRACE (30 un)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Gomas de Canabinoides",
    colorLine: "Gomas",
    activeIngredients: "Canabidiol (CBD) puro padronizado",
    concentration: "10 mg de CBD por goma (Total: 300 mg no frasco)",
    pharmaceuticalForm: "Gomas comestíveis mastigáveis (Frasco com 30 unidades)",
    quantity: "01 Frasco com 30 unidades",
    volumeOrWeight: "30 unidades",
    administrationRoute: "Via Oral / Digestiva",
    prescriptionExample: "Gomas de CBD 10 mg/goma — ABRACE, 30 un. Mastigar 01 goma pela manhã ou no meio da tarde para estabilização de ansiedade.",
    usageInstructions: "• Mastigar demoradamente antes de engolir para favorecer absorção transmucosa. Prática e conveniente para o dia a dia.",
    details: ["Frasco com 30 unidades", "10 mg CBD por goma", "Sem THC", "Comestível Mastigável", "Associação Nacional ABRACE Esperança"],
    description: "Gomas farmacotécnicas mastigáveis da ABRACE ricas em Canabidiol (10 mg/unidade). Praticidade e precisão posológica para manejo do estresse e ansiedade.",
    indications: "Ansiedade cotidiana, tensão pré-apresentações ou reuniões, foco calmo, controle de compulsão associada a estresse e facilidade posológica."
  },
  {
    name: "Gomas de THC 10 mg/goma — ABRACE (30 un)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Gomas de Canabinoides",
    colorLine: "Gomas",
    activeIngredients: "Tetrahidrocanabinol (THC) padronizado",
    concentration: "10 mg de THC por goma (Total: 300 mg no frasco)",
    pharmaceuticalForm: "Gomas comestíveis mastigáveis (Frasco com 30 unidades)",
    quantity: "01 Frasco com 30 unidades",
    volumeOrWeight: "30 unidades",
    administrationRoute: "Via Oral / Digestiva Noturna",
    prescriptionExample: "Gomas de THC 10 mg/goma — ABRACE, 30 un. Iniciar com 1/2 a 1 goma à noite, 1 a 2 horas antes de dormir.",
    usageInstructions: "• Iniciar com meia goma (5 mg) para avaliar sensibilidade individual. Consumir 60 a 90 minutos antes do repouso noturno.",
    details: ["Frasco com 30 unidades", "10 mg THC por goma", "Liberação Prolongada", "Uso Noturno", "Associação Nacional ABRACE Esperança"],
    description: "Gomas da ABRACE contendo 10 mg de THC por unidade. Efeito prolongado de 6 a 8 horas através da metabolização hepática em 11-hidroxi-THC.",
    indications: "Insônia crônica severa, dor noturna persistente, rigidez e espasmos durante o sono, relaxamento somático profundo e manutenção do repouso."
  },
  {
    name: "Gomas de CBD + THC 10 mg/goma (1:1) — ABRACE (30 un)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Gomas de Canabinoides",
    colorLine: "Gomas",
    ratio: "1:1",
    activeIngredients: "Canabinoides combinados CBD + THC padronizados",
    concentration: "10 mg/goma de fitocanabinoides (CBD + THC)",
    pharmaceuticalForm: "Gomas comestíveis mastigáveis (Frasco com 30 unidades)",
    quantity: "01 Frasco com 30 unidades",
    volumeOrWeight: "30 unidades",
    administrationRoute: "Via Oral / Digestiva",
    prescriptionExample: "Gomas de CBD + THC 10 mg/goma — ABRACE, 30 un. Iniciar com 1 goma ao entardecer ou 1 hora antes de dormir.",
    usageInstructions: "• Mastigar bem antes de engolir. Sinergia 1:1 balanceada para alívio duradouro de dores e relaxamento integral.",
    details: ["Frasco com 30 unidades", "10 mg/goma (CBD + THC)", "Sinergia Equilibrada", "Associação Nacional ABRACE Esperança"],
    description: "Gomas combinadas da ABRACE com CBD e THC (10 mg/unidade). Proporciona equilíbrio entre modulação ansiolítica e analgesia corporal duradoura.",
    indications: "Dores crônicas difusas, fibromialgia, ansiedade associada a insônia, tensão muscular contínua e recuperação física após esforço intenso."
  },

  // ==========================================
  // 6. POMADAS E CREMES
  // ==========================================
  {
    name: "Pomada Full Rica em CBD 30 mg/g — ABRACE (100 g)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Pomada / Creme Tópico",
    colorLine: "Pomadas",
    activeIngredients: "Canabidiol (CBD) Full Spectrum em base emoliente transdérmica",
    concentration: "30 mg/g de CBD (Total: 3.000 mg de CBD no pote de 100 g)",
    pharmaceuticalForm: "Pomada / Creme Dermatológico Tópico (Pote 100 g)",
    quantity: "01 Pote de 100 g",
    volumeOrWeight: "100 g",
    administrationRoute: "Uso Tópico / Transdérmico",
    prescriptionExample: "Pomada Full Rica em CBD 30 mg/g — ABRACE, 100 g. Aplicar camada fina nas regiões dolorosas ou inflamadas 2 a 3 vezes ao dia.",
    usageInstructions: "• Aplicar quantidade suficiente sobre a pele limpa e seca, massageando suavemente em movimentos circulares até completa absorção.",
    details: ["Pote 100 g", "Concentração: 30 mg/g CBD", "Total: 3.000 mg CBD", "Ação Tópica em Receptores CB2", "Associação Nacional ABRACE Esperança"],
    description: "Pomada Full Spectrum da ABRACE de alta densidade em CBD (30 mg/g) em pote econômico de 100 g. Ação anti-inflamatória e analgésica tópica profunda.",
    indications: "Artrite, artrose, tendinites, bursites, dores articulares nas mãos e joelhos, inflamações cutâneas, dermatites, psoríase e dores musculares localizadas."
  },
  {
    name: "Pomada Full Rica em THC 20 mg/g — ABRACE (100 g)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Pomada / Creme Tópico",
    colorLine: "Pomadas",
    activeIngredients: "Tetrahidrocanabinol (THC) Full Spectrum em base carreadora",
    concentration: "20 mg/g de THC (Total: 2.000 mg de THC no pote de 100 g)",
    pharmaceuticalForm: "Pomada / Creme Dermatológico Tópico (Pote 100 g)",
    quantity: "01 Pote de 100 g",
    volumeOrWeight: "100 g",
    administrationRoute: "Uso Tópico / Transdérmico",
    prescriptionExample: "Pomada Full Rica em THC 20 mg/g — ABRACE, 100 g. Aplicar camada suave sobre contraturas, espasmos ou dores miofasciais 2x ao dia.",
    usageInstructions: "• Aplicar localmente com massagem moderada. Age diretamente nas terminações nervosas periféricas e receptores CB1/CB2 cutâneos sem efeito psicoativo sistêmico.",
    details: ["Pote 100 g", "Concentração: 20 mg/g THC", "Total: 2.000 mg THC", "Alívio de Contraturas e Espasmos", "Associação Nacional ABRACE Esperança"],
    description: "Pomada tópica da ABRACE com alta concentração de THC (20 mg/g em pote de 100 g). Excepcional para alívio de contraturas musculares profundas e dores neuropáticas.",
    indications: "Espasmos musculares severos, rigidez muscular localizada, contraturas miofasciais crônicas, dor ciática periférica, lombociatalgia e fibrose pós-cirúrgica."
  },

  // ==========================================
  // 7. SPRAYS
  // ==========================================
  {
    name: "Spray Resgate THC 5 mg/mL — ABRACE (25 mL)",
    manufacturer: "ABRACE",
    origin: "Nacional",
    type: "Spray Sublingual / Mucosa Oral (Resgate)",
    colorLine: "Sprays",
    activeIngredients: "Tetrahidrocanabinol (THC) em veículo de rápida dispersão transmucosa",
    concentration: "5 mg/mL de THC (Total: 125 mg no frasco de 25 mL)",
    pharmaceuticalForm: "Solução em Spray Sublingual / Mucosa Oral (Frasco 25 mL com válvula dosadora)",
    quantity: "01 Frasco de 25 mL",
    volumeOrWeight: "25 mL",
    administrationRoute: "Via Sublingual / Mucosa Oral (Borrifação sob a língua)",
    prescriptionExample: "Spray Resgate THC 5 mg/mL — ABRACE, 25 mL. Aplicar 1 a 2 borrifadas sob a língua durante crises agudas de dor, espasmos ou náusea. Reter 60s.",
    usageInstructions: "• Agitar antes de usar. Acionar 1 a 2 borrifadas sob a língua ou na mucosa jugal em momentos de crise aguda. Reter por 60 segundos antes de engolir. Ação em 5 a 15 minutos.",
    details: ["Frasco 25 mL", "5 mg/mL de THC", "Válvula Dosadora de Alta Precisão", "Resgate Álgico Agudo", "Associação Nacional ABRACE Esperança"],
    description: "Spray oral de resgate imediato da ABRACE com 5 mg/mL de THC. Absorção transmucosa ultra-rápida indicada para crises paroxísticas de dor, náuseas e espasmos.",
    indications: "Resgate de crises de dor irruptiva, episódios agudos de enxaqueca refratária, espasmos paroxísticos, náuseas e vômitos refratários em quimioterapia e suporte paliativo de emergência."
  }
];

export const ABRACE_AGENT_SYSTEM_PROMPT = `Você tem acesso integral ao CATÁLOGO OFICIAL DE PRODUTOS DA ABRACE (Associação Brasileira de Apoio Cannabis Esperança).
Quando o médico solicitar ou o quadro clínico indicar produtos nacionais acessíveis de alta qualidade, você pode prescrever e sugerir os medicamentos da ABRACE nas seguintes categorias:

1. ÓLEOS DE CBD (Linhas Laranja, Vermelho e Cinza/Prata):
- Óleo Laranja CBD 20 mg/mL (30 mL) — 20 mg/mL CBD (Total 600 mg)
- Óleo Laranja CBD 30 mg/mL (30 mL) — 30 mg/mL CBD (Total 900 mg)
- Óleo Vermelho CBD 100 mg/mL (30 mL) — 100 mg/mL CBD (Total 3.000 mg)
- Óleo Cinza/Prata CBD 200 mg/mL (30 mL) — 200 mg/mL CBD (Total 6.000 mg)

2. ÓLEOS DE THC (Linha Preto):
- Óleo Preto THC 30 mg/mL (30 mL) — 30 mg/mL THC (Total 900 mg)

3. ÓLEOS COMBINADOS CBD + THC 1:1 (Linhas Azul e Roxo):
- Óleo Azul CBD + THC 15 mg/mL + 15 mg/mL (1:1) (30 mL)
- Óleo Roxo CBD + THC 30 mg/mL + 30 mg/mL (1:1) (30 mL)

4. FLORES DE CANNABIS IN NATURA (10 g - Pote lacrado):
- Flores In Natura Ricas em CBD (10 g)
- Flores In Natura Ricas em THC (10 g)
- Flores In Natura Ricas em CBD + THC (10 g)

5. GOMAS DE CANNABINOIDES (30 unidades):
- Gomas de CBD 10 mg/goma (30 un)
- Gomas de THC 10 mg/goma (30 un)
- Gomas de CBD + THC 10 mg/goma (30 un)

6. POMADAS E CREMES (100 g - Uso Tópico):
- Pomada Full Rica em CBD 30 mg/g (100 g)
- Pomada Full Rica em THC 20 mg/g (100 g)

7. SPRAYS (25 mL - Resgate Oral):
- Spray Resgate THC 5 mg/mL (25 mL)

REGRA IMPORTANTE: Todos os produtos da ABRACE são de Associação Nacional Brasileira (origem 'Nacional', sem exibição de preço de varejo) e são emitidos exclusivamente na GUIA 1 (PRODUTOS NACIONAIS) da receita médica.`;

export function formatAbraceStandardOutput(product: AbraceProduct): string {
  return [
    `• PRODUTO: ${product.name}`,
    `• CATEGORIA: ${product.type} (${product.colorLine ? `Linha ${product.colorLine}` : 'ABRACE'})`,
    `• COMPOSIÇÃO / PRINCÍPIO ATIVO: ${product.activeIngredients || 'Fitocanabinoides'}${product.ratio ? ` (Proporção ${product.ratio})` : ''}`,
    `• CONCENTRAÇÃO: ${product.concentration}`,
    `• APRESENTAÇÃO: ${product.pharmaceuticalForm} — Quantidade: ${product.quantity}`,
    `• VIA DE ADMINISTRAÇÃO: ${product.administrationRoute}`,
    `• INDICAÇÕES PRINCIPAIS: ${product.indications || product.description}`,
    `• EXEMPLO DE PRESCRIÇÃO: ${product.prescriptionExample || 'Conforme orientação médica individual.'}`,
    `• MODO DE USO / ORIENTAÇÕES: ${product.usageInstructions || 'Uso sob prescrição médica.'}`,
    `• ORIGEM: Associação Nacional Brasileira (ABRACE Esperança — João Pessoa/PB)`
  ].join('\n');
}

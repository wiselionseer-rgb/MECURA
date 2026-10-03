import { CBDProduct } from './cbdGuide';

export interface AbecmedProduct extends CBDProduct {
  colorLine?: 'Laranja' | 'Azul' | 'Verde' | 'Vermelho' | 'Limão' | 'Lilás' | 'Flores' | 'Extrações';
  extractionMethod?: string;
  vehicle?: string;
  cultivationType?: 'Indoor' | 'Outdoor' | 'Estufa' | 'Misto';
  prescriptionExample?: string;
}

export const ABECMED_COMPANY_INFO = {
  name: "ABECMED",
  fullName: "ABECMED — Associação Brasileira de Cannabis Medicinal",
  origin: "Nacional (Brasil)",
  nature: "Associação de Pacientes e Cultivo Terapêutico Nacional Autorizado",
  validityMonths: 6,
  description: "Associação brasileira voltada ao acolhimento de pacientes, fornecimento de óleos Full Spectrum RSO diluídos em MCT, inflorescências in natura e extrações sem solventes.",
  orderFormat: "NOME DO PRODUTO → COMPOSIÇÃO → CONCENTRAÇÃO → APRESENTAÇÃO → MÉTODO DE EXTRAÇÃO → MODO DE USO INFORMADO → COMO PODE SER DESCRITO NA PRESCRIÇÃO → VALOR → OBSERVAÇÕES"
};

export const ABECMED_PRODUCTS: AbecmedProduct[] = [
  // ==========================================
  // 1. ÓLEOS FULL SPECTRUM (30 mL • RSO • MCT)
  // ==========================================
  // 🟠 ÓLEO RICO EM CBD — LARANJA
  {
    name: "Óleo ABEC CBD Full Spectrum 2% (20 mg/mL — 600 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Rico em CBD)",
    colorLine: "Laranja",
    extractionMethod: "RSO (Rick Simpson Oil sem solvente residual)",
    vehicle: "MCT (Triglicerídeos de Cadeia Média)",
    activeIngredients: "Fitocanabinoides Full Spectrum com predomínio de Canabidiol (CBD)",
    concentration: "20 mg/mL de CBD (Total: 600 mg no frasco)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL (2 frascos/mês se uso contínuo)",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC CBD Full Spectrum 2% (20 mg/mL — 600 mg), 30 mL. Uso contínuo. 2 frascos/mês.",
    usageInstructions: "• Posologia a ser definida individualmente pelo médico assistente. Administrar por via sublingual/oral conforme determinação da receita.",
    details: ["Frasco 30 mL", "Concentração 2% (20 mg/mL)", "Total 600 mg CBD", "Extração RSO em MCT", "Linha Laranja ABECMED", "Associação Nacional"],
    description: "Óleo Full Spectrum nacional da ABECMED rico em Canabidiol (CBD). Extração RSO veiculada em óleo MCT puro de alta absorção. Preserva fitocanabinoides, flavonoides e terpenos vegetais.",
    indications: "Ansiedade leve a moderada, estresse cotidiano, suporte inicial de titulação pediátrica ou geriátrica, modulação leve do humor."
  },
  {
    name: "Óleo ABEC CBD Full Spectrum 5% (50 mg/mL — 1.500 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Rico em CBD)",
    colorLine: "Laranja",
    extractionMethod: "RSO (Rick Simpson Oil)",
    vehicle: "MCT (Triglicerídeos de Cadeia Média)",
    activeIngredients: "Fitocanabinoides Full Spectrum com predomínio de Canabidiol (CBD)",
    concentration: "50 mg/mL de CBD (Total: 1.500 mg no frasco)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL (2 frascos/mês se uso contínuo)",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC CBD Full Spectrum 5% (50 mg/mL — 1.500 mg), 30 mL. Uso contínuo. 2 frascos/mês.",
    usageInstructions: "• Posologia individualizada conforme receita médica. Administrar por via sublingual, retendo sob a língua por 60 segundos antes de engolir.",
    details: ["Frasco 30 mL", "Concentração 5% (50 mg/mL)", "Total 1.500 mg CBD", "Extração RSO em MCT", "Linha Laranja ABECMED", "Associação Nacional"],
    description: "Óleo Full Spectrum intermediário da ABECMED rico em CBD (50 mg/mL). Formulação balanceada em MCT com terpenos naturais sinérgicos.",
    indications: "Ansiedade, estresse crônico, insônia, dores inflamatórias, TEA, TDAH e modulação neuroimune."
  },
  {
    name: "Óleo ABEC CBD Full Spectrum 10% (100 mg/mL — 3.000 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Rico em CBD)",
    colorLine: "Laranja",
    extractionMethod: "RSO (Rick Simpson Oil)",
    vehicle: "MCT (Triglicerídeos de Cadeia Média)",
    activeIngredients: "Fitocanabinoides Full Spectrum concentrados (CBD predominante)",
    concentration: "100 mg/mL de CBD (Total: 3.000 mg no frasco)",
    pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL (2 frascos/mês se uso contínuo)",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC CBD Full Spectrum 10% (100 mg/mL — 3.000 mg), 30 mL. Uso contínuo. 2 frascos/mês.",
    usageInstructions: "• Alta concentração (100 mg/mL). Seguir rigorosamente a posologia e titulação prescrita pelo profissional de saúde.",
    details: ["Frasco 30 mL", "Alta Concentração 10% (100 mg/mL)", "Total 3.000 mg CBD", "Extração RSO em MCT", "Linha Laranja ABECMED", "Associação Nacional"],
    description: "Formulação de alta densidade canabinoide (100 mg/mL) da ABECMED. Alto rendimento terapêutico em frasco de 30 mL.",
    indications: "Quadros refratários, epilepsia, neuroinflamação crônica, Parkinson, dores intensas e patologias crônicas."
  },

  // 🔵 ÓLEO RICO EM CBD + THC — AZUL
  {
    name: "Óleo ABEC CBD + THC Full Spectrum 2% (20 mg/mL — 600 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (CBD + THC)",
    colorLine: "Azul",
    extractionMethod: "RSO (Rick Simpson Oil)",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais: Canabidiol (CBD) + Tetrahidrocanabinol (THC)",
    concentration: "20 mg/mL combinados de CBD + THC (Total: 600 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Extrato de cannabis CBD:THC Azul 2%, 20 mg/mL, 30 mL, uso contínuo, 2 frascos/mês.",
    usageInstructions: "• Administrar sob a língua conforme prescrição médica individual.",
    details: ["Frasco 30 mL", "2% (20 mg/mL)", "Total 600 mg CBD+THC", "Linha Azul ABECMED", "Associação Nacional"],
    description: "Sinergia de CBD + THC em extração RSO veiculada em MCT. Potencializa o efeito comitiva para analgesia e relaxamento com baixíssima dosagem por gota.",
    indications: "Dores leves a moderadas, rigidez matinal, estresse somatizado e regulação fisiológica."
  },
  {
    name: "Óleo ABEC CBD + THC Full Spectrum 5% (50 mg/mL — 1.500 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (CBD + THC)",
    colorLine: "Azul",
    extractionMethod: "RSO (Rick Simpson Oil)",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais: Canabidiol (CBD) + Tetrahidrocanabinol (THC)",
    concentration: "50 mg/mL combinados de CBD + THC (Total: 1.500 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC CBD:THC Full Spectrum 5% (50 mg/mL — 1.500 mg), 30 mL. Uso contínuo. 2 frascos/mês.",
    usageInstructions: "• Administrar conforme posologia da receita médica. Iniciar com doses basais e titular gradualmente.",
    details: ["Frasco 30 mL", "5% (50 mg/mL)", "Total 1.500 mg CBD+THC", "Linha Azul ABECMED", "Associação Nacional"],
    description: "Formulação balanceada de CBD + THC da Linha Azul da ABECMED. Indicada para patologias que demandam sinergia de canabinoides para controle da dor e melhora global.",
    indications: "Dor crônica, fibromialgia, espasticidade muscular, distúrbios de sono associados a desconforto físico."
  },
  {
    name: "Óleo ABEC CBD + THC Full Spectrum 10% (100 mg/mL — 3.000 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (CBD + THC)",
    colorLine: "Azul",
    extractionMethod: "RSO (Rick Simpson Oil)",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais Concentrados: CBD + THC",
    concentration: "100 mg/mL combinados de CBD + THC (Total: 3.000 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Extrato de cannabis CBD:THC, 100 mg/mL, 30 mL, uso contínuo, 2 frascos/mês.",
    usageInstructions: "• Posologia estrita conforme receita médica. Alta concentração por mL.",
    details: ["Frasco 30 mL", "10% (100 mg/mL)", "Total 3.000 mg CBD+THC", "Linha Azul ABECMED", "Associação Nacional"],
    description: "Alta potência da Linha Azul ABECMED (100 mg/mL) combinando CBD e THC em extrato RSO de espectro total.",
    indications: "Dores crônicas neuropáticas severas, cuidados paliativos, espasmos graves e quadros de difícil controle."
  },

  // 🟢 ÓLEO RICO EM THC — VERDE
  {
    name: "Óleo ABEC Rico em THC Verde 2% (20 mg/mL — 600 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Predominante em THC)",
    colorLine: "Verde",
    extractionMethod: "RSO",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais com predomínio de Tetrahidrocanabinol (THC)",
    concentration: "20 mg/mL de THC (Total: 600 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo de cannabis Full Spectrum rico em THC Verde 2%, 600 mg, 30 mL, 2 frascos/mês.",
    usageInstructions: "• Administrar preferencialmente no período noturno ou conforme estipulado pelo médico prescritor.",
    details: ["Frasco 30 mL", "2% (20 mg/mL)", "Total 600 mg THC", "Linha Verde ABECMED", "Associação Nacional"],
    description: "Linha Verde ABECMED com predominância de THC em concentração suave (20 mg/mL) para indução do sono e analgesia noturna.",
    indications: "Insônia inicial, dores noturnas, estimulação do apetite, desaceleração mental ao deitar."
  },
  {
    name: "Óleo ABEC Rico em THC Verde 5% (50 mg/mL — 1.500 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Predominante em THC)",
    colorLine: "Verde",
    extractionMethod: "RSO",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais com predomínio de Tetrahidrocanabinol (THC)",
    concentration: "50 mg/mL de THC (Total: 1.500 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC Rico em THC Full Spectrum 5% (50 mg/mL — 1.500 mg), 30 mL. Uso noturno.",
    usageInstructions: "• Uso noturno preferencial. Administrar sob a língua conforme orientação médica.",
    details: ["Frasco 30 mL", "5% (50 mg/mL)", "Total 1.500 mg THC", "Linha Verde ABECMED", "Associação Nacional"],
    description: "Concentração intermediária da Linha Verde ABECMED. Excelente resposta terapêutica para dores crônicas refratárias e distúrbios severos do sono.",
    indications: "Insônia crônica, dores oncológicas, náuseas, espasticidade moderada a severa."
  },
  {
    name: "Óleo ABEC Rico em THC Verde 10% (100 mg/mL — 3.000 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Predominante em THC)",
    colorLine: "Verde",
    extractionMethod: "RSO",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais Concentrados com alto teor de THC",
    concentration: "100 mg/mL de THC (Total: 3.000 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC Rico em THC Full Spectrum 10% (100 mg/mL — 3.000 mg), 30 mL. Uso estrito conforme prescrição.",
    usageInstructions: "• Alta potência de THC. Titular com cautela sob estrita orientação médica.",
    details: ["Frasco 30 mL", "10% (100 mg/mL)", "Total 3.000 mg THC", "Linha Verde ABECMED", "Associação Nacional"],
    description: "Formulação concentrada de THC (100 mg/mL) da ABECMED para quadros clínicos de alta exigência analgésica.",
    indications: "Dores intratáveis, cuidados paliativos oncológicos, caquexia e espasmos refratários."
  },

  // 🔴 ÓLEO RICO EM CBG — VERMELHO
  {
    name: "Óleo ABEC Rico em CBG Vermelho 5% (50 mg/mL — 1.500 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Predominante em CBG)",
    colorLine: "Vermelho",
    extractionMethod: "RSO",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais com predomínio de Canabigerol (CBG)",
    concentration: "50 mg/mL de CBG (Total: 1.500 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC Rico em CBG Vermelho 5% (50 mg/mL — 1.500 mg), 30 mL. Uso diurno.",
    usageInstructions: "• Administrar via sublingual conforme prescrição médica individual.",
    details: ["Frasco 30 mL", "5% (50 mg/mL)", "Total 1.500 mg CBG", "Linha Vermelha ABECMED", "Associação Nacional"],
    description: "Linha Vermelha ABECMED focada em Canabigerol (CBG). O CBG atua como a 'célula-tronco' dos canabinoides, com forte ação gastrointestinal e neuroprotetora.",
    indications: "Doença inflamatória intestinal (Crohn e Retocolite), foco mental, fadiga crônica, glaucoma e suporte osteomuscular."
  },
  {
    name: "Óleo ABEC Rico em CBG Vermelho 10% (100 mg/mL — 3.000 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Predominante em CBG)",
    colorLine: "Vermelho",
    extractionMethod: "RSO",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais Concentrados com alto teor de Canabigerol (CBG)",
    concentration: "100 mg/mL de CBG (Total: 3.000 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC Rico em CBG Vermelho 10% (100 mg/mL — 3.000 mg), 30 mL. Uso contínuo.",
    usageInstructions: "• Administrar conforme posologia estabelecida pelo prescritor habilitado.",
    details: ["Frasco 30 mL", "10% (100 mg/mL)", "Total 3.000 mg CBG", "Linha Vermelha ABECMED", "Associação Nacional"],
    description: "Alta concentração de CBG (100 mg/mL) em óleo MCT. Excelente potência anti-inflamatória sistêmica sem sedação motora.",
    indications: "Inflamação intestinal severa, doenças autoimunes, recuperação neuromuscular e clareza cognitiva."
  },

  // 🟡 ÓLEO CBD + CBN — LIMÃO
  {
    name: "Óleo ABEC CBD + CBN Limão 5% (50 mg/mL — 1.500 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (CBD + CBN)",
    colorLine: "Limão",
    extractionMethod: "RSO",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais: Canabidiol (CBD) + Canabinol (CBN)",
    concentration: "50 mg/mL combinados de CBD + CBN (Total: 1.500 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC CBD + CBN Limão 5% (50 mg/mL — 1.500 mg), 30 mL. Uso noturno, 30-45 minutos antes de deitar.",
    usageInstructions: "• Tomar por via sublingual antes de dormir conforme prescrição médica. Reter por 60 segundos.",
    details: ["Frasco 30 mL", "5% (50 mg/mL)", "Total 1.500 mg CBD+CBN", "Linha Limão ABECMED", "Uso Noturno", "Associação Nacional"],
    description: "Linha Limão ABECMED formulada especificamente para arquitetura do sono. Combina a regulação ansiolítica do CBD com as propriedades sedativas e relaxantes do Canabinol (CBN).",
    indications: "Insônia inicial e de manutenção, microdespertares noturnos, agitação do sono e ansiedade ao deitar."
  },

  // 🟣 ÓLEO CBD + CBG — LILÁS
  {
    name: "Óleo ABEC CBD + CBG Lilás 5% (50 mg/mL — 1.500 mg)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Óleo Full Spectrum (CBD + CBG)",
    colorLine: "Lilás",
    extractionMethod: "RSO",
    vehicle: "MCT",
    activeIngredients: "Fitocanabinoides Integrais: Canabidiol (CBD) + Canabigerol (CBG)",
    concentration: "50 mg/mL combinados de CBD + CBG (Total: 1.500 mg / 30 mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    prescriptionExample: "Óleo ABEC CBD + CBG Lilás 5% (50 mg/mL — 1.500 mg), 30 mL. Uso diurno conforme prescrição médica.",
    usageInstructions: "• Administrar por via sublingual conforme receita médica.",
    details: ["Frasco 30 mL", "5% (50 mg/mL)", "Total 1.500 mg CBD+CBG", "Linha Lilás ABECMED", "Associação Nacional"],
    description: "Linha Lilás ABECMED combinando CBD e CBG. Sinergia excelente para estabilização de humor, energia limpa sem taquicardia e alívio de desconfortos somáticos crônicos.",
    indications: "Fadiga, Burnout, TDAH, dores neuropáticas diurnas, inflamações gastrointestinais e estresse."
  },

  // ==========================================
  // 2. INFLORESCÊNCIAS IN NATURA ABECMED
  // ==========================================
  // 🌿 RICAS EM THC
  {
    name: "Inflorescências ABEC ricas em THC (15% a 30% THC)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Inflorescências In Natura (Rica em THC)",
    colorLine: "Flores",
    cultivationType: "Indoor",
    activeIngredients: "Flores Secas Padronizadas de Cannabis ricas em Tetrahidrocanabinol (THC) — 15% a 30%",
    concentration: "~15% a 30% de THC (Variável conforme genética, espécie e cultivo)",
    pharmaceuticalForm: "Flores Secas In Natura Padronizadas",
    quantity: "Embalagem de 10 g (Disponível em 5 g, 10 g, 15 g e 25 g)",
    administrationRoute: "Via Inalatória (Vaporização Medicinal)",
    priceBRL: 70, // faixa de R$ 35 a R$ 120/g (média cadastrada como referência)
    prescriptionExample: "Inflorescências ABEC ricas em THC — 10 g/mês — uso contínuo (ou embalagem de 10 g — 3 embalagens/mês).",
    usageInstructions: "• Utilizar sob demanda via vaporizador térmico medicinal conforme posologia do prescritor. Cultivo disponível: Indoor, Outdoor e Estufa.",
    details: ["Embalagens de 5g, 10g, 15g e 25g", "THC 15% a 30%", "Índica / Sativa / Híbrida", "Cultivo Indoor, Outdoor ou Estufa", "Faixa R$ 35 a R$ 120/g", "ABECMED Nacional"],
    description: "Inflorescências in natura cultivadas pela ABECMED com alto teor de THC (15% a 30%). Cultivo sob normas controladas (Indoor, Estufa ou Outdoor). Indicado para resgate analgésico e alívio agudo.",
    indications: "Resgate agudo de crises de dor intensa, enxaqueca severa, náuseas refratárias, descompressão mental aguda e espasticidade."
  },
  // 🌿 RICAS EM CBD
  {
    name: "Inflorescências ABEC ricas em CBD (8% a 18% CBD)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Inflorescências In Natura (Rica em CBD)",
    colorLine: "Flores",
    cultivationType: "Indoor",
    activeIngredients: "Flores Secas Padronizadas de Cannabis ricas em Canabidiol (CBD) — 8% a 18%",
    concentration: "~8% a 18% de CBD (THC < 0,3% ou perfis equilibrados)",
    pharmaceuticalForm: "Flores Secas In Natura Padronizadas",
    quantity: "Embalagem de 10 g (Disponível em 5 g, 10 g, 15 g e 25 g)",
    administrationRoute: "Via Inalatória (Vaporização Medicinal)",
    priceBRL: 55, // faixa de R$ 35 a R$ 85/g
    prescriptionExample: "Inflorescências ricas em CBD — 20 g/mês — uso contínuo (ou embalagens de 5 g ou 10 g — 6 embalagens/mês).",
    usageInstructions: "• Utilizar sob demanda em vaporizador térmico medicinal em temperatura de 170°C a 195°C conforme determinação médica.",
    details: ["Embalagens de 5g, 10g, 15g e 25g", "CBD 8% a 18% (THC < 0,3%)", "Cultivo Indoor, Outdoor ou Estufa", "Faixa R$ 35 a R$ 85/g", "ABECMED Nacional"],
    description: "Flores ricas em CBD com baixíssimo teor de THC (< 0,3%), cultivadas pela ABECMED. Biodisponibilidade imediata sem efeitos psicoativos embriagantes.",
    indications: "Crises de pânico, ansiedade aguda, estresse somatizado, relaxamento muscular rápido e desmame de tabagismo/ansiolíticos."
  },

  // ==========================================
  // 3. EXTRAÇÕES SEM SOLVENTE ABECMED
  // ==========================================
  {
    name: "Extração Sem Solvente ABEC rica em THC (30% a 50% THC)",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Extração Concentrada Sem Solvente",
    colorLine: "Extrações",
    extractionMethod: "Prensagem em temperatura controlada (Rosin) / Extração com gelo",
    activeIngredients: "Fitocanabinoides Concentrados com 30% a 50% de THC",
    concentration: "30% a 50% de THC (Sem solventes residuais)",
    pharmaceuticalForm: "Extrato Concentrado Sólido/Pastoso",
    quantity: "Embalagem de 2 g (Disponível em 2 g e 5 g)",
    administrationRoute: "Via Inalatória (Vaporização) ou Sublingual",
    priceBRL: 180, // faixa de R$ 70 a R$ 380/g
    prescriptionExample: "Extração sem solvente rica em THC 30% ou 50%, embalagem de 2 g — 10 unidades/mês (ou Extrato concentrado Full Spectrum, sem solvente, 2 g ou 5 g — 15 embalagens/mês).",
    usageInstructions: "• Microdosagem conforme prescrição individual. Administrar via vaporizador de concentrados ou conforme orientação médica.",
    details: ["Embalagens de 2g e 5g", "30% a 50% THC", "Técnicas Ice / Rosin sem solvente", "Faixa R$ 70 a R$ 380/g", "ABECMED Nacional"],
    description: "Extração purificada de altíssima potência canabinoide produzida a partir das flores da ABECMED. Processo limpo sem uso de solventes químicos (água, gelo e prensa térmica).",
    indications: "Crises álgicas agudas intratáveis, picos de dor neuropática refratária e suporte paliativo de alta intensidade."
  },
  {
    name: "Extrato Peneirado Full Spectrum ABEC",
    manufacturer: "ABECMED",
    origin: "Nacional",
    type: "Extrato Peneirado (Dry Sift)",
    colorLine: "Extrações",
    extractionMethod: "Extração peneirada mecânica a seco (Dry Sift)",
    activeIngredients: "Tricomas glandulares concentrados com fitocanabinoides e terpenos integrais",
    concentration: "Fitocanabinoides Totais Concentrados",
    pharmaceuticalForm: "Extrato Peneirado Concentrado",
    quantity: "Embalagem de 2 g (Disponível em 2 g e 5 g)",
    administrationRoute: "Via Inalatória (Vaporização)",
    priceBRL: 120, // faixa de R$ 70 a R$ 380/g
    prescriptionExample: "Extrato peneirado ABEC — 20 g/mês — uso contínuo conforme determinação médica.",
    usageInstructions: "• Microdosagem inalatória via vaporizador medicinal conforme prescrição médica.",
    details: ["Embalagens de 2g e 5g", "Técnica mecânica peneirada sem solvente", "Alta concentração de tricomas e terpenos", "ABECMED Nacional"],
    description: "Extrato obtido por separação mecânica dos tricomas glandulares ricos em canabinoides e terpenos aromáticos das flores da ABECMED.",
    indications: "Resgate rápido, relaxamento neuromuscular e controle agudo de picos sintomáticos."
  }
];

export const ABECMED_CULTIVATION_TYPES = [
  {
    type: "Indoor",
    description: "Ambiente controlado quanto a temperatura, luz e umidade. Flores descritas como mais densas e com maior concentração de tricomas, terpenos e canabinoides."
  },
  {
    type: "Outdoor",
    description: "Cultivo ao ar livre com luz natural e variações climáticas. Geralmente mais acessível."
  },
  {
    type: "Estufa",
    description: "Controle parcial de clima e iluminação. O catálogo descreve boa densidade, buds maiores e equilíbrio entre qualidade e custo."
  }
];

export const ABECMED_PRICING_TABLE = [
  { category: "Óleos Full Spectrum", value: "Não informado no catálogo oficial" },
  { category: "Flores ricas em THC", value: "R$ 35,00 a R$ 120,00 por grama" },
  { category: "Flores ricas em CBD", value: "R$ 35,00 a R$ 85,00 por grama" },
  { category: "Extrações sem solvente", value: "R$ 70,00 a R$ 380,00 por grama" }
];

export const ABECMED_PRESCRIPTION_RULES = {
  validity: "Receitas consideradas válidas por até 6 meses internamente.",
  requiredFields: [
    { field: "Nome do paciente", required: true },
    { field: "CPF", required: true },
    { field: "Data da receita", required: true },
    { field: "Produto", required: true },
    { field: "Concentração", required: "Recomendado especificar" },
    { field: "Apresentação/volume", required: "Recomendado" },
    { field: "Posologia", required: true },
    { field: "Quantidade mensal", required: true },
    { field: "Uso contínuo, quando aplicável", required: true },
    { field: "Assinatura do prescritor", required: true },
    { field: "Registro no conselho (CRM, CRO, etc.)", required: true }
  ],
  standardModelExample: `Óleo ABEC CBD Full Spectrum 5%
50 mg/mL — 1.500 mg
Frasco de 30 mL
Posologia: conforme determinação do prescritor
Uso contínuo
Quantidade: 2 frascos/mês.`
};

export const ABECMED_USAGE_GUIDELINES = {
  oils: "O catálogo da ABECMED informa concentração, composição e exemplos de prescrição, mas não especifica quantidade universal de gotas ou tomadas por dia. Quando o paciente perguntar 'quantas gotas devo tomar?', nunca criar uma dose; solicitar a posologia prescrita ou orientar confirmação com o profissional responsável. Se o paciente tiver receita, explicar a conta matemática (ex: 50 mg/mL = 50 mg de canabinoide a cada 1 mL), ressaltando que a conversão em gotas depende da calibração do conta-gotas específico do frasco.",
  flowers: "O material não descreve via ou método de administração de forma universal (recomenda-se vaporização medicinal sem combustão sob orientação médica). Nunca inventar dose universal.",
  extractions: "Produzidas a partir de flores cultivadas pela ABECMED por técnicas sem solventes (prensagem em temperatura controlada, extração com gelo, extração mecânica peneirada). Microdosagem conforme prescrição individual."
};

/**
 * COMANDO PRINCIPAL PARA O AGENTE ABECMED (Item 11 da especificação oficial)
 */
export const ABECMED_AGENT_SYSTEM_PROMPT = `Você é um assistente de atendimento especializado no catálogo ABECMED. Para cada produto, informe sempre nesta ordem: NOME DO PRODUTO → COMPOSIÇÃO → CONCENTRAÇÃO → APRESENTAÇÃO → MÉTODO DE EXTRAÇÃO, QUANDO DISPONÍVEL → MODO DE USO INFORMADO → COMO PODE SER DESCRITO NA PRESCRIÇÃO → VALOR → OBSERVAÇÕES.
Nunca invente preço, estoque, concentração, composição, posologia ou quantidade de gotas.
Os exemplos de prescrição existentes na base servem somente para demonstrar a forma de escrever a receita e não representam recomendação de dose.
Quando perguntarem sobre quantidade de gotas, dose ou alteração do tratamento, utilize apenas a posologia já determinada pelo prescritor.
Se a informação não estiver cadastrada, responda claramente que ela precisa ser confirmada com a ABECMED ou com o profissional responsável.
Nunca prometa cura ou resultado terapêutico.
Sempre diferencie informação do catálogo de orientação médica individual.`;

/**
 * Helper para formatar a resposta técnica de um produto no padrão obrigatório da ABECMED
 */
export function formatAbecmedStandardOutput(product: AbecmedProduct): string {
  const parts = [
    `• NOME DO PRODUTO: ${product.name}`,
    `• COMPOSIÇÃO: ${product.activeIngredients || 'Fitocanabinoides Integrais Full Spectrum'}`,
    `• CONCENTRAÇÃO: ${product.concentration}`,
    `• APRESENTAÇÃO: ${product.pharmaceuticalForm || 'Frasco 30 mL'} (${product.quantity || '01 Frasco de 30 mL'})`,
    `• MÉTODO DE EXTRAÇÃO: ${product.extractionMethod || 'RSO (Rick Simpson Oil) sem solvente em veículo MCT'}`,
    `• MODO DE USO INFORMADO: Conforme posologia definida individualmente pelo prescritor habilitado. (Não há dosagem universal no catálogo; nunca inventar quantidade de gotas).`,
    `• COMO PODE SER DESCRITO NA PRESCRIÇÃO: "${product.prescriptionExample || product.name + ', 30 mL. Uso contínuo. 2 frascos/mês.'}"`,
    `• VALOR: ${product.priceBRL ? `R$ ${product.priceBRL.toFixed(2)}` : (product.details?.find(d => d.includes('R$')) || 'Não informado no catálogo oficial da associação')}`,
    `• OBSERVAÇÕES: Receitas têm validade de até 6 meses internamente na ABECMED. Necessário cadastro associativo e prescrição por profissional habilitado em seu respectivo conselho.`
  ];
  return parts.join('\n');
}

import { FLOWERMED_PRODUCTS, FLOWERMED_COMPANY_INFO, FlowermedProduct } from './flowermedCatalog';
import { FLOWER_EXTRACTIONS_PRODUCTS, FLOWER_EXTRACTIONS_INFO, FlowerExtractionProduct } from './flowerExtractionsCatalog';
import { 
  ABECMED_PRODUCTS, 
  ABECMED_COMPANY_INFO, 
  ABECMED_AGENT_SYSTEM_PROMPT, 
  ABECMED_CULTIVATION_TYPES, 
  ABECMED_PRICING_TABLE, 
  ABECMED_PRESCRIPTION_RULES, 
  ABECMED_USAGE_GUIDELINES, 
  formatAbecmedStandardOutput, 
  AbecmedProduct 
} from './abecmedCatalog';

export { 
  FLOWERMED_PRODUCTS, 
  FLOWERMED_COMPANY_INFO, 
  FLOWER_EXTRACTIONS_PRODUCTS, 
  FLOWER_EXTRACTIONS_INFO,
  ABECMED_PRODUCTS,
  ABECMED_COMPANY_INFO,
  ABECMED_AGENT_SYSTEM_PROMPT,
  ABECMED_CULTIVATION_TYPES,
  ABECMED_PRICING_TABLE,
  ABECMED_PRESCRIPTION_RULES,
  ABECMED_USAGE_GUIDELINES,
  formatAbecmedStandardOutput
};
export type { FlowermedProduct, FlowerExtractionProduct, AbecmedProduct };

export interface CBDProduct {
  name: string;
  manufacturer: string;
  origin: string;
  type: string;
  activeIngredients?: string;
  concentration?: string;
  pharmaceuticalForm?: string;
  quantity?: string;
  administrationRoute?: string;
  image?: string;
  details?: string[];
  italicText?: string;
  description?: string;
  usageInstructions?: string;
  priceUSD?: number;
  priceBRL?: number;
  indications?: string;
}

export interface CBDCategory {
  id: string;
  title: string;
  description: string;
  indicationsList?: string[];
  usageInstructions?: string;
  dosageGuidance: string;
  products: CBDProduct[];
}

export const NATIONAL_FULL_SPECTRUM_PRODUCTS: CBDProduct[] = [
  // ==============================================================
  // LINHA ALTO CBD FULL SPECTRUM (CBD 5:1, 10:1, 20:1 THC - 30 mL)
  // ==============================================================
  {
    name: "ALTO CBD Full SPECTRUM CBD 5:1 THC - 30ml (30 mg/mL — 900mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Alto CBD 5:1)",
    activeIngredients: "25 mg de CBD e 5 mg de THC por mL",
    concentration: "30 mg/mL (900mg) — 25 mg CBD e 5 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 220,
    details: ["Frasco 30 mL", "Apresentação 30 mg/mL (900mg)", "25 mg CBD e 5 mg THC por mL", "Full Spectrum Nacional", "Uso Oral / Sublingual"],
    description: "ALTO CBD Full SPECTRUM CBD 5:1 THC - 30 ml. Apresentação de 30 mg/mL (900mg) contendo 25 mg de CBD e 5 mg de THC por mL. Formulação nacional padronizada para modulação do sistema endocanabinoide.",
    usageInstructions: "• Iniciar com 03 a 04 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir. Titular 01 gota a cada 4 a 5 dias.",
    indications: "Ansiedade, Estresse Crônico, Dores Inflamatórias, Modulação do Humor, TDAH, Suporte Neuroprotetor"
  },
  {
    name: "ALTO CBD Full SPECTRUM CBD 5:1 THC - 30ml (60 mg/mL — 1800mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Alto CBD 5:1)",
    activeIngredients: "50 mg de CBD e 10 mg de THC por mL",
    concentration: "60 mg/mL (1800mg) — 50 mg CBD e 10 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 290,
    details: ["Frasco 30 mL", "Apresentação 60 mg/mL (1800mg)", "50 mg CBD e 10 mg THC por mL", "Full Spectrum Nacional", "Uso Oral / Sublingual"],
    description: "ALTO CBD Full SPECTRUM CBD 5:1 THC - 30 ml. Apresentação de 60 mg/mL (1800mg) contendo 50 mg de CBD e 10 mg de THC por mL. Concentração intermediária com excelente rendimento.",
    usageInstructions: "• Tomar 02 a 04 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir. Titular conforme orientação médica.",
    indications: "Dores Crônicas, Fibromialgia, Ansiedade Severa, TEA, Espasticidade Leve, Doenças Autoimunes"
  },
  {
    name: "ALTO CBD Full SPECTRUM CBD 10:1 THC - 30ml (30 mg/mL — 900mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Alto CBD 10:1)",
    activeIngredients: "Aproximadamente 27,3 mg de CBD e 2,7 mg de THC por mL",
    concentration: "30 mg/mL (900mg) — ~27,3 mg CBD e 2,7 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 220,
    details: ["Frasco 30 mL", "Apresentação 30 mg/mL (900mg)", "Aprox. 27,3 mg CBD e 2,7 mg THC por mL", "Full Spectrum Nacional", "Uso Oral / Sublingual"],
    description: "ALTO CBD Full SPECTRUM CBD 10:1 THC - 30 ml. Apresentação de 30 mg/mL (900mg) contendo aproximadamente 27,3 mg de CBD e 2,7 mg de THC por mL. Alta tolerabilidade e microdosagem de THC.",
    usageInstructions: "• Tomar 03 a 05 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Ansiedade, Estresse, Início de Terapia Canabinoide, Pacientes Idosos, Burnout"
  },
  {
    name: "ALTO CBD Full SPECTRUM CBD 10:1 THC - 30ml (60 mg/mL — 1800mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Alto CBD 10:1)",
    activeIngredients: "Aproximadamente 54,5 mg de CBD e 5,5 mg de THC por mL",
    concentration: "60 mg/mL (1800mg) — ~54,5 mg CBD e 5,5 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 290,
    details: ["Frasco 30 mL", "Apresentação 60 mg/mL (1800mg)", "Aprox. 54,5 mg CBD e 5,5 mg THC por mL", "Full Spectrum Nacional", "Uso Oral / Sublingual"],
    description: "ALTO CBD Full SPECTRUM CBD 10:1 THC - 30 ml. Apresentação de 60 mg/mL (1800mg) contendo aproximadamente 54,5 mg de CBD e 5,5 mg de THC por mL. Rendimento terapêutico balanceado.",
    usageInstructions: "• Tomar 02 a 04 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Ansiedade Crônica, Insônia Moderada, Dores Articulares, Modulação Imunológica, TDAH"
  },
  {
    name: "ALTO CBD Full SPECTRUM CBD 10:1 THC - 30ml (100 mg/mL — 3000mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum Alta Concentração (10:1)",
    activeIngredients: "Aproximadamente 90,9 mg de CBD e 9,1 mg de THC por mL",
    concentration: "100 mg/mL (3000mg) — ~90,9 mg CBD e 9,1 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 360,
    details: ["Frasco 30 mL", "Apresentação 100 mg/mL (3000mg)", "Aprox. 90,9 mg CBD e 9,1 mg THC por mL", "Full Spectrum Nacional", "Uso Oral / Sublingual"],
    description: "ALTO CBD Full SPECTRUM CBD 10:1 THC - 30 ml. Apresentação de 100 mg/mL (3000mg) contendo aproximadamente 90,9 mg de CBD e 9,1 mg de THC por mL. Alta potência canabinoide nacional.",
    usageInstructions: "• Tomar 01 a 03 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos. Titulação sob orientação médica.",
    indications: "Epilepsia Refratária, TEA (Autismo), Doenças Neurodegenerativas (Parkinson, Alzheimer), Dores Severas"
  },
  {
    name: "ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml (30 mg/mL — 900mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Alto CBD 20:1)",
    activeIngredients: "28,6 mg de CBD e 1,4 mg de THC por mL",
    concentration: "30 mg/mL (900mg) — 28,6 mg CBD e 1,4 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 220,
    details: ["Frasco 30 mL", "Apresentação 30 mg/mL (900mg)", "28,6 mg CBD e 1,4 mg THC por mL", "Full Spectrum Nacional", "Uso Oral / Sublingual"],
    description: "ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml. Apresentação de 30 mg/mL (900mg) contendo 28,6 mg de CBD e 1,4 mg de THC por mL. Ideal para pacientes com alta sensibilidade ao THC.",
    usageInstructions: "• Tomar 03 a 05 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Ansiedade, Síndrome do Pânico, Pacientes Idosos, Sensibilidade ao THC, Desmame de Ansiolíticos"
  },
  {
    name: "ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml (60 mg/mL — 1800mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum (Alto CBD 20:1)",
    activeIngredients: "57,1 mg de CBD e 2,9 mg de THC por mL",
    concentration: "60 mg/mL (1800mg) — 57,1 mg CBD e 2,9 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 290,
    details: ["Frasco 30 mL", "Apresentação 60 mg/mL (1800mg)", "57,1 mg CBD e 2,9 mg THC por mL", "Full Spectrum Nacional", "Uso Oral / Sublingual"],
    description: "ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml. Apresentação de 60 mg/mL (1800mg) contendo 57,1 mg de CBD e 2,9 mg de THC por mL. Formulação estável para tratamentos contínuos.",
    usageInstructions: "• Tomar 02 a 04 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "TEA, TDAH, Ansiedade Crônica Generalizada, Transtornos do Humor, Dores Inflamatórias"
  },
  {
    name: "ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml (100 mg/mL — 3000mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum Alta Concentração (20:1)",
    activeIngredients: "95,2 mg de CBD e 4,8 mg de THC por mL",
    concentration: "100 mg/mL (3000mg) — 95,2 mg CBD e 4,8 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 360,
    details: ["Frasco 30 mL", "Apresentação 100 mg/mL (3000mg)", "95,2 mg CBD e 4,8 mg THC por mL", "Full Spectrum Nacional", "Uso Oral / Sublingual"],
    description: "ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml. Apresentação de 100 mg/mL (3000mg) contendo 95,2 mg de CBD e 4,8 mg de THC por mL. Alta densidade para máxima eficiência posológica.",
    usageInstructions: "• Tomar 01 a 03 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Epilepsias Graves, TEA Severo, Transtornos Neurológicos, Altas Dosagens Diárias de CBD"
  },

  // ==============================================================
  // LINHA CBD + CBN FULL SPECTRUM (CBD 2:1 CBN - 30 mL)
  // ==============================================================
  {
    name: "CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml (30 mg/mL — 900mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum CBD + CBN (Indução do Sono)",
    activeIngredients: "20 mg de CBD e 10 mg de CBN por mL",
    concentration: "30 mg/mL (900mg) — 20 mg CBD e 10 mg CBN por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 230,
    details: ["Frasco 30 mL", "Apresentação 30 mg/mL (900mg)", "20 mg CBD e 10 mg CBN por mL", "Full Spectrum Nacional", "Foco em Sono Reparador"],
    description: "CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml. Apresentação 30 mg/mL contendo 20 mg de CBD e 10 mg de CBN por mL. Sinergia voltada à arquitetura e indução do sono reparador.",
    usageInstructions: "• Tomar 04 a 06 gotas por via sublingual 30 a 60 minutos antes de deitar. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Insônia Inicial e Intermediária, Despertares Noturnos, Agitação Noturna, Bruxismo, Qualidade do Sono"
  },
  {
    name: "CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml (60 mg/mL — 1800mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum CBD + CBN Alta Potência",
    activeIngredients: "40 mg de CBD e 20 mg de CBN por mL",
    concentration: "60 mg/mL (1800mg) — 40 mg CBD e 20 mg CBN por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 310,
    details: ["Frasco 30 mL", "Apresentação 60 mg/mL (1800mg)", "40 mg CBD e 20 mg CBN por mL", "Full Spectrum Nacional", "Insônia Crônica Refratária"],
    description: "CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml. Apresentação 60 mg/mL contendo 40 mg de CBD e 20 mg de CBN por mL. Indicado para insônia severa e relaxamento profundo.",
    usageInstructions: "• Tomar 03 a 05 gotas por via sublingual 45 minutos antes de dormir. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Insônia Crônica Refratária, Síndrome das Pernas Inquietas, Dores Noturnas, Arquitetura do Sono Profundo"
  },

  // ==============================================================
  // LINHA CBD + CBG FULL SPECTRUM (CBD 2:1 CBG - 30 mL)
  // ==============================================================
  {
    name: "CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml (30 mg/mL — 900mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum CBD + CBG (Foco & Digestivo)",
    activeIngredients: "20 mg de CBD e 10 mg de CBG por mL",
    concentration: "30 mg/mL (900mg) — 20 mg CBD e 10 mg CBG por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 230,
    details: ["Frasco 30 mL", "Apresentação 30 mg/mL (900mg)", "20 mg CBD e 10 mg CBG por mL", "Full Spectrum Nacional", "Foco & Saúde Digestiva"],
    description: "CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml. Apresentação 30 mg/mL contendo 20 mg de CBD e 10 mg de CBG por mL. Associação com Canabigerol para clareza mental e saúde gastrointestinal.",
    usageInstructions: "• Tomar 03 a 05 gotas por via sublingual pela manhã e no início da tarde. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Foco e Concentração, TDAH, Fadiga Mental, Doenças Inflamatórias Intestinais (Crohn, SII), Neuroproteção"
  },
  {
    name: "CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml (60 mg/mL — 1800mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum CBD + CBG Alta Concentração",
    activeIngredients: "40 mg de CBD e 20 mg de CBG por mL",
    concentration: "60 mg/mL (1800mg) — 40 mg CBD e 20 mg CBG por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 310,
    details: ["Frasco 30 mL", "Apresentação 60 mg/mL (1800mg)", "40 mg CBD e 20 mg CBG por mL", "Full Spectrum Nacional", "Ação Anti-inflamatória & Cognitiva"],
    description: "CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml. Apresentação 60 mg/mL contendo 40 mg de CBD e 20 mg de CBG por mL. Alta potência de CBG para inflamações crônicas e fadiga.",
    usageInstructions: "• Tomar 02 a 04 gotas por via sublingual 2 vezes ao dia (manhã e almoço). Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Síndrome do Intestino Irritável, Doença de Crohn, Fadiga Crônica, Burnout, TDAH, Dores Articulares"
  },

  // ==============================================================
  // LINHA TRIPLA CBD + CBG + CBN FULL SPECTRUM (4:1:1 - 30 mL)
  // ==============================================================
  {
    name: "CBD + CBG + CBN Full Spectrum (4 CBD : 1 CBG : 1 CBN) - 30ml (30 mg/mL — 900mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum Triplo Canabinoide (4:1:1)",
    activeIngredients: "20 mg de CBD, 5 mg de CBG e 5 mg de CBN por mL",
    concentration: "30 mg/mL (900mg) — 20 mg CBD, 5 mg CBG e 5 mg CBN por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 240,
    details: ["Frasco 30 mL", "Apresentação 30 mg/mL (900mg)", "20 mg CBD, 5 mg CBG e 5 mg CBN por mL", "Full Spectrum Triplo Canabinoide", "Proporção 4:1:1"],
    description: "CBD + CBG + CBN Full Spectrum (4 CBD : 1 CBG : 1 CBN) - 30 ml. Apresentação 30 mg/mL contendo 20 mg de CBD, 5 mg de CBG e 5 mg de CBN por mL. Sinergia completa multi-alvo.",
    usageInstructions: "• Tomar 03 a 05 gotas por via sublingual de 12/12 horas ou à noite. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Equilíbrio Neurovegetativo Geral, Estresse com Insônia Mista, Tensão Miofascial, Recuperação Sistêmica"
  },
  {
    name: "CBD + CBG + CBN Full Spectrum (4 CBD : 1 CBG : 1 CBN) - 30ml (60 mg/mL — 1800mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum Triplo Canabinoide Alta Potência",
    activeIngredients: "40 mg de CBD, 10 mg de CBG e 10 mg de CBN por mL",
    concentration: "60 mg/mL (1800mg) — 40 mg CBD, 10 mg CBG e 10 mg CBN por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 320,
    details: ["Frasco 30 mL", "Apresentação 60 mg/mL (1800mg)", "40 mg CBD, 10 mg CBG e 10 mg CBN por mL", "Full Spectrum Triplo Canabinoide", "Proporção 4:1:1"],
    description: "CBD + CBG + CBN Full Spectrum (4 CBD : 1 CBG : 1 CBN) - 30ml. Apresentação 60 mg/mL contendo 40 mg de CBD, 10 mg de CBG e 10 mg de CBN por mL. Alta potência combinada.",
    usageInstructions: "• Tomar 02 a 04 gotas por via sublingual 2 vezes ao dia. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Dores Crônicas Difusas, Fibromialgia com Distúrbio do Sono, Burnout Complexo, Neuroinflamação"
  },

  // ==============================================================
  // LINHA EQUILIBRADO FULL SPECTRUM (CBD 1:1 THC - 30 mL)
  // ==============================================================
  {
    name: "EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (30 mg/mL — 900mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Balanceado 1:1 (CBD:THC)",
    activeIngredients: "15 mg de CBD e 15 mg de THC por mL",
    concentration: "30 mg/mL (900mg) — 15 mg CBD e 15 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 230,
    details: ["Frasco 30 mL", "Apresentação 30 mg/mL (900mg)", "15 mg CBD e 15 mg THC por mL", "Full Spectrum Equilibrado 1:1", "Analgesia & Relaxamento"],
    description: "EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml. Apresentação 30mg/ml contendo 15 mg de CBD e 15 mg de THC por mL. Proporção áurea de alívio da dor com atenuação mútua de efeitos colaterais.",
    usageInstructions: "• Iniciar com 02 a 03 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir. Titulação gradual a cada 4 a 5 dias.",
    indications: "Dor Crônica Moderada a Severa, Fibromialgia, Espasticidade, Esclerose Múltipla, Artrite, Cuidados Paliativos"
  },
  {
    name: "EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (60 mg/mL — 1800mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Balanceado 1:1 Alta Concentração",
    activeIngredients: "30 mg de CBD e 30 mg de THC por mL",
    concentration: "60 mg/mL (1800mg) — 30 mg CBD e 30 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 310,
    details: ["Frasco 30 mL", "Apresentação 60 mg/mL (1800mg)", "30 mg CBD e 30 mg THC por mL", "Full Spectrum Equilibrado 1:1", "Alta Eficácia Analgésica"],
    description: "EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml. Apresentação 60 mg/mL contendo 30 mg de CBD e 30 mg de THC por mL. Concentração intermediária para controle álgico robusto.",
    usageInstructions: "• Tomar 02 a 03 gotas por via sublingual de 12/12 horas ou antes de dormir. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Dor Neuropática Severa, Espasmos Agudos, Rigidez Motora, Parkinson, Artrite Reumatóide, Suporte Oncológico"
  },
  {
    name: "EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (100 mg/mL — 3000mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Balanceado 1:1 Máxima Potência",
    activeIngredients: "50 mg de CBD e 50 mg de THC por mL",
    concentration: "100 mg/mL (3000mg) — 50 mg CBD e 50 mg THC por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 380,
    details: ["Frasco 30 mL", "Apresentação 100 mg/mL (3000mg)", "50 mg CBD e 50 mg THC por mL", "Full Spectrum Equilibrado 1:1", "Máxima Potência Terapêutica"],
    description: "EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml. Apresentação 100 mg/mL contendo 50 mg de CBD e 50 mg de THC por mL. Máxima concentração para dor intensa e espasticidade refratária.",
    usageInstructions: "• Iniciar com 01 a 02 gotas por via sublingual sob estrita orientação médica. Reter por 60 segundos antes de engolir. Titulação cuidadosa a cada 5 a 7 dias.",
    indications: "Dor Refratária Intensa, Cuidados Paliativos Avançados, Espasticidade Severa, Caquexia, Neuropatias Graves"
  },

  // ==============================================================
  // LINHA ALTO THC FULL SPECTRUM (THC 10:1 CBD - 30 mL)
  // ==============================================================
  {
    name: "ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (30 mg/mL — 900mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum Predominante em THC (10:1)",
    activeIngredients: "27,3 mg de THC e 2,7 mg de CBD por mL",
    concentration: "30 mg/mL (900mg) — 27,3 mg THC e 2,7 mg CBD por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 230,
    details: ["Frasco 30 mL", "Apresentação 30 mg/mL (900mg)", "27,3 mg THC e 2,7 mg CBD por mL", "Full Spectrum Alto THC", "Uso Noturno Preferencial"],
    description: "ALTO THC Full Spectrum (THC 10:1 CBD) - 30 ml. Apresentação 30 mg/mL contendo 27,3 mg de THC e 2,7 mg de CBD por mL. Predomínio de THC para insônia severa e relaxamento profundo.",
    usageInstructions: "• Iniciar com 01 a 02 gotas por via sublingual à noite, 1 hora antes de dormir. Reter por 60 segundos antes de engolir. Titulação lenta.",
    indications: "Insônia Grave Refratária, Dores Noturnas Intensas, Estímulo de Apetite (Caquexia), Náuseas e Vômitos, Relaxamento Muscular"
  },
  {
    name: "ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (60 mg/mL — 1800mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum Predominante em THC (10:1) Concentrado",
    activeIngredients: "54,5 mg de THC e 5,5 mg de CBD por mL",
    concentration: "60 mg/mL (1800mg) — 54,5 mg THC e 5,5 mg CBD por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 310,
    details: ["Frasco 30 mL", "Apresentação 60 mg/mL (1800mg)", "54,5 mg THC e 5,5 mg CBD por mL", "Full Spectrum Alto THC", "Ação Central & Miorrelaxante"],
    description: "ALTO THC Full Spectrum (THC 10:1 CBD) - 30 ml. Apresentação 60 mg/mL contendo 54,5 mg de THC e 5,5 mg de CBD por mL. Concentração intermediária para analgesia central potente.",
    usageInstructions: "• Administrar 01 a 03 gotas por via sublingual à noite antes de deitar sob estrita orientação médica. Reter por 60 segundos antes de engolir.",
    indications: "Dor Neuropática Noturna, Espasmos Severos, Insônia Crônica Aguda, Enxaqueca Refratária, Suporte Oncológico"
  },
  {
    name: "ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (100 mg/mL — 3000mg)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum Predominante em THC (10:1) Alta Potência",
    activeIngredients: "90,9 mg de THC e 9,1 mg de CBD por mL",
    concentration: "100 mg/mL (3000mg) — 90,9 mg THC e 9,1 mg CBD por mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Frasco 30 mL)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 380,
    details: ["Frasco 30 mL", "Apresentação 100 mg/mL (3000mg)", "90,9 mg THC e 9,1 mg CBD por mL", "Full Spectrum Alto THC", "Máxima Potência Analgésica"],
    description: "ALTO THC Full Spectrum (THC 10:1 CBD) - 30 ml. Apresentação 100 mg/mL contendo 90,9 mg de THC e 9,1 mg de CBD por mL. Máxima concentração para dor oncológica e cuidados paliativos.",
    usageInstructions: "• Uso estritamente individualizado. Iniciar com 01 gota à noite sob monitoramento do prescritor. Reter sob a língua por 60 segundos antes de engolir.",
    indications: "Dor Oncológica Severa, Cuidados Paliativos, Espasticidade Severa Refratária, Dor Neuropática Extrema, Insônia Grave"
  }
];

export const NATIONAL_ASSOCIATION_PRODUCTS: CBDProduct[] = [
  ...NATIONAL_FULL_SPECTRUM_PRODUCTS,
  {
    name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
    manufacturer: "Associação Brasileira",
    origin: "Nacional",
    type: "Óleo Broad Spectrum",
    activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
    concentration: "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%",
    pharmaceuticalForm: "Solução Oleosa Sublingual",
    quantity: "01 (um) frasco de 30 mL",
    administrationRoute: "Sublingual / Oral",
    priceBRL: 230,
    details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
    description: `Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 100 mg/mL (10%).\nComposição: CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.`,
    usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Aproximadamente 25 gotas por mL):\n• Dias 1 a 5: Administrar 0,1 mL (2 a 3 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (5 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (7 a 8 gotas) a cada 12 horas. (Total: 30 mg/dose)`,
    indications: "TDAH, Burnout, Foco e Concentração, Obesidade e Controle Metabólico, Diabetes e Resistência Insulínica, Melhora no Esporte, Fadiga Crônica, Parkinson, Alzheimer, Demência, Tremores e Rigidez Muscular, Qualidade de vida na Terceira Idade, Epilepsia Refratária, Crises Convulsivas, Síndrome de Dravet, Síndrome de Lennox-Gastaut, Redução de Vícios, Controle de Fissuras (Craving), Desmame de Benzodiazepínicos e Opioides, Estabilização Emocional"
  },
  {
    name: "Broad SPECTRUM CBD, CBN 1065mg —————- 15ml",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Broad Spectrum CBD + CBN (0% THC)",
    activeIngredients: "Canabidiol (CBD) Broad Spectrum + Canabinol (CBN) - Total 1065mg",
    concentration: "CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 15 mL",
    administrationRoute: "Via Sublingual / Oral",
    priceBRL: 210,
    details: ["Frasco 15mL", "CBD + CBN 1065mg", "Broad Spectrum (0% THC)", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
    description: "Extrato Broad Spectrum combinando Canabidiol (CBD) e Canabinol (CBN) totalizando 1065mg em frasco de 15ml, com zero THC (0,0%). O Canabinol (CBN) atua sinergicamente com o CBD na indução do sono, relaxamento profundo e desaceleração mental sem efeitos psicoativos.",
    usageInstructions: "Pingar 2 gotas pela manhã e 4 a noite.\n- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.\n- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima.",
    indications: "Insônia, Distúrbios do Sono, Ansiedade, Estresse Crônico, Agitação Noturna, Síndrome das Pernas Inquietas"
  },
  {
    name: "Óleo Rico em CBD ISOLADO 100mg/ml - Associação Nacional",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo CBD Isolado (0% THC)",
    activeIngredients: "Canabidiol (CBD) Isolado Puro (>99.8% de pureza)",
    concentration: "CBD 100 mg/mL (0,0% THC) • Total 3.000 mg de CBD",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    details: ["Frasco 30mL", "CBD 100mg/ml (10%)", "0,0% THC Garantido", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
    description: "Óleo com Canabidiol isolado de alta pureza, totalmente livre de THC (0,0%). Indicado para pacientes com alta sensibilidade a canabinoides, crianças, profissionais submetidos a testes toxicológicos (antidoping/concursos), autismo (TEA), ansiedade e controle de crises convulsivas sem efeitos psicoativos.",
    usageInstructions: "• Tomar 03 a 05 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir. Titular 01 gota a cada 05 dias conforme orientação médica.",
    indications: "Ansiedade, Estresse Crônico, TEA (Autismo), Epilepsia, Pacientes sensíveis ao THC"
  },
  {
    name: "Óleo Rico em CBD ISOLADO 200mg/ml - Associação Nacional",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo CBD Isolado Alta Potência (0% THC)",
    activeIngredients: "Canabidiol (CBD) Isolado Puro (>99.8% de pureza) - Alta Concentração",
    concentration: "CBD 200 mg/mL (0,0% THC) • Total 6.000 mg de CBD",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    details: ["Frasco 30mL", "CBD 200mg/ml (20%)", "0,0% THC Garantido", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
    description: "Formulação concentrada de Canabidiol isolado de alta potência (200mg/ml), com zero THC (0,0%). Otimizado para redução do volume ingerido por tomada em tratamentos de alta dosagem, neuropatias e síndromes convulsivas graves.",
    usageInstructions: "• Tomar 02 a 04 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de deglutir. Aumentar 01 gota por tomada a cada 05 dias sob acompanhamento médico.",
    indications: "Epilepsia Refratária, Síndromes Raras (Dravet/Lennox-Gastaut), Doenças Neurodegenerativas, Altas Dosagens"
  },
  {
    name: "Óleo Balanceado CBD/THC 1:1 (CBD 25mg/ml + THC 25mg/ml)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Balanceado 1:1",
    activeIngredients: "Extrato Integral Equilibrado de Cannabis Sativa (CBD + Delta-9-THC)",
    concentration: "CBD 25 mg/mL + THC 25 mg/mL (Proporção 1:1 | Total 50 mg/mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    details: ["Frasco 30mL", "CBD 25mg/ml + THC 25mg/ml (1:1)", "Canabinoides Totais: 50mg/ml", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
    description: "Proporção áurea 1:1 que potencializa o efeito entourage sinérgico entre CBD e THC. Excelente para analgesia moderada a severa, fibromialgia, espasticidade em esclerose múltipla, artrite reumatóide e controle de dor crônica com efeito protetor e ansiolítico do CBD.",
    usageInstructions: "• Iniciar com 02 a 03 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir. Titular 01 gota a cada 04 a 05 dias até controle homeostático.",
    indications: "Dor Crônica Neuropática, Fibromialgia, Espasticidade (Esclerose Múltipla), Artrite Reumatóide, Cuidados Paliativos"
  },
  {
    name: "Óleo Balanceado CBD/THC 2:1 (CBD 50mg/ml + THC 25mg/ml)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Balanceado 2:1",
    activeIngredients: "Extrato Padronizado de Cannabis Sativa (CBD + Delta-9-THC)",
    concentration: "CBD 50 mg/mL + THC 25 mg/mL (Proporção 2:1 | Total 75 mg/mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    details: ["Frasco 30mL", "CBD 50mg/ml + THC 25mg/ml (2:1)", "Canabinoides Totais: 75mg/ml", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
    description: "Fórmula balanceada 2:1 com predomínio modulador de CBD e presença terapêutica efetiva de THC. Proporciona controle álgico e anti-inflamatório com reduzida incidência de sonolência diurna ou alterações psicoativas.",
    usageInstructions: "• Iniciar com 03 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir. Aumentar 01 gota por tomada a cada 05 dias.",
    indications: "Dor Inflamatória, Distúrbios do Sono com Dor Concomitante, Ansiedade Somatizada, Rigidez Articular, Endometriose"
  },
  {
    name: "Óleo Balanceado CBD/THC 3:1 (CBD 30mg/ml + THC 10mg/ml)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Balanceado 3:1",
    activeIngredients: "Extrato Padronizado de Cannabis Sativa (CBD + Delta-9-THC)",
    concentration: "CBD 30 mg/mL + THC 10 mg/mL (Proporção 3:1 | Total 40 mg/mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    details: ["Frasco 30mL", "CBD 30mg/ml + THC 10mg/ml (3:1)", "Canabinoides Totais: 40mg/ml", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
    description: "Formulação suave 3:1 especialmente indicada para idosos, sensíveis a opioides ou pacientes em primeiro contato com THC medicinal. Excelente margem terapêutica para analgesia leve a moderada e ansiedade somatizada com tolerabilidade máxima.",
    usageInstructions: "• Tomar 03 gotas sublinguais pela manhã e 03 gotas à noite. Reter sob a língua por 60 segundos. Titular 01 gota a cada 05 dias conforme resposta clínica.",
    indications: "Idosos, Pacientes Sensíveis a Fármacos, Início de Terapia com THC, Dores Leves a Moderadas, Tensão Muscular"
  },
  {
    name: "Óleo Balanceado CBD/THC 5:1 (CBD 50mg/ml + THC 10mg/ml)",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Balanceado 5:1",
    activeIngredients: "Extrato Padronizado de Cannabis Sativa (CBD + Delta-9-THC)",
    concentration: "CBD 50 mg/mL + THC 10 mg/mL (Proporção 5:1 | Total 60 mg/mL)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    details: ["Frasco 30mL", "CBD 50mg/ml + THC 10mg/ml (5:1)", "Canabinoides Totais: 60mg/ml", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
    description: "Formulação com predomínio de Canabidiol e microdose sinérgica de THC na proporção 5:1. Otimiza a homeostase do sistema endocanabinoide, atuando em ansiedade crônica, estresse, dores inflamatórias e distúrbios cognitivos sem provocar letargia diurna.",
    usageInstructions: "• Tomar 03 a 04 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir. Titular 01 gota a cada 05 dias sob supervisão médica.",
    indications: "Ansiedade Severa, TAG, Estresse Crônico, TDAH, Autismo (TEA), Dores Neuropáticas com Base Inflamatória"
  },
  {
    name: "Óleo Integral THC/CBD 100mg/ml - Associação Nacional",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum",
    activeIngredients: "Extrato Integral de Cannabis Sativa (Full Spectrum)",
    concentration: "Canabinoides Totais 100 mg/mL (CBD + THC balanceado)",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    details: ["Frasco 30ml", "100mg/ml de Canabinoides Totais", "Relação THC/CBD balanceada", "Produto Nacional"],
    description: "Óleo integral balanceado de Associação Brasileira com proporção 1:1. Indicado para dores crônicas, fibromialgia, espasticidade e rigidez.",
    usageInstructions: "• Iniciar com 03 gotas de 12/12 horas sublingual. Aumentar 1 gota a cada 04 dias conforme intensidade dos sintomas.",
    indications: "Dor Crônica, Rigidez, Fibromialgia, Espasmos"
  },
  {
    name: "Óleo Integral PREDOMINANTE THC 100mg/ml - Associação Nacional",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Óleo Full Spectrum THC",
    activeIngredients: "Extrato Integral Predominante em Delta-9-THC",
    concentration: "THC 100 mg/mL • Frasco 30 mL",
    pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
    quantity: "01 Frasco de 30 mL",
    administrationRoute: "Via Sublingual / Oral",
    details: ["Frasco 30ml", "100mg/ml THC", "Uso Noturno", "Associação Nacional"],
    description: "Extrato integral predominante em THC para insônia severa, relaxamento profundo e dores noturnas agudas.",
    usageInstructions: "• Tomar 04 a 06 gotas sublinguais 1 hora antes de deitar. Uso noturno preferencial.",
    indications: "Insônia Grave, Dores Noturnas, Desaceleração Mental"
  },
  {
    name: "Pomada Canábica Terapêutica 500mg (50g) - Associação Nacional",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Pomada Tópica",
    activeIngredients: "Fitocanabinoides Integrais (CBD/THC) com Óleos Essenciais",
    concentration: "500 mg Canabinoides / 50g",
    pharmaceuticalForm: "Pomada Tópica",
    quantity: "01 Pote de 50g",
    administrationRoute: "Via Tópica (Uso Externo)",
    details: ["Pote 50g", "500mg Canabinoides", "Uso tópico local", "Associação Nacional"],
    description: "Uso tópico para alívio localizado de dores musculares, articulares, artrite, tendinite e lesões desportivas.",
    usageInstructions: "• Aplicar quantidade suficiente na região afetada 2 a 3 vezes ao dia, massageando até completa absorção.",
    indications: "Dores Musculares, Artrite, Tendinite, Inflamação Localizada"
  },
  {
    name: "Flor in natura PREDOMINANTE THC (Para Vaporização) 15g - Associação Nacional",
    manufacturer: "Associação Nacional",
    origin: "Nacional",
    type: "Flor in natura (Inalação/Vaporização)",
    activeIngredients: "Flores Secas Padronizadas de Cannabis sp. ricas em THC",
    concentration: "~18% a 22% THC (Lote sob Demanda)",
    pharmaceuticalForm: "Flores Secas Inteiras (15g)",
    quantity: "01 Embalagem Selada de 15g",
    administrationRoute: "Via Inalatória (Vaporização)",
    details: ["Embalagem 15g", "Rica em THC", "Uso inalatório em crises álgicas", "Associação Nacional"],
    description: "Flores in natura secas para resgate inalatório rápido via vaporizador medicinal térmico sem combustão. Indicado para quebra de crises álgicas intensas e espasmos agudos.",
    usageInstructions: "• Vaporizar 0,1g a 0,15g em vaporizador térmico medicinal a 175°C-185°C. Proibida a combustão.",
    indications: "Crises Álgicas Agudas, Enxaqueca Severa, Espasmos Agudos"
  }
];

export const cbdGuideData: CBDCategory[] = [
  {
    id: "associacoes_nacionais",
    title: "ASSOCIAÇÃO NACIONAL (MEDICAMENTOS BRASILEIROS AUTORIZADOS)",
    description: "Medicamentos nacionais de Associações Brasileiras autorizadas. Formulações padronizadas de alta qualidade com rendimento prolongado (~60 dias), excelente custo-benefício e entrega direta em todo o território nacional.",
    indicationsList: [
      "Dor Crônica & Fibromialgia",
      "Ansiedade, Estresse & Pânico",
      "Insônia & Distúrbios do Sono",
      "Epilepsia & Convulsões",
      "Autismo (TEA) & TDAH",
      "Doenças Neurodegenerativas (Parkinson e Alzheimer)",
      "Espasticidade & Esclerose Múltipla",
      "Inflamação Crônica & Artrite",
      "Cuidados Paliativos"
    ],
    dosageGuidance: "Uso sublingual. Reter por 60 segundos sob a língua antes de engolir. Titulação gradual 'start low, go slow' a cada 4 a 5 dias.",
    products: NATIONAL_ASSOCIATION_PRODUCTS
  },
  {
    id: "abecmed_oficial",
    title: "ABECMED — BASE OFICIAL DE PRODUTOS (ASSOCIAÇÃO NACIONAL)",
    description: "Base Oficial de Produtos da ABECMED (Associação Brasileira de Cannabis Medicinal). Óleos Full Spectrum RSO veiculados em MCT (30 mL), Inflorescências in natura (Indoor, Outdoor e Estufa em embalagens de 5g, 10g, 15g e 25g) e Extrações concentradas sem solvente (2g e 5g). Receitas válidas por até 6 meses.",
    indicationsList: [
      "Ansiedade & Estresse (Linha Laranja - CBD)",
      "Dor Crônica & Fibromialgia (Linha Azul - CBD:THC)",
      "Insônia Severa & Relaxamento Noturno (Linha Verde - THC)",
      "Distúrbios Gastrointestinais & Foco (Linha Vermelha - CBG)",
      "Arquitetura do Sono Reparador (Linha Limão - CBD:CBN)",
      "Estabilização de Humor & Burnout (Linha Lilás - CBD:CBG)",
      "Resgate de Crises Álgicas Agudas (Flores e Extrações sem Solvente)"
    ],
    dosageGuidance: "Posologia conforme determinação do prescritor individual. Não há quantidade universal de gotas; aguardar posologia médica.",
    products: ABECMED_PRODUCTS
  },
  {
    id: "flowermed_oficial",
    title: "LINHA FLOWERMED (EUA • FDA & ANVISA)",
    description: "Laboratório americano com mais de 3 anos no Brasil. Normas FDA e ANVISA RDC 660/2022. COA lote a lote ISO/IEC 17025:2017. Linhas Hemp Oil, Canabinoides Direcionados, Sphera Premium, Syrup Nano e Gummies.",
    indicationsList: [
      "Dor Crônica",
      "Ansiedade e Pânico",
      "Insônia e Distúrbios do Sono",
      "Epilepsia e Convulsões",
      "Doença de Crohn",
      "Síndrome Metabólica e Obesidade",
      "Esclerose Múltipla e Espasticidade",
      "Fibromialgia",
      "Autismo (TEA)",
      "TDAH",
      "Cuidados Paliativos",
      "Enxaqueca",
      "Inflamação Crônica"
    ],
    dosageGuidance: "Prescrição individualizada. Óleos sublinguais com retenção de 60s sob a língua. Titulação 'start low, go slow' a cada 4-5 dias.",
    products: FLOWERMED_PRODUCTS
  },
  {
    id: "flores_extracoes",
    title: "FOLHETO: FLORES IN NATURA & EXTRAÇÕES (14G / SERINGAS / BUDDER)",
    description: "Flores in natura importadas em embalagens de 14g (CBD, Delta-8 THC e THCA) e extrações concentradas (Seringas dosadoras 1ml/2ml e Gold Budder 5g).",
    indicationsList: [
      "Dor Crônica & Aguda",
      "Insônia e Desaceleração Mental",
      "Ansiedade e Estresse",
      "Fadiga e Falta de Foco",
      "Espasticidade Muscular",
      "Recuperação Física",
      "Humor e Criatividade"
    ],
    dosageGuidance: "Uso inalatório através de vaporizador medicinal de ervas secas ou concentrados (temperatura controlada entre 160°C e 210°C sem combustão) ou sublingual em microdoses graduadas.",
    products: FLOWER_EXTRACTIONS_PRODUCTS
  },
  {
    id: "ansiedade",
    title: "1. ANSIEDADE, ESTRESSE E TRANSTORNOS MENTAIS",
    description: "Produtos com perfil ansiolítico calmante e regulador do humor.",
    indicationsList: ["Ansiedade", "Depressão", "Estresse Crônico", "Burnout", "TDAH", "Transtornos do Humor"],
    dosageGuidance: "Iniciar com doses baixas (ex: 10-15 mg/dia de CBD ou 1/2 goma). Aumentar gradualmente conforme a resposta do paciente.",
    products: [
      NATIONAL_FULL_SPECTRUM_PRODUCTS[0], // ALTO CBD 5:1 THC (30 mg/mL — 900mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[2], // ALTO CBD 10:1 THC (30 mg/mL — 900mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[5], // ALTO CBD 20:1 THC (30 mg/mL — 900mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[12], // CBD + CBG + CBN (4:1:1) (30 mg/mL — 900mg)
      {
        name: "Broad SPECTRUM CBD, CBN 1065mg —————- 15ml",
        manufacturer: "Associação Nacional",
        origin: "Nacional",
        type: "Óleo Broad Spectrum CBD + CBN (0% THC)",
        activeIngredients: "Canabidiol (CBD) Broad Spectrum + Canabinol (CBN) - Total 1065mg",
        concentration: "CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL",
        pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
        quantity: "01 Frasco de 15 mL",
        administrationRoute: "Via Sublingual / Oral",
        priceBRL: 210,
        details: ["Frasco 15mL", "CBD + CBN 1065mg", "Broad Spectrum (0% THC)", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum combinando Canabidiol (CBD) e Canabinol (CBN) totalizando 1065mg em frasco de 15ml, com zero THC (0,0%). O Canabinol (CBN) atua sinergicamente com o CBD na indução do sono, relaxamento profundo e desaceleração mental sem efeitos psicoativos.",
        usageInstructions: "Pingar 2 gotas pela manhã e 4 a noite.\n- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.\n- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima.",
        indications: "Insônia, Distúrbios do Sono, Ansiedade, Estresse Crônico, Agitação Noturna, Síndrome das Pernas Inquietas"
      },
      {
        name: "Cápsulas Gelatinosas CBD Isolado 25mg",
        manufacturer: "PharmaHemp",
        origin: "Nacional",
        type: "Cápsula Softgel",
        details: ["Frasco com 30 cápsulas", "25mg CBD por cápsula", "0% THC", "Liberação prolongada"],
        description: "Opção prática e discreta para quem busca CBD sem efeitos psicoativos, ideal para manter níveis séricos estáveis ao longo do dia para ansiedade generalizada."
      },
      {
        name: "Spray Sublingual Broad Spectrum Calming Blend",
        manufacturer: "NatureCBD",
        origin: "Nacional",
        type: "Spray Sublingual",
        details: ["Frasco 15ml", "1000mg CBD Total", "Rico em Linalol e Camomila"],
        description: "Absorção rápida pela mucosa oral, excelente para picos agudos de estresse ou ataques de pânico."
      },
{
        name: "GreenBudz Calm Vibe Oil 6000mg • 200 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 80.00,
        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Calm+Vibe",
        details: ["Frasco 30ml", "aprox. 5 mg/gota", "< 0,3% THC∆9", "Terpenos naturais de menta"],
        description: "O Calm Vibe combina CBD Full Spectrum com um blend exclusivo de terpenos de perfil Indica, preservando o efeito entourage (mirceno, linalol, cariofileno e terpinoleno)."
      },
      {
        name: "GreenBudz Deep Vibe Oil 3000mg • 100 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/8b5cf6/ffffff?text=Deep+Vibe",
        details: ["Frasco 30ml", "aprox. 2,5 mg/gota", "< 0,3% THC∆9", "2,5% Terpenos (Myrcene, Linalool, Caryophyllene e Terpinolene)"],
        description: "O Deep Vibe combina CBD Full Spectrum com um blend exclusivo de terpenos inspirado em variedades Indica. Promove relaxamento, conforto físico e equilíbrio."
      },
      {
        name: "Drops By GreenBudz Goma Looking Glass CBD THC CBC CBG",
        activeIngredients: "Extrato Live Rosin (CBD + THC∆9 + CBC + CBG)",
        concentration: "3mg CBD + 3mg THC∆9 + 3mg CBC + 3mg CBG por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "3mg THC∆9, 3mg CBC, 3mg CBD, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: `O Drops By GreenBudz Looking Glass combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides CBD, THC, CBC e CBG, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de framboesa, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`,
        usageInstructions: "• Mastigar 1/2 a 1 goma mastigável ao final da tarde ou 1 hora antes de dormir por via oral. Mastigar bem antes de engolir. Ação terapêutica prolongada (4 a 6 horas). Não engolir inteira."
      },
      {
        name: "Drops By GreenBudz Goma River Float THC",
        activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Linalol, Cariofileno)",
        concentration: "5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Caryophyllene"],
        description: `O Drops By GreenBudz River Float combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de melancia, sua formulação foi desenhada para promover leveza física, relaxamento e equilíbrio, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`,
        usageInstructions: "• Mastigar 1/2 a 1 goma mastigável ao entardecer ou 1 hora antes de dormir por via oral. Mastigar bem antes de engolir. Ação prolongada de 4 a 6 horas. Não engolir inteira."
      },
      {
        name: "GreenBudz Stirred Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Stirred)",
        priceUSD: 109.00,
        details: ["THCa 350mg, CBD 85mg, CBG 2.5mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura pastosa", "Temp: 180-210C"],
        description: "Extrato obtido por mistura com terpenos. Ideal para vaporização em resgate rápido."
      },
      {
        name: "GreenBudz Crystalized Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Crystalized)",
        priceUSD: 109.00,
        details: ["THCa 465mg, CBD 17mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Cristais em sauce", "Temp: 180-210C"],
        description: "Cristais isolados de THCa banhados em sauce de terpenos. Strain: ICC (Mirceno, Limoneno, Cariofileno - Relaxante, revigorante, anti-inflamatório)."
      },
      {
        name: "Óleo Rico em CBD 50mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo CBD Predominante",
        details: ["Frasco 30ml", "50mg/ml CBD", "Baixo THC (<0,3%)", "Produto Nacional"],
        description: "Óleo rico em Canabidiol para pacientes sensíveis ao THC. Ideal para ansiedade, inflamações leves e regulação de humor."
      },
      {
        name: "Broad Spectrum Balanceado (50 mg/mL — 5%)",
        activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
        concentration: "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, Delta-9-THC: 0,0%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual / Oral",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 50 mg/mL (5%)", "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: `Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 50 mg/mL (5%).\nComposição: CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.`,
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Aproximadamente 25 gotas por mL):\n• Semana 1: Administrar 0,2 mL (5 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Semana 2: Aumentar para 0,4 mL (10 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Manutenção: Ajustar 0,1 mL (2 a 3 gotas) por dose a cada 7 dias conforme resposta clínica.`
      }
    ]
  },
  {
    id: "dor_cronica",
    title: "2. DOR CRÔNICA E INFLAMAÇÃO",
    description: "Formulações focadas em analgesia sistêmica e relaxamento muscular profundo.",
    indicationsList: ["Dor Crônica", "Enxaqueca", "Fibromialgia", "Artrite / Artrose", "Hérnia de Disco", "Dores Neuropáticas", "Neuropatia Diabética", "Esclerose Múltipla", "Asma", "Glaucoma"],
    dosageGuidance: "Dose inicial moderada. Aumentar conforme dor referida e tolerabilidade. Uso 2 a 3 vezes ao dia.",
    products: [
      NATIONAL_FULL_SPECTRUM_PRODUCTS[14], // EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (30 mg/mL — 900mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[15], // EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (60 mg/mL — 1800mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[16], // EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (100 mg/mL — 3000mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[1],  // ALTO CBD Full SPECTRUM CBD 5:1 THC - 30ml (60 mg/mL — 1800mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[18], // ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (60 mg/mL — 1800mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[11], // CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml (60 mg/mL — 1800mg)
      {
        name: "Adesivo Transdérmico CBD/THC 1:1 (Patch 72h)",
        manufacturer: "MedPatch",
        origin: "Nacional",
        type: "Adesivo Transdérmico",
        details: ["Caixa com 5 adesivos", "20mg CBD + 20mg THC por adesivo", "Liberação lenta por até 72h"],
        description: "Excelente alternativa para dor crônica localizada (ex: lombalgia, hérnia), oferecendo analgesia contínua sem necessidade de dosagem oral constante."
      },
      {
        name: "Óleo Concentrado CBG + CBD 2000mg (Anti-inflamatório)",
        manufacturer: "HempMeds",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30ml", "1000mg CBG + 1000mg CBD"],
        description: "Alto teor de Canabigerol (CBG), um potente inibidor de inflamação sistêmica, ideal para condições autoimunes e articulares severas."
      },
{
        name: "GreenBudz Chill Vibe Gummies - THC 1:1 CBD",
        activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
        concentration: "10mg CBD + 10mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "30 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 49.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Chill+Vibe",
        details: ["30 gomas por frasco", "10mg THC∆9 + 10mg CBD por goma", "Efeito Longo 4 a 6 horas", "3g de Carboidratos"],
        description: "Sinergia terapêutica do THC∆9 e do CBD para potencializar o efeito entourage. Gomas veganas com sabor melancia para relaxamento físico, conforto e equilíbrio."
      },
      {
        name: "Drops By GreenBudz Goma Bicycle Day THC e CBD",
        activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
        concentration: "4mg CBD + 5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 4mg CBD por goma", "Sabor framboesa", "Efeito longo 4 a 6 horas"],
        description: `O Drops By GreenBudz Bicycle Day combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do CBD e do THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de framboesa, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "Drops By GreenBudz Goma Crickets CBD e THC",
        activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
        concentration: "10mg CBD + 5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 10mg CBD por goma", "Sabor amora", "Efeito longo 4 a 6 horas"],
        description: `O Drops By GreenBudz Crickets combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do CBD e do THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de amora, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "Drops By GreenBudz Goma 100 Sheep THC",
        activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Limoneno, Cariofileno)",
        concentration: "5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Limonene e Caryophyllene"],
        description: `O Drops By GreenBudz 100 Sheep combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de cereja, sua formulação foi desenhada para promover relaxamento profundo, alívio de tensões e regulação do repouso, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "GreenBudz Stirred Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Stirred)",
        priceUSD: 109.00,
        details: ["THCa 350mg, CBD 85mg, CBG 2.5mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura pastosa", "Temp: 180-210C"],
        description: "Extrato obtido por mistura com terpenos. Ideal para vaporização em resgate rápido."
      },
      {
        name: "GreenBudz Granulated Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Granulated)",
        priceUSD: 109.00,
        details: ["THCa 400mg, CBD 17mg, CBC 48mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura granulada", "Temp: 180-210C"],
        description: "Mistura com terpenos para vaporização de ação imediata."
      },
      {
        name: "Óleo Integral THC/CBD 100mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30ml", "100mg/ml de Canabinoides Totais", "Relação THC/CBD balanceada", "Produto Nacional"],
        description: "Óleo de amplo espectro produzido por associação nacional. Eficaz para dores crônicas, espasticidade e distúrbios do sono refratários."
      },
      {
        name: "Flor in natura PREDOMINANTE THC (Para Vaporização)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Flor in natura (Inalação/Vaporização)",
        details: ["Embalagem 15g", "Rica em THC", "Uso inalatório em crises álgicas"],
        description: "Flores secas padronizadas ricas em THC para rápida resposta analgésica e alívio imediato via inalação vaporizada."
      },
      {
        name: "Pomada Canábica Terapêutica 500mg (50g)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Pomada Tópica",
        details: ["Pote 50g", "500mg Canabinoides", "Uso tópico local"],
        description: "Pomada fitocanabinoide de uso tópico para alívio localizado de dores articulares, musculares, artrite e dermatites."
      }
    ]
  },
  {
    id: "insonia",
    title: "3. INSÔNIA E DISTÚRBIOS DO SONO",
    description: "Produtos com CBN, THC e terpenos sedativos, focados em relaxamento noturno.",
    indicationsList: ["Insônia", "Distúrbios do Sono", "Bruxismo", "Síndrome das Pernas Inquietas", "Agitação Noturna"],
    dosageGuidance: "Uso noturno. Administrar a dose de 30 a 45 minutos antes do horário de dormir.",
    products: [
      NATIONAL_FULL_SPECTRUM_PRODUCTS[8],  // CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml (30 mg/mL — 900mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[9],  // CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml (60 mg/mL — 1800mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[17], // ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (30 mg/mL — 900mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[18], // ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (60 mg/mL — 1800mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[13], // CBD + CBG + CBN Full Spectrum (4 CBD : 1 CBG : 1 CBN) - 30ml (60 mg/mL — 1800mg)
      {
        name: "Broad SPECTRUM CBD, CBN 1065mg —————- 15ml",
        manufacturer: "Associação Nacional",
        origin: "Nacional",
        type: "Óleo Broad Spectrum CBD + CBN (0% THC)",
        activeIngredients: "Canabidiol (CBD) Broad Spectrum + Canabinol (CBN) - Total 1065mg",
        concentration: "CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL",
        pharmaceuticalForm: "Solução Oleosa Sublingual (Gotas)",
        quantity: "01 Frasco de 15 mL",
        administrationRoute: "Via Sublingual / Oral",
        priceBRL: 210,
        details: ["Frasco 15mL", "CBD + CBN 1065mg", "Broad Spectrum (0% THC)", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum combinando Canabidiol (CBD) e Canabinol (CBN) totalizando 1065mg em frasco de 15ml, com zero THC (0,0%). O Canabinol (CBN) atua sinergicamente com o CBD na indução do sono, relaxamento profundo e desaceleração mental sem efeitos psicoativos.",
        usageInstructions: "Pingar 2 gotas pela manhã e 4 a noite.\n- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.\n- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima.",
        indications: "Insônia, Distúrbios do Sono, Ansiedade, Estresse Crônico, Agitação Noturna, Síndrome das Pernas Inquietas"
      },
      {
        name: "Cápsulas CBD + CBN 30mg Sleep Formula",
        manufacturer: "ZzzCBD",
        origin: "Nacional",
        type: "Cápsula",
        details: ["30 cápsulas", "25mg CBD + 5mg CBN por cápsula", "Com Melatonina natural"],
        description: "Formulação noturna específica contendo CBN, conhecido pelo seu forte potencial sedativo e indutor do sono."
      },
{
        name: "Drops By GreenBudz Goma Nightshade CBD CBN e THC",
        activeIngredients: "Extrato Live Rosin (CBD + CBN + THC∆9)",
        concentration: "5mg CBD + 5mg CBN + 5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 5mg CBD, 5mg CBN por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: `O Drops By GreenBudz Nightshade combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides CBD, CBN e THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar, sua formulação foi desenhada para induzir relaxamento profundo e repouso noturno, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "GreenBudz Granulated Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Granulated)",
        priceUSD: 109.00,
        details: ["THCa 400mg, CBD 17mg, CBC 48mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura granulada", "Temp: 180-210C"],
        description: "Mistura com terpenos para vaporização de ação imediata."
      },
      {
        name: "Broad Spectrum com Razão Enriquecida (CBD + CBN para Sono)",
        activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum Sono) + Terpenos relaxantes (Mirceno/Linalol)",
        concentration: "CBD 50 mg/mL, CBN 10 mg/mL, Delta-9-THC: 0,0%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual / Oral",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 60 mg/mL (6%)", "CBD 50 mg/mL, CBN 10 mg/mL, THC 0,0%", "Veículo com terpenos relaxantes (Mirceno/Linalol)", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: `Extrato de Cannabis sativa (Broad Spectrum Sono) — Canabinoides Totais: 60 mg/mL (6%).\nComposição: CBD 50 mg/mL, CBN 10 mg/mL, Delta-9-THC: 0,0%.\nVeículo: com terpenos relaxantes (Mirceno/Linalol).\nQuantidade: 01 (um) frasco de 30 mL.`,
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Aproximadamente 25 gotas por mL):\n• Semana 1: Administrar 0,25 mL (6 gotas) via sublingual, 30 a 45 minutos antes de deitar. (Total: 12,5 mg CBD + 2,5 mg CBN)\n• Semana 2: Se persistir latência aumentada, progredir para 0,5 mL (12 a 13 gotas) antes de deitar. (Total: 25 mg CBD + 5 mg CBN)`
      },
      {
        name: "Gomas Terapêuticas CBD/CBN 25mg - 30 unidades",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Gomas (Comestível)",
        details: ["Pote com 30 unidades", "25mg CBD/CBN por goma", "Sabor Frutas"],
        description: "Gomas terapêuticas para facilidade de ingestão e liberação prolongada, indicadas para indução e manutenção do sono reparador."
      }
    ]
  },
  {
    id: "energia_foco",
    title: "4. ENERGIA, FOCO, METABOLISMO E TDAH",
    description: "Canabinoides como THCV, CBG e terpenos estimulantes (ex: limoneno) para disposição física e mental.",
    indicationsList: ["TDAH", "Burnout", "Foco e Concentração", "Obesidade e Controle Metabólico", "Diabetes e Resistência Insulínica", "Melhora no Esporte", "Fadiga Crônica"],
    dosageGuidance: "Uso diurno. Evitar após as 16h para não interferir no sono.",
    products: [
      NATIONAL_FULL_SPECTRUM_PRODUCTS[10], // CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml (30 mg/mL — 900mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[11], // CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml (60 mg/mL — 1800mg)
      NATIONAL_FULL_SPECTRUM_PRODUCTS[6],  // ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml (60 mg/mL — 1800mg)
      {
        name: "Extrato Fluido Rico em THCV (Focus & Energy)",
        manufacturer: "VitalLeaf",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30ml", "500mg THCV + 1000mg CBD", "Perfil Sativa"],
        description: "O THCV possui propriedades estimulantes e supressoras de apetite, sendo uma excelente opção para TDAH, fadiga crônica e foco sem a agitação da cafeína."
      },
{
        name: "GreenBudz Super Vibe Oil 3000mg • 100 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Super+Vibe",
        details: ["Frasco 30ml", "aprox. 2,5 mg/gota", "2,5% Terpenos Limoneno, Pineno, Terpinoleno e Caryophylleno"],
        description: "Blend exclusivo de terpenos de perfil Sativa. Favorece a biodisponibilidade para suporte da disposição, do foco e do equilíbrio ao longo do dia."
      },
      {
        name: "GreenBudz Slim Vibe Oil 1500 mg CBD + 1500 mg THCv (50 mg/ml CBD + 50 mg/ml THCv)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum + THCv",
        priceUSD: 120.00,
        image: "https://placehold.co/400x400/a3e635/ffffff?text=Slim+Vibe",
        details: ["Frasco 30ml", "aprox. 1,75 mg CBD + 1,75mg THCv/gota", "THCv não possui efeito psicoativo", "Sabor hortelã"],
        description: "Desenvolvido para promover equilíbrio metabólico e bem-estar. O THCv atua como coadjuvante no manejo da Diabetes, regulação da glicemia e controle de peso. Base de óleo MCT e sabor natural de hortelã."
      },
      {
        name: "Drops By GreenBudz Goma Rodeo Queen THCV CBG e THC",
        activeIngredients: "Extrato Live Rosin (THCV + CBG + THC∆9)",
        concentration: "5mg THCV + 3mg CBG + 3mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THCV, 3mg THC∆9, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: `O Drops By GreenBudz Rodeo Queen combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides THCV, CBG e THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar, sua formulação foi desenhada para promover foco, vitalidade, regulação metabólica e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "Drops By GreenBudz Goma Formula One THC",
        activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Pineno, Limoneno)",
        concentration: "5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Pinene e Limonene"],
        description: `O Drops By GreenBudz Formula One combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de lima, sua formulação foi desenhada para promover conforto físico, disposição e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "GreenBudz Dried Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Dried Ice)",
        priceUSD: 75.00,
        details: ["THCa 100mg por dose, Full Spectrum", "Dose 0.5g", ">0,3% THC∆9", "Textura pulverulenta", "Temp: 180-210C"],
        description: "Extração mecânica a seco com gelo seco."
      },
      {
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
        concentration: "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual / Oral",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: `Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 100 mg/mL (10%).\nComposição: CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.`,
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Aproximadamente 25 gotas por mL):\n• Dias 1 a 5: Administrar 0,1 mL (2 a 3 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (5 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (7 a 8 gotas) a cada 12 horas. (Total: 30 mg/dose)`
      }
    ]
  },
  {
    id: "saude_mulher",
    title: "5. SAÚDE DA MULHER (TPM, MENOPAUSA, ENDOMETRIOSE)",
    description: "Formulações focadas em equilíbrio hormonal e alívio de sintomas agudos.",
    indicationsList: ["TPM (Tensão Pré-Menstrual)", "Menopausa", "Endometriose", "Cólicas Menstruais (Dismenorreia)"],
    dosageGuidance: "Uso contínuo para prevenção ou resgate para cólicas e enxaquecas agudas.",
    products: [
            {
        name: "Supositório Pélvico CBD/THC (Endometriose e Cólicas)",
        manufacturer: "FemmeCare CBD",
        origin: "Nacional",
        type: "Supositório",
        details: ["Caixa com 10 unidades", "50mg CBD + 10mg THC por unidade"],
        description: "Absorção local no plexo pélvico. Extremamente eficaz para dor aguda de endometriose e dismenorreia severa, evitando processamento hepático e efeitos psicoativos centrais."
      },
{
        name: "GreenBudz Deep Vibe Oil 3000mg • 100 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/8b5cf6/ffffff?text=Deep+Vibe",
        details: ["Frasco 30ml", "aprox. 2,5 mg/gota", "< 0,3% THC∆9", "2,5% Terpenos (Myrcene, Linalool, Caryophyllene e Terpinolene)"],
        description: "O Deep Vibe combina CBD Full Spectrum com um blend exclusivo de terpenos inspirado em variedades Indica. Promove relaxamento, conforto físico e equilíbrio."
      },
      {
        name: "GreenBudz Chill Vibe Gummies - THC 1:1 CBD",
        activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
        concentration: "10mg CBD + 10mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "30 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 49.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Chill+Vibe",
        details: ["30 gomas por frasco", "10mg THC∆9 + 10mg CBD por goma", "Efeito Longo 4 a 6 horas", "3g de Carboidratos"],
        description: "Sinergia terapêutica do THC∆9 e do CBD para potencializar o efeito entourage. Gomas veganas com sabor melancia para relaxamento físico, conforto e equilíbrio."
      },
      {
        name: "Drops By GreenBudz Goma Rodeo Queen THCV CBG e THC",
        activeIngredients: "Extrato Live Rosin (THCV + CBG + THC∆9)",
        concentration: "5mg THCV + 3mg CBG + 3mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THCV, 3mg THC∆9, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: `O Drops By GreenBudz Rodeo Queen combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides THCV, CBG e THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar, sua formulação foi desenhada para promover foco, vitalidade, regulação metabólica e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "Pomada Canábica Terapêutica 500mg (50g)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Pomada Tópica",
        details: ["Pote 50g", "500mg Canabinoides", "Uso tópico local"],
        description: "Pomada fitocanabinoide de uso tópico para alívio localizado de dores articulares, musculares, artrite e dermatites."
      }
    ]
  },
  {
    id: "gastro",
    title: "6. GASTROINTESTINAL (CROHN, COLITE, ANOREXIA)",
    description: "Modulação da inflamação do trato digestivo e regulação das vias gástricas.",
    indicationsList: ["Doença de Crohn", "Colite Ulcerativa", "Anorexia", "Síndrome do Intestino Irritável", "Controle de Náuseas"],
    dosageGuidance: "Óleos full spectrum ou gomas para modulação de longo prazo no trato GI.",
    products: [
            {
        name: "Cápsulas Gastrorresistentes CBD/CBG (Doença de Crohn)",
        manufacturer: "GI-Hemp",
        origin: "Nacional",
        type: "Cápsula Gastrorresistente",
        details: ["60 cápsulas", "25mg CBD + 10mg CBG por cápsula", "Revestimento entérico"],
        description: "Cápsulas desenvolvidas para resistir ao ácido estomacal e liberar os fitocanabinoides diretamente no intestino, modulando a inflamação local da Colite e Crohn."
      },
      {
        name: "Spray Oral Anti-Emético (Rico em THC)",
        manufacturer: "Associação Nacional",
        origin: "Nacional",
        type: "Spray Oral",
        details: ["Frasco 20ml", "50mg/ml THC + 5mg/ml CBD"],
        description: "Ação anti-emética (contra náuseas) quase imediata. Essencial para controle rápido de ânsia em quadros de anorexia induzida por tratamentos severos."
      },
{
        name: "Óleo Integral THC/CBD 100mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30ml", "100mg/ml de Canabinoides Totais", "Relação THC/CBD balanceada", "Produto Nacional"],
        description: "Óleo de amplo espectro produzido por associação nacional. Eficaz para dores crônicas, espasticidade e distúrbios do sono refratários."
      },
      {
        name: "Drops By GreenBudz Goma Beethoven THC",
        activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Linalol, Limoneno)",
        concentration: "5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Limonene"],
        description: `O Drops By GreenBudz Beethoven combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de laranja, sua formulação foi desenhada para promover conforto físico, alívio e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "GreenBudz Chill Vibe Gummies - THC 1:1 CBD",
        activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
        concentration: "10mg CBD + 10mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "30 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 49.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Chill+Vibe",
        details: ["30 gomas por frasco", "10mg THC∆9 + 10mg CBD por goma", "Efeito Longo 4 a 6 horas", "3g de Carboidratos"],
        description: "Sinergia terapêutica do THC∆9 e do CBD para potencializar o efeito entourage. Gomas veganas com sabor melancia para relaxamento físico, conforto e equilíbrio."
      },
      {
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
        activeIngredients: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
        concentration: "CBD 50 mg/mL + THC < 0,2%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 50 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: `Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%\nQuantidade: 01 (um) frasco de 30 mL.`
      }
    ]
  },
  {
    id: "neurodegenerativas",
    title: "7. DOENÇAS NEURODEGENERATIVAS E IDOSOS",
    description: "Formulações para neuroproteção, controle de agitação noturna, tremores e rigidez.",
    indicationsList: ["Parkinson", "Alzheimer", "Demência", "Tremores e Rigidez Muscular", "Qualidade de vida na Terceira Idade"],
    dosageGuidance: "Uso diurno. Evitar após as 16h para não interferir no sono.",
    products: [
            {
        name: "Óleo Oral CBD/THC 10:1 (Parkinson)",
        manufacturer: "NeuroHemp",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30ml", "100mg/ml CBD + 10mg/ml THC"],
        description: "Proporção específica para neuroproteção e controle de tremores, oferecendo alto CBD sistêmico com traços de THC para sinergia de relaxamento muscular."
      },
{
        name: "GreenBudz Super Vibe Oil 3000mg • 100 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Super+Vibe",
        details: ["Frasco 30ml", "aprox. 2,5 mg/gota", "2,5% Terpenos Limoneno, Pineno, Terpinoleno e Caryophylleno"],
        description: "Blend exclusivo de terpenos de perfil Sativa. Favorece a biodisponibilidade para suporte da disposição, do foco e do equilíbrio ao longo do dia."
      },
      {
        name: "GreenBudz Slim Vibe Oil 1500 mg CBD + 1500 mg THCv (50 mg/ml CBD + 50 mg/ml THCv)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum + THCv",
        priceUSD: 120.00,
        image: "https://placehold.co/400x400/a3e635/ffffff?text=Slim+Vibe",
        details: ["Frasco 30ml", "aprox. 1,75 mg CBD + 1,75mg THCv/gota", "THCv não possui efeito psicoativo", "Sabor hortelã"],
        description: "Desenvolvido para promover equilíbrio metabólico e bem-estar. Base de óleo MCT e sabor natural de hortelã."
      },
      {
        name: "Drops By GreenBudz Goma Rodeo Queen THCV CBG e THC",
        activeIngredients: "Extrato Live Rosin (THCV + CBG + THC∆9)",
        concentration: "5mg THCV + 3mg CBG + 3mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THCV, 3mg THC∆9, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: `O Drops By GreenBudz Rodeo Queen combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides THCV, CBG e THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar, sua formulação foi desenhada para promover foco, vitalidade, regulação metabólica e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "Drops By GreenBudz Goma Formula One THC",
        activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Pineno, Limoneno)",
        concentration: "5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Pinene e Limonene"],
        description: `O Drops By GreenBudz Formula One combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de lima, sua formulação foi desenhada para promover conforto físico, disposição e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
      },
      {
        name: "GreenBudz Dried Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Dried Ice)",
        priceUSD: 75.00,
        details: ["THCa 100mg por dose, Full Spectrum", "Dose 0.5g", ">0,3% THC∆9", "Textura pulverulenta", "Temp: 180-210C"],
        description: "Extração mecânica a seco com gelo seco."
      },
      {
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
        concentration: "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual / Oral",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: `Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 100 mg/mL (10%).\nComposição: CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.`,
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Aproximadamente 25 gotas por mL):\n• Dias 1 a 5: Administrar 0,1 mL (2 a 3 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (5 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (7 a 8 gotas) a cada 12 horas. (Total: 30 mg/dose)`
      }
    ]
  },
  {
    id: "epilepsia",
    title: "8. EPILEPSIA E CONVULSÕES REFRATÁRIAS",
    description: "Foco em altas concentrações de CBD sistêmico e resgate rápido para controle sintomático.",
    indicationsList: ["Epilepsia Refratária", "Crises Convulsivas", "Síndrome de Dravet", "Síndrome de Lennox-Gastaut"],
    dosageGuidance: "Doses elevadas de CBD (frequentemente mg/kg). Resgate imediato com vaporização (isolado) durante a aura ou crise.",
    products: [
            {
        name: "Extrato Purificado CBD Isolado 200mg/ml (Epidiolex-like)",
        manufacturer: "PharmaCBD",
        origin: "Nacional",
        type: "Óleo Isolado",
        details: ["Frasco 50ml", "200mg/ml CBD", "0% THC Garantido", "Grau Farmacêutico"],
        description: "Fórmula pura de CBD em altíssima concentração, sem risco de interferência psicoativa. Dosagem robusta baseada em peso (mg/kg) para quadros convulsivos refratários."
      },
{
        name: "GreenBudz Calm Vibe Oil 6000mg • 200 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 80.00,
        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Calm+Vibe",
        details: ["Frasco 30ml", "aprox. 5 mg/gota", "< 0,3% THC∆9", "Terpenos naturais de menta"],
        description: "O Calm Vibe combina CBD Full Spectrum com um blend exclusivo de terpenos de perfil Indica, preservando o efeito entourage (mirceno, linalol, cariofileno e terpinoleno)."
      },
      {
        name: "GreenBudz Isolate CBD Hemp Formula",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Isolado de CBD",
        priceUSD: 89.00,
        details: ["CBD 465mg por dose", "0% THC∆9", "Dose 0.5g", "Sem Terpenos", "Temp: 160-190C"],
        description: "Cristais de CBD isolado de alta pureza. $89 (10 Doses) / $299 (40 Doses)."
      },
      {
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%",
        activeIngredients: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%",
        concentration: "CBD 100 mg/mL + THC < 0,2%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 100 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: `Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%\nQuantidade: 01 (um) frasco de 30 mL.`
      },
      {
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
        concentration: "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual / Oral",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: `Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 100 mg/mL (10%).\nComposição: CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.`,
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Aproximadamente 25 gotas por mL):\n• Dias 1 a 5: Administrar 0,1 mL (2 a 3 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (5 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (7 a 8 gotas) a cada 12 horas. (Total: 30 mg/dose)`
      }
    ]
  },
  {
    id: "autismo",
    title: "9. TRANSTORNO DO ESPECTRO AUTISTA (TEA)",
    description: "Modulação sensorial contínua e controle de estereotipias, promovendo equilíbrio.",
    indicationsList: ["Autismo (TEA)", "Regulação Sensorial e Comportamental", "Controle de Agressividade", "Melhora na Sociabilidade"],
    dosageGuidance: "Predominância de CBD. Uso de THC apenas para controle severo de agressividade em casos refratários.",
    products: [
            {
        name: "Gomas Infantis CBD Broad Spectrum (Sabor Morango)",
        manufacturer: "KidsHemp",
        origin: "Nacional",
        type: "Goma comestível",
        details: ["30 gomas", "10mg CBD por goma", "0% THC", "Vegano e sem açúcar"],
        description: "Apresentação amigável e fácil de administrar para crianças com TEA. Ajuda no controle de ansiedade, regulação sensorial e agressividade, sem THC."
      },
{
        name: "GreenBudz Calm Vibe Oil 6000mg • 200 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 80.00,
        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Calm+Vibe",
        details: ["Frasco 30ml", "aprox. 5 mg/gota", "< 0,3% THC∆9", "Terpenos naturais de menta"],
        description: "O Calm Vibe combina CBD Full Spectrum com um blend exclusivo de terpenos de perfil Indica, preservando o efeito entourage (mirceno, linalol, cariofileno e terpinoleno)."
      },
      {
        name: "Óleo Rico em CBD 50mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo CBD Predominante",
        details: ["Frasco 30ml", "50mg/ml CBD", "Baixo THC (<0,3%)", "Produto Nacional"],
        description: "Óleo rico em Canabidiol para pacientes sensíveis ao THC. Ideal para ansiedade, inflamações leves e regulação de humor."
      },
      {
        name: "Broad Spectrum Balanceado (50 mg/mL — 5%)",
        activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
        concentration: "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, Delta-9-THC: 0,0%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual / Oral",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 50 mg/mL (5%)", "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: `Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 50 mg/mL (5%).\nComposição: CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.`,
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Aproximadamente 25 gotas por mL):\n• Semana 1: Administrar 0,2 mL (5 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Semana 2: Aumentar para 0,4 mL (10 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Manutenção: Ajustar 0,1 mL (2 a 3 gotas) por dose a cada 7 dias conforme resposta clínica.`
      },
      {
        name: "Drops By GreenBudz Goma Looking Glass CBD THC CBC CBG",
        activeIngredients: "Extrato Live Rosin (CBD + THC∆9 + CBC + CBG)",
        concentration: "3mg CBD + 3mg THC∆9 + 3mg CBC + 3mg CBG por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "3mg THC∆9, 3mg CBC, 3mg CBD, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: `O Drops By GreenBudz Looking Glass combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides CBD, THC, CBC e CBG, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de framboesa, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`,
        usageInstructions: "• Mastigar 1/2 a 1 goma mastigável ao final da tarde ou 1 hora antes de dormir por via oral. Mastigar bem antes de engolir. Ação terapêutica prolongada (4 a 6 horas). Não engolir inteira."
      },
      {
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
        activeIngredients: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
        concentration: "CBD 50 mg/mL + THC < 0,2%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 50 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: `Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%\nQuantidade: 01 (um) frasco de 30 mL.`
      }
    ]
  },
  {
    id: "dermatologia",
    title: "10. DERMATOLOGIA (PSORÍASE E DERMATITE)",
    description: "Opções de uso tópico e sistêmico para controle inflamatório autoimune da pele.",
    indicationsList: ["Psoríase", "Dermatite Atópica", "Inflamações Cutâneas", "Alívio do Prurido e Descamação"],
    dosageGuidance: "Aplicação tópica local combinada com uso sistêmico (óleo) em casos severos.",
    products: [
            {
        name: "Creme Tópico CBD/CBG (Psoríase e Dermatite Atópica)",
        manufacturer: "DermaWeed",
        origin: "Nacional",
        type: "Creme Tópico",
        details: ["Bisnaga 100g", "1000mg CBD + 500mg CBG"],
        description: "Ação direta nos receptores CB1 e CB2 da pele. O CBG age como potente anti-inflamatório, reduzindo escamação e coceira da psoríase rapidamente."
      },
{
        name: "Pomada Canábica Terapêutica 500mg (50g)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Pomada Tópica",
        details: ["Pote 50g", "500mg Canabinoides", "Uso tópico local"],
        description: "Pomada fitocanabinoide de uso tópico para alívio localizado de dores articulares, musculares, artrite e dermatites."
      },
      {
        name: "Óleo Rico em CBD 50mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo CBD Predominante",
        details: ["Frasco 30ml", "50mg/ml CBD", "Baixo THC (<0,3%)", "Produto Nacional"],
        description: "Óleo rico em Canabidiol para pacientes sensíveis ao THC. Ideal para ansiedade, inflamações leves e regulação de humor."
      }
    ]
  },
  {
    id: "vicios",
    title: "11. REDUÇÃO DE VÍCIOS E DANOS",
    description: "Auxílio estruturado na redução do uso problemático de substâncias e estabilização.",
    indicationsList: ["Redução de Vícios", "Controle de Fissuras (Craving)", "Desmame de Benzodiazepínicos e Opioides", "Estabilização Emocional"],
    dosageGuidance: "Preponderância de CBD para controle da ansiedade de retirada.",
    products: [
            {
        name: "Flor de Cânhamo CBD Indoor (Pré-Rolled) - Controle de Craving",
        manufacturer: "PureHemp",
        origin: "Nacional",
        type: "Flor In Natura",
        details: ["Embalagem com 5 unidades", "Aproximadamente 15% CBD", "Terapêutica Inalatória"],
        description: "A inalação oferece biodisponibilidade instantânea. Excelente ferramenta de redução de danos para substituir o ato de fumar (tabaco/crack), reduzindo fissuras agudas (craving)."
      },
{
        name: "GreenBudz Calm Vibe Oil 6000mg • 200 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 80.00,
        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Calm+Vibe",
        details: ["Frasco 30ml", "aprox. 5 mg/gota", "< 0,3% THC∆9", "Terpenos naturais de menta"],
        description: "O Calm Vibe combina CBD Full Spectrum com um blend exclusivo de terpenos de perfil Indica, preservando o efeito entourage (mirceno, linalol, cariofileno e terpinoleno)."
      },
      {
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%",
        activeIngredients: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%",
        concentration: "CBD 100 mg/mL + THC < 0,2%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 100 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: `Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%\nQuantidade: 01 (um) frasco de 30 mL.`
      },
      {
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
        concentration: "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%",
        pharmaceuticalForm: "Solução Oleosa Sublingual",
        quantity: "01 (um) frasco de 30 mL",
        administrationRoute: "Sublingual / Oral",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: `Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 100 mg/mL (10%).\nComposição: CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.`,
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Aproximadamente 25 gotas por mL):\n• Dias 1 a 5: Administrar 0,1 mL (2 a 3 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (5 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (7 a 8 gotas) a cada 12 horas. (Total: 30 mg/dose)`
      }
    ]
  },
  {
    id: "oncologia",
    title: "12. ONCOLOGIA E CUIDADOS PALIATIVOS",
    description: "Apoio analgésico e alívio dos efeitos colaterais de tratamentos oncológicos.",
    indicationsList: ["Suporte no Câncer", "Cuidados Paliativos", "Dor Oncológica", "Náuseas e Vômitos Induzidos por Quimioterapia", "Caquexia (Perda de Apetite)"],
    dosageGuidance: "Uso de THC para estimulação de apetite e controle de náusea. Vaporização para controle imediato de dor irruptiva.",
    products: [
            {
        name: "Óleo Rick Simpson (RSO) - THC Altamente Concentrado",
        manufacturer: "Associação Nacional",
        origin: "Nacional",
        type: "Extrato Concentrado",
        details: ["Seringa 10ml", "Extrato pastoso 70% THC", "Dosagem de precisão"],
        description: "Extrato integral não diluído extremamente potente. Usado em cuidados paliativos para manejo de dor lancinante, resgate de apetite e caquexia severa em pacientes oncológicos tolerantes ao THC."
      },
{
        name: "GreenBudz Chill Vibe Gummies - THC 1:1 CBD",
        activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
        concentration: "10mg CBD + 10mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "30 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 49.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Chill+Vibe",
        details: ["30 gomas por frasco", "10mg THC∆9 + 10mg CBD por goma", "Efeito Longo 4 a 6 horas", "3g de Carboidratos"],
        description: "Sinergia terapêutica do THC∆9 e do CBD para potencializar o efeito entourage. Gomas veganas com sabor melancia para relaxamento físico, conforto e equilíbrio."
      },
      {
        name: "GreenBudz Stirred Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Stirred)",
        priceUSD: 109.00,
        details: ["THCa 350mg, CBD 85mg, CBG 2.5mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura pastosa", "Temp: 180-210C"],
        description: "Extrato obtido por mistura com terpenos. Ideal para vaporização em resgate rápido."
      },
      {
        name: "GreenBudz Isolate THCa Hemp Formula",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Isolado de THCa",
        priceUSD: 129.00,
        details: ["THCa 499mg por dose", "0% THC∆9", "Dose 0.5g", "Sem Terpenos", "Textura cristalina", "Temp: 180-210C"],
        description: "Cristais de THCa isolado de alta pureza. $129 (10 Doses) / $399 (40 Doses)."
      },
      {
        name: "Óleo Integral THC/CBD 100mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30ml", "100mg/ml de Canabinoides Totais", "Relação THC/CBD balanceada", "Produto Nacional"],
        description: "Óleo de amplo espectro produzido por associação nacional. Eficaz para dores crônicas, espasticidade e distúrbios do sono refratários."
      },
      {
        name: "Flor in natura PREDOMINANTE THC (Para Vaporização)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Flor in natura (Inalação/Vaporização)",
        details: ["Embalagem 15g", "Rica em THC", "Uso inalatório em crises álgicas"],
        description: "Flores secas padronizadas ricas em THC para rápida resposta analgésica e alívio imediato via inalação vaporizada."
      },
      {
        name: "Drops By GreenBudz Goma Beethoven THC",
        activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Linalol, Limoneno)",
        concentration: "5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Limonene"],
        description: `O Drops By GreenBudz Beethoven combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de laranja, sua formulação foi desenhada para promover conforto físico, alívio e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`,
        usageInstructions: "• Mastigar 1/2 a 1 goma mastigável ao final da tarde ou 1 hora antes de dormir por via oral. Mastigar bem antes de engolir. Ação terapêutica prolongada (4 a 6 horas). Não engolir inteira."
      },
      {
        name: "Drops By GreenBudz Goma Evergreen THC",
        activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Limoneno, Humuleno, Cariofileno)",
        concentration: "5mg THC∆9 por goma",
        pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
        quantity: "20 gomas por frasco",
        administrationRoute: "Via Oral",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Limonene, Humulene e Caryophyllene"],
        description: `O Drops By GreenBudz Evergreen combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de limão, sua formulação foi desenhada para promover conforto físico, vitalidade e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`,
        usageInstructions: "• Mastigar 1/2 a 1 goma mastigável ao final da tarde ou 1 hora antes de dormir por via oral. Mastigar bem antes de engolir. Ação terapêutica prolongada (4 a 6 horas). Não engolir inteira."
      }
    ]
  }
];


export interface EnrichedMedicationInfo {
  name: string;
  activeIngredients: string;
  concentration: string;
  pharmaceuticalForm: string;
  quantity: string;
  administrationRoute: string;
  brand: string;
  origin: string;
  type?: string;
  description: string;
  usageInstructions?: string;
}

function _enrichMedicationDetails(
  productName: string, 
  brand?: string, 
  origin?: string, 
  type?: string,
  product?: CBDProduct
): EnrichedMedicationInfo {
  const pName = productName || '';
  const nameLower = pName.toLowerCase();

  // Check if product is from Flowermed catalog
  const flowerMatch = FLOWERMED_PRODUCTS.find(p => 
    p.name.toLowerCase() === nameLower ||
    nameLower.includes(p.name.toLowerCase()) ||
    (p.name.toLowerCase().includes('sphera') && nameLower.includes('sphera') && (
      (p.name.includes('10%') && nameLower.includes('10%')) ||
      (p.name.includes('20%') && nameLower.includes('20%')) ||
      (p.name.includes('terpenos') && nameLower.includes('terpenos')) ||
      (p.name.includes('delta-8') && nameLower.includes('delta-8')) ||
      (p.name.includes('1.000') && nameLower.includes('1.000'))
    )) ||
    (p.name.toLowerCase().includes('nano syrup') && nameLower.includes('syrup')) ||
    (p.name.toLowerCase().includes('cbn sleep') && (nameLower.includes('cbn sleep') || nameLower.includes('goma cbn'))) ||
    (p.name.toLowerCase().includes('gummies d9') && (nameLower.includes('gummies d9') || nameLower.includes('goma d9')))
  );

  if (flowerMatch || brand === 'Flowermed' || (product && product.manufacturer === 'Flowermed')) {
    const target = flowerMatch || product;
    return {
      name: target?.name || pName,
      activeIngredients: target?.activeIngredients || 'Fitocanabinoides Padronizados (Normas FDA / ANVISA)',
      concentration: target?.concentration || 'Conforme rótulo',
      pharmaceuticalForm: target?.pharmaceuticalForm || 'Solução Oleosa Sublingual',
      quantity: target?.quantity || '01 Frasco 30ml',
      administrationRoute: target?.administrationRoute || 'Via Sublingual',
      brand: 'Flowermed',
      origin: 'Importado (EUA)',
      type: target?.type || 'Canabinoide Medicinal Flowermed',
      description: target?.description || 'Medicamento importado com Certificado de Análise (COA) lote a lote.',
      usageInstructions: target?.usageInstructions || '• Administrar por via sublingual. Manter sob a língua por 60 segundos antes de deglutir.'
    };
  }

  // Check if product is from Flower & Extractions catalog (Folheto Especial)
  const flowerExtMatch = FLOWER_EXTRACTIONS_PRODUCTS.find(p => 
    p.name.toLowerCase() === nameLower ||
    nameLower.includes(p.name.toLowerCase()) ||
    (nameLower.includes('sour lifter') && p.name.includes('Sour Lifter')) ||
    (nameLower.includes('lemon octane') && p.name.includes('Lemon Octane')) ||
    (nameLower.includes('forbidden fruit') && p.name.includes('Forbidden Fruit')) ||
    (nameLower.includes('gellato') && p.name.includes('Gellato')) ||
    (nameLower.includes('glitter bomb') && p.name.includes('Glitter Bomb')) ||
    (nameLower.includes('astro candy') && p.name.includes('Astro Candy')) ||
    (nameLower.includes('strawpicana') && p.name.includes('Strawpicana')) ||
    (nameLower.includes('superglue') && p.name.includes('Superglue')) ||
    (nameLower.includes('zoap') && p.name.includes('Zoap')) ||
    (nameLower.includes('trop banana') && p.name.includes('Trop Banana')) ||
    (nameLower.includes('girl cookies') && p.name.includes('Girl Cookies')) ||
    (nameLower.includes('syringe gelato') && p.name.includes('Gelato')) ||
    (nameLower.includes('syringe cbd') && p.name.includes('CBD 1ml')) ||
    (nameLower.includes('gold budder') && (p.name.includes('Gold Budder') && (
      (nameLower.includes('thca') && p.name.includes('THCA')) ||
      (!nameLower.includes('thca') && p.name.includes('CBD'))
    )))
  );

  if (flowerExtMatch || (product && (product as any).subLine)) {
    const target = (flowerExtMatch || product) as any;
    return {
      name: target?.name || pName,
      activeIngredients: target?.activeIngredients || 'Fitocanabinoides em Flor / Extração Concentrada',
      concentration: target?.concentration || 'Conforme folheto',
      pharmaceuticalForm: target?.pharmaceuticalForm || (target?.type?.includes('Flor') ? 'Flores in natura secas (14g)' : 'Extrato concentrado resinoso'),
      quantity: target?.quantity || '01 Embalagem (14g / Seringa / Pote)',
      administrationRoute: target?.administrationRoute || 'Via Inalatória (Vaporização medicinal)',
      brand: 'Importado (Folheto Especial)',
      origin: 'Importado',
      type: target?.type || 'Flor / Extração Concentrada',
      description: target?.description || 'Produto importado em embalagem lacrada de 14g ou extrato concentrado.',
      usageInstructions: target?.usageInstructions || '• Administrar por vaporização medicinal com controle rigoroso de temperatura sem combustão.'
    };
  }

  // Check if product is from ABECMED official catalog (Nacional)
  const abecMatch = ABECMED_PRODUCTS.find(p => {
    const pLower = p.name.toLowerCase().trim();
    if (pLower === nameLower || nameLower.includes(pLower) || pLower.includes(nameLower)) return true;
    if (nameLower.includes('abec') || nameLower.includes('abecmed')) {
      if (nameLower.includes('laranja') && p.name.includes('Laranja')) return true;
      if (nameLower.includes('azul') && p.name.includes('Azul')) return true;
      if (nameLower.includes('verde') && p.name.includes('Verde')) return true;
      if (nameLower.includes('vermelho') && p.name.includes('Vermelho')) return true;
      if (nameLower.includes('limão') && p.name.includes('Limão')) return true;
      if (nameLower.includes('lilás') && p.name.includes('Lilás')) return true;
      if ((nameLower.includes('inflorescência') || nameLower.includes('flor')) && p.name.includes('Inflorescências')) return true;
      if (nameLower.includes('extração') && p.name.includes('Extração')) return true;
      if (nameLower.includes('peneirado') && p.name.includes('Peneirado')) return true;
    }
    return false;
  });

  if (abecMatch) {
    return {
      name: abecMatch.name,
      activeIngredients: abecMatch.activeIngredients || 'Fitocanabinoides Integrais Full Spectrum (Extração RSO em MCT)',
      concentration: abecMatch.concentration || 'Concentração padronizada',
      pharmaceuticalForm: abecMatch.pharmaceuticalForm || 'Solução Oleosa Sublingual / Oral (Frasco 30 mL)',
      quantity: abecMatch.quantity || '01 Frasco de 30 mL (2 frascos/mês se uso contínuo)',
      administrationRoute: abecMatch.administrationRoute || 'Via Sublingual / Oral',
      brand: 'ABECMED',
      origin: 'Nacional',
      type: abecMatch.type || 'Óleo Full Spectrum Nacional',
      description: abecMatch.description || 'Produto oficial da associação nacional ABECMED.',
      usageInstructions: abecMatch.usageInstructions || '• Administrar conforme posologia estabelecida pelo médico assistente.'
    };
  }

  // Check if product is from National Association catalog or full cbdGuideData
  let guideMatch = NATIONAL_ASSOCIATION_PRODUCTS.find(p => {
    const pLower = p.name.toLowerCase();
    if (pLower === nameLower || nameLower.includes(pLower) || pLower.includes(nameLower)) return true;
    
    // Check specific national full spectrum formulations
    // 1. Alto CBD 5:1 THC
    if ((nameLower.includes('5:1') || (nameLower.includes('alto cbd') && nameLower.includes('5'))) && p.name.includes('5:1')) {
      if ((nameLower.includes('60') || nameLower.includes('1800')) && p.name.includes('60 mg/mL')) return true;
      if ((nameLower.includes('30') || nameLower.includes('900')) && p.name.includes('30 mg/mL')) return true;
      return true;
    }
    // 2. Alto CBD 10:1 THC
    if ((nameLower.includes('10:1') || (nameLower.includes('alto cbd') && nameLower.includes('10'))) && !nameLower.includes('alto thc') && !nameLower.includes('thc 10:1') && p.name.includes('CBD 10:1 THC')) {
      if ((nameLower.includes('100') || nameLower.includes('3000')) && p.name.includes('100 mg/mL')) return true;
      if ((nameLower.includes('60') || nameLower.includes('1800')) && p.name.includes('60 mg/mL')) return true;
      if ((nameLower.includes('30') || nameLower.includes('900')) && p.name.includes('30 mg/mL')) return true;
      return true;
    }
    // 3. Alto CBD 20:1 THC
    if ((nameLower.includes('20:1') || (nameLower.includes('alto cbd') && nameLower.includes('20'))) && p.name.includes('20:1')) {
      if ((nameLower.includes('100') || nameLower.includes('3000')) && p.name.includes('100 mg/mL')) return true;
      if ((nameLower.includes('60') || nameLower.includes('1800')) && p.name.includes('60 mg/mL')) return true;
      if ((nameLower.includes('30') || nameLower.includes('900')) && p.name.includes('30 mg/mL')) return true;
      return true;
    }
    // 4. CBD + CBN Full Spectrum (2:1 CBN)
    if ((nameLower.includes('cbn') && (nameLower.includes('2:1') || nameLower.includes('cbd + cbn') || nameLower.includes('cbd:cbn'))) && p.name.includes('CBD 2:1 CBN')) {
      if ((nameLower.includes('60') || nameLower.includes('1800')) && p.name.includes('60 mg/mL')) return true;
      if ((nameLower.includes('30') || nameLower.includes('900')) && p.name.includes('30 mg/mL')) return true;
      return true;
    }
    // 5. CBD + CBG Full Spectrum (2:1 CBG)
    if ((nameLower.includes('cbg') && !nameLower.includes('cbn') && (nameLower.includes('2:1') || nameLower.includes('cbd + cbg') || nameLower.includes('cbd:cbg'))) && p.name.includes('CBD 2:1 CBG')) {
      if ((nameLower.includes('60') || nameLower.includes('1800')) && p.name.includes('60 mg/mL')) return true;
      if ((nameLower.includes('30') || nameLower.includes('900')) && p.name.includes('30 mg/mL')) return true;
      return true;
    }
    // 6. CBD + CBG + CBN Full Spectrum (4:1:1)
    if (((nameLower.includes('4 cbd') || nameLower.includes('4:1:1') || (nameLower.includes('cbg') && nameLower.includes('cbn')))) && p.name.includes('4 CBD : 1 CBG : 1 CBN')) {
      if ((nameLower.includes('60') || nameLower.includes('1800')) && p.name.includes('60 mg/mL')) return true;
      if ((nameLower.includes('30') || nameLower.includes('900')) && p.name.includes('30 mg/mL')) return true;
      return true;
    }
    // 7. Equilibrado Full Spectrum (1:1)
    if ((nameLower.includes('equilibrado') || (nameLower.includes('cbd 1:1') || nameLower.includes('1:1 thc'))) && p.name.includes('EQUILIBRADO Full Spectrum')) {
      if ((nameLower.includes('100') || nameLower.includes('3000')) && p.name.includes('100 mg/mL')) return true;
      if ((nameLower.includes('60') || nameLower.includes('1800')) && p.name.includes('60 mg/mL')) return true;
      if ((nameLower.includes('30') || nameLower.includes('900')) && p.name.includes('30 mg/mL')) return true;
      return true;
    }
    // 8. Alto THC Full Spectrum (10:1 CBD)
    if ((nameLower.includes('alto thc') || nameLower.includes('thc 10:1')) && p.name.includes('ALTO THC Full Spectrum')) {
      if ((nameLower.includes('100') || nameLower.includes('3000')) && p.name.includes('100 mg/mL')) return true;
      if ((nameLower.includes('60') || nameLower.includes('1800')) && p.name.includes('60 mg/mL')) return true;
      if ((nameLower.includes('30') || nameLower.includes('900')) && p.name.includes('30 mg/mL')) return true;
      return true;
    }

    // Other specific formulations
    if ((nameLower.includes('1065') || (nameLower.includes('broad') && nameLower.includes('cbn'))) && p.name.includes('1065')) return true;
    if (nameLower.includes('isolado') && (nameLower.includes('100mg') || nameLower.includes('100 mg')) && p.name.includes('100mg/ml')) return true;
    if (nameLower.includes('isolado') && (nameLower.includes('200mg') || nameLower.includes('200 mg')) && p.name.includes('200mg/ml')) return true;
    if (nameLower.includes('balanceado') && nameLower.includes('1:1') && p.name.includes('1:1')) return true;
    if (nameLower.includes('balanceado') && nameLower.includes('2:1') && p.name.includes('2:1')) return true;
    if (nameLower.includes('balanceado') && nameLower.includes('3:1') && p.name.includes('3:1')) return true;
    if (nameLower.includes('balanceado') && nameLower.includes('5:1') && p.name.includes('5:1')) return true;
    if (nameLower.includes('broad spectrum') && nameLower.includes('100 mg') && p.name.includes('100 mg/mL')) return true;
    
    return false;
  });

  if (!guideMatch) {
    for (const cat of cbdGuideData) {
      const found = cat.products?.find(p => {
        const pLower = p.name.toLowerCase().trim();
        return pLower === nameLower || nameLower.includes(pLower) || pLower.includes(nameLower);
      });
      if (found) {
        guideMatch = found;
        break;
      }
    }
  }

  if (guideMatch) {
    const isNat = guideMatch.origin === 'Nacional' || (guideMatch.manufacturer || '').toLowerCase().includes('associação');
    const matchNameLower = (guideMatch.name || '').toLowerCase();
    const matchTypeLower = (guideMatch.type || '').toLowerCase();
    const matchFormLower = (guideMatch.pharmaceuticalForm || '').toLowerCase();

    const isGummy = matchTypeLower.includes('goma') || matchTypeLower.includes('gumm') || matchTypeLower.includes('comestível') ||
                    matchNameLower.includes('goma') || matchNameLower.includes('gumm') || matchFormLower.includes('goma');
    const isFlower = matchTypeLower.includes('flor') || matchNameLower.includes('flor') || matchFormLower.includes('flor');
    const isTopical = matchTypeLower.includes('pomada') || matchNameLower.includes('pomada') || matchTypeLower.includes('tópico') || matchFormLower.includes('pomada');
    const isSyrup = matchTypeLower.includes('syrup') || matchNameLower.includes('syrup') || matchTypeLower.includes('xarope');

    let defaultForm = 'Solução Oleosa Sublingual (Gotas)';
    let defaultQty = guideMatch.name.includes('15ml') ? '01 Frasco de 15 mL' : '01 Frasco de 30 mL';
    let defaultRoute = 'Via Sublingual / Oral';
    let defaultUsage = '• Tomar 03 a 05 gotas por via sublingual de 12/12 horas. Reter sob a língua por 60 segundos antes de engolir.';

    if (isGummy) {
      defaultForm = 'Gomas Mastigáveis Veganas';
      defaultQty = guideMatch.quantity || '01 Pote com 20 a 30 gomas';
      defaultRoute = 'Via Oral';
      defaultUsage = '• Mastigar 01 goma ao final da tarde ou 1 hora antes de dormir por via oral. Mastigar bem antes de engolir.';
    } else if (isFlower) {
      defaultForm = 'Flores Secas In Natura (14g)';
      defaultQty = guideMatch.quantity || '01 Embalagem Selada (14g)';
      defaultRoute = 'Via Inalatória (Vaporização Medicinal)';
      defaultUsage = '• Utilizar em vaporizador térmico medicinal a 170°C-195°C para resgate agudo. Não fumar.';
    } else if (isTopical) {
      defaultForm = 'Pomada Canábica Terapêutica';
      defaultQty = guideMatch.quantity || '01 Pote de 50g';
      defaultRoute = 'Uso Tópico';
      defaultUsage = '• Aplicar quantidade suficiente sobre a área afetada 2 a 3 vezes ao dia, massageando suavemente até completa absorção.';
    } else if (isSyrup) {
      defaultForm = 'Xarope Hidrossolúvel Nano-emulsão';
      defaultQty = guideMatch.quantity || '01 Frasco de 177 mL';
      defaultRoute = 'Via Oral';
      defaultUsage = '• Ingerir 1 a 2 mL diluído em água ou puro sob demanda.';
    }

    return {
      name: guideMatch.name,
      activeIngredients: guideMatch.activeIngredients || (isGummy ? 'Fitocanabinoides Padronizados (Live Rosin / Broad Spectrum)' : 'Extrato Padronizado de Cannabis Sativa'),
      concentration: guideMatch.concentration || (guideMatch.description?.match(/Composição:\s*([^.\n]+)/i)?.[1]?.trim()) || (isGummy ? 'Conforme rotulagem da embalagem' : 'Conforme especificação clínica'),
      pharmaceuticalForm: isGummy ? (guideMatch.pharmaceuticalForm && !/solução oleosa/i.test(guideMatch.pharmaceuticalForm) ? guideMatch.pharmaceuticalForm : defaultForm) : (guideMatch.pharmaceuticalForm || defaultForm),
      quantity: guideMatch.quantity || defaultQty,
      administrationRoute: isGummy ? 'Via Oral' : (guideMatch.administrationRoute || defaultRoute),
      brand: guideMatch.manufacturer || (isNat ? 'Associação Nacional' : 'GreenBudzCBD'),
      origin: guideMatch.origin || (isNat ? 'Nacional' : 'Importado'),
      type: guideMatch.type || (isNat ? 'Óleo Medicinal Nacional' : (isGummy ? 'Goma comestível' : 'Extrato Canabinoide')),
      description: guideMatch.description || (isGummy ? 'Goma comestível com fitocanabinoides sinérgicos.' : 'Medicamento autorizado.'),
      usageInstructions: isGummy 
        ? ((guideMatch.usageInstructions && !/sublingual|gota/i.test(guideMatch.usageInstructions)) ? guideMatch.usageInstructions : defaultUsage)
        : (guideMatch.usageInstructions || defaultUsage)
    };
  }

  const isNational = /Associação|Nacional|ÓLEO INTEGRAL|Óleo Balanceado|CBD ISOLADO|Pomada Canábica|Gomas Terapêuticas|Flores in natura/i.test(pName) || origin === 'Nacional';
  const manufacturer = brand || (isNational ? 'Associação Brasileira' : 'GreenBudzCBD');
  const prodOrigin = origin || (isNational ? 'Nacional' : 'Importado');
  const typeLower = (type || '').toLowerCase();

  // Handling for syrups
  if (typeLower.includes('syrup') || nameLower.includes('syrup') || typeLower.includes('xarope') || nameLower.includes('xarope')) {
    return {
      name: pName,
      activeIngredients: 'Nano Delta-9-THC Hidrossolúvel 500mg',
      concentration: '2,8 mg/mL | Total 500 mg de Δ9-THC Nano',
      pharmaceuticalForm: 'Xarope Hidrossolúvel Nano-emulsão (Syrup)',
      quantity: '01 Frasco 177ml',
      administrationRoute: 'Via Oral (Diluído ou Puro)',
      brand: brand || 'Flowermed',
      origin: prodOrigin,
      description: 'Tecnologia de nano-emulsão hidrossolúvel com absorção transmucosa imediata.',
      usageInstructions: '• Ingerir 1 a 2 mL diluído em água ou puro sob demanda. Efeito rápido em 10 a 20 minutos.'
    };
  }
  
  // Custom parsing for the newly added products to give them correct presentation
  if (typeLower.includes('cápsula') || nameLower.includes('cápsula')) {
    return {
      name: pName,
      activeIngredients: pName.includes('Isolado') ? 'Canabidiol (CBD) Isolado' : (pName.includes('CBG') ? 'Canabidiol (CBD) + Canabigerol (CBG)' : 'Canabidiol (CBD) + Canabinol (CBN)'),
      concentration: 'Conforme rótulo',
      pharmaceuticalForm: 'Cápsulas Gelatinosas (Via Oral)',
      quantity: '01 Frasco',
      administrationRoute: 'Via Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Cápsulas para liberação prolongada ou entérica.',
      usageInstructions: '• Ingerir 1 cápsula via oral conforme orientação médica. Não partir ou mastigar cápsulas gastrorresistentes.'
    };
  }

  if (typeLower.includes('spray') || nameLower.includes('spray')) {
    return {
      name: pName,
      activeIngredients: pName.includes('THC') ? 'Tetrahidrocanabinol (THC) + Canabidiol (CBD)' : 'Canabidiol (CBD) Broad Spectrum',
      concentration: 'Conforme rótulo',
      pharmaceuticalForm: 'Spray Sublingual/Oral',
      quantity: '01 Frasco',
      administrationRoute: 'Via Sublingual ou Mucosa Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Absorção rápida pelas mucosas.',
      usageInstructions: '• Borrifar diretamente sob a língua ou na mucosa oral (parte interna da bochecha). Aguardar 1 minuto antes de engolir.'
    };
  }

  if (typeLower.includes('adesivo') || typeLower.includes('transdérmico') || nameLower.includes('adesivo')) {
    return {
      name: pName,
      activeIngredients: 'Canabidiol (CBD) + Tetrahidrocanabinol (THC) 1:1',
      concentration: '20mg CBD + 20mg THC / adesivo',
      pharmaceuticalForm: 'Adesivo Transdérmico (Patch)',
      quantity: '01 Caixa',
      administrationRoute: 'Via Transdérmica',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Liberação lenta e contínua.',
      usageInstructions: '• Aplicar 1 adesivo em área limpa, seca e sem pelos (ex: ombro, costas, face interna do braço). Trocar a cada 72 horas. Alternar o local de aplicação.'
    };
  }

  if (typeLower.includes('supositório') || nameLower.includes('supositório')) {
    return {
      name: pName,
      activeIngredients: 'Canabidiol (CBD) + Tetrahidrocanabinol (THC)',
      concentration: '50mg CBD + 10mg THC / unidade',
      pharmaceuticalForm: 'Supositório Pélvico/Vaginal',
      quantity: '01 Caixa',
      administrationRoute: 'Via Intravaginal / Retal',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Ação localizada no plexo pélvico.',
      usageInstructions: '• Inserir 1 unidade via intravaginal ou retal em momentos de crise aguda (cólicas fortes). Recomenda-se deitar por 15-20 minutos após a inserção.'
    };
  }

  if (typeLower.includes('tópica') || typeLower.includes('creme') || typeLower.includes('pomada') || nameLower.includes('creme') || nameLower.includes('pomada')) {
    return {
      name: pName,
      activeIngredients: pName.includes('CBG') ? 'Canabidiol (CBD) + Canabigerol (CBG)' : 'Fitocanabinoides (CBD predominante)',
      concentration: 'Conforme rótulo',
      pharmaceuticalForm: 'Creme / Pomada Tópica',
      quantity: '01 Bisnaga/Pote',
      administrationRoute: 'Via Tópica (Uso Externo)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Ação local em receptores cutâneos e articulares.',
      usageInstructions: '• Aplicar fina camada sobre a área afetada 2 a 3 vezes ao dia, massageando suavemente até completa absorção. Não aplicar em feridas abertas profundas.'
    };
  }

  if (typeLower.includes('flor') || typeLower.includes('in natura') || nameLower.includes('flor')) {
    return {
      name: pName,
      activeIngredients: 'Canabidiol (CBD) e Fitocanabinoides (In Natura)',
      concentration: '~15% CBD (Variável por safra)',
      pharmaceuticalForm: 'Flor Seca de Cânhamo (In Natura)',
      quantity: '01 Embalagem',
      administrationRoute: 'Via Inalatória (Vaporização)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Rápida biodisponibilidade para resgate.',
      usageInstructions: '• Utilizar em vaporizador de ervas secas em temperatura de 170°C a 195°C para extração de terpenos e CBD sem combustão. Utilizar em crises agudas.'
    };
  }
  
  if (typeLower.includes('goma') || typeLower.includes('comestível') || nameLower.includes('goma') || nameLower.includes('gummies')) {
    return {
      name: pName,
      activeIngredients: nameLower.includes('thc') ? 'Fitocanabinoides Padronizados: Canabidiol (CBD) + Delta-9-THC' : 'Canabidiol (CBD) Broad Spectrum (0% THC)',
      concentration: '10mg a 20mg por goma (Verificar rótulo)',
      pharmaceuticalForm: 'Gomas Mastigáveis Veganas',
      quantity: '01 Pote com 20 a 30 gomas',
      administrationRoute: 'Via Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Sinergia terapêutica e fácil administração.',
      usageInstructions: '• Mastigar 1/2 a 1 goma mastigável ao final da tarde ou 1 hora antes de dormir por via oral. Mastigar bem antes de engolir. Ação prolongada de 4 a 6 horas. Não engolir inteira.'
    };
  }
  
  if (typeLower.includes('concentrado') || typeLower.includes('extrato pastoso') || nameLower.includes('rick simpson') || nameLower.includes('rso')) {
     return {
      name: pName,
      activeIngredients: 'Fitocanabinoides Altamente Concentrados (CBD ou THC predominante)',
      concentration: 'Alta Potência (Aprox. 700mg a 800mg por grama)',
      pharmaceuticalForm: 'Extrato Concentrado Sólido/Pastoso',
      quantity: '01 Seringa ou Pote (1g a 10g)',
      administrationRoute: 'Via Sublingual ou Vaporização',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Extrato potente para quadros severos e refratários.',
      usageInstructions: '• Dose inicial do tamanho de um "grão de arroz" via sublingual ou diluído. Altamente potente, titular com extrema cautela.'
    };
  }

  // DEFAULT (ÓLEOS)
  const dropsPerMl = 'Aproximadamente 25 gotas por mL';
  const dropsNote = 'Aproximadamente 25 gotas por mL.';

  return {
    name: pName,
    activeIngredients: isNational 
      ? 'Extrato Integral de Cannabis Sativa Rico em Canabidiol (CBD)' 
      : 'Canabidiol (CBD) Full Spectrum / Broad Spectrum',
    concentration: 'Variável (Verificar concentração no rótulo)',
    pharmaceuticalForm: `Solução Oleosa Sublingual (Gotas • ${dropsPerMl})`,
    quantity: '01 Frasco de 30ml',
    administrationRoute: 'Via Sublingual',
    brand: manufacturer,
    origin: prodOrigin,
    description: 'Modulação terapêutica do Sistema Endocanabinoide.',
    usageInstructions: `• Pingar as gotas recomendadas sob a língua e aguardar 1 a 2 minutos antes de engolir.\n• Posologia e Modo de Uso: ${dropsNote}`
  };
}



export interface TitrationProtocol {
  start: string;
  titration: string;
  range: string;
  thc?: string;
  note?: string;
}

export interface ClinicalDetails {
  mechanism: string;
  strategy: string;
  eligiblePatientProfile: string[];
  titrationProtocol: TitrationProtocol;
  precautions: string[];
  monitoring: string[];
  expectedOutcomes: string[];
  evidences: string[];
}

export function getDiseaseClinicalDetails(diseaseName: string): ClinicalDetails {
  const name = diseaseName.toLowerCase();
  
  if (name.includes('autismo') || name.includes('tea') || name.includes('agressividade')) {
    return {
      mechanism: "Evidências pré-clínicas apontam sinalização endocanabinoide (anandamida) reduzida em modelos de TEA, com desequilíbrio na excitabilidade sináptica glutamato/GABA. O CBD modula receptores CB1/CB2, TRPV1 e 5-HT1A, favorecendo a regulação sensorial e a inibição neuronal.",
      strategy: "Primeira linha: CBD isolado ou broad-spectrum (sem THC), voltado à regulação sensorial e à irritabilidade. Microdoses de THC (proporções CBD:THC de 20:1 a 33:1) são reservadas a casos refratários de agressividade e automutilação severas, sempre sob supervisão próxima.",
      eligiblePatientProfile: [
        "Diagnóstico confirmado de TEA (DSM-5-TR / CID-11), qualquer nível de suporte;",
        "Irritabilidade, agressividade ou autoagressão refratárias a antipsicóticos (risperidona, aripiprazol) ou com efeitos colaterais limitantes;",
        "Comorbidade com epilepsia — indicação historicamente mais robusta, dado o efeito antiepiléptico já estabelecido do CBD;",
        "Distúrbios de sono e ansiedade associados ao quadro."
      ],
      titrationProtocol: {
        start: "2–5 mg/kg/dia, dividido em 2 tomadas",
        titration: "Incrementos de 2–5 mg/kg/dia, a cada 7 dias, conforme resposta e tolerância",
        range: "10–20 mg/kg/dia (Parrella et al. 2026; Trauner et al. 2025)",
        thc: "Proporção CBD:THC de 20:1 a 33:1, somente em refratariedade grave",
        note: "Faixas derivadas de protocolos de estudo publicados — não substituem a titulação individualizada pelo médico assistente conforme peso, resposta clínica e tolerabilidade do paciente."
      },
      precautions: [
        "Clobazam: CBD inibe CYP2C19/3A4, elevando o metabólito ativo N-desmetilclobazam — risco de sedação, exige ajuste de dose;",
        "Valproato: associação com elevação de transaminases hepáticas — monitorar função hepática;",
        "Indutores enzimáticos (fenitoína, carbamazepina, oxcarbazepina): podem reduzir os níveis séricos de CBD;",
        "Evitar formulações com THC predominante — risco de agitação paradoxal, ansiedade ou sintomas psicóticos em cérebro em desenvolvimento;",
        "Efeitos adversos mais comuns: sonolência, diarreia, alteração de apetite."
      ],
      monitoring: [
        "Enzimas hepáticas (TGO/TGP) na linha de base e periodicamente, sobretudo se em uso de valproato;",
        "Escalas validadas: subescala de irritabilidade da ABC (Aberrant Behavior Checklist), SRS-2, CGI-I, diário de sono;",
        "Reavaliação clínica estruturada em 4, 8 e 12 semanas de tratamento;",
        "Peso, apetite e efeitos gastrointestinais a cada consulta."
      ],
      expectedOutcomes: [
        "Estudos observacionais israelenses (Aran et al.; Bar-Lev Schleider et al.) relatam melhora percebida por cuidadores em irritabilidade, sono, contato visual e participação em terapias ocupacionais em cerca de 60–80% dos casos.",
        "Ensaios randomizados mais recentes (Trauner et al. 2025; Parrella et al. 2026) mostram segurança e boa tolerabilidade, mas diferença não significativa frente a placebo nas escalas padronizadas primárias — os déficits centrais de comunicação social respondem de forma menos consistente do que sintomas associados (irritabilidade, sono, ansiedade)."
      ],
      evidences: [
        "Aran A, Cassuto H, Lubotzky A et al. J Autism Dev Disord, 2019 — coorte observacional, CBD:THC ~20:1;",
        "Bar-Lev Schleider L et al. Sci Rep, 2019 — experiência real de 188 pacientes em Israel;",
        "Trauner D, Umlauf A, Grelotti DJ et al. J Autism Dev Disord, 2025 — ECR duplo-cego com CBD purificado (Epidiolex), até 20 mg/kg/dia;",
        "Parrella et al. Autism Research, 2026 — ECR crossover, CBD com terpenos, 10 mg/kg/dia;",
        "Mazza JAS et al. Pharmaceuticals, 2024 — coorte observacional, extrato CBD:THC 33:1;",
        "Aran A, Cayam-Rand D. Expert Opin Emerg Drugs, 2024 — revisão sobre canabinoides no TEA."
      ]
    };
  }
  
  if (name.includes('ansiedade') || name.includes('burnout')) {
    return {
      mechanism: "Modulação dos receptores 5-HT1A (serotonina) e facilitação da neurotransmissão GABAérgica. O CBD atua inibindo a enzima FAAH, aumentando os níveis endógenos de Anandamida, promovendo estabilização da amígdala e resposta ao estresse crônico.",
      strategy: "Em quadros ansiosos, doses bifásicas são comuns. Doses baixas tendem a ser estimulantes e focadas em cognição, enquanto doses médias/altas promovem ansiólise. Evitar THC puro ou em altas doses sem balanceamento com CBD.",
      eligiblePatientProfile: [
        "Transtorno de Ansiedade Generalizada (TAG) refratário a ISRS ou com efeitos adversos limitantes;",
        "Síndrome de Burnout com esgotamento neuroendócrino;",
        "Ansiedade social limitante;",
        "Pacientes em uso crônico de benzodiazepínicos buscando desmame assistido."
      ],
      titrationProtocol: {
        start: "CBD: 10 a 15 mg/dia, preferencialmente pela manhã ou dividido em 2 tomadas.",
        titration: "Incrementos de 5-10 mg a cada 5 dias, até remissão dos sintomas ansiosos.",
        range: "25–75 mg/dia para ansiedade leve a moderada. Até 300mg em fobias sociais agudas (dose de resgate).",
        thc: "Apenas formulações Full Spectrum (traços de THC <0.3%) ou concentrações mínimas se houver insônia severa associada.",
        note: "Doses excessivamente altas de CBD podem gerar sedação diurna. O objetivo é a dose mínima efetiva."
      },
      precautions: [
        "Interação com ISRS (Sertralina, Fluoxetina, Escitalopram): o CBD pode elevar níveis séricos destes fármacos (CYP2D6, CYP2C19).",
        "Monitorar sedação excessiva se coadministrado com benzodiazepínicos.",
        "THC isolado ou em altas proporções pode induzir taquicardia ou ataques de pânico (efeito bifásico invertido)."
      ],
      monitoring: [
        "Escala HAM-A (Hamilton Anxiety Rating Scale) na linha de base e a cada 4 semanas;",
        "Acompanhamento da qualidade do sono associada ao estresse;",
        "Avaliação de variabilidade da frequência cardíaca (HRV) se disponível."
      ],
      expectedOutcomes: [
        "Redução de pensamentos intrusivos e ruminações.",
        "Relaxamento muscular global sem perda de acuidade mental.",
        "Regulação do ciclo de cortisol diurno, diminuindo a sensação de 'luta ou fuga' basal."
      ],
      evidences: [
        "Bergamaschi et al. Neuropsychopharmacology, 2011 — CBD reduz ansiedade simulada em falar em público;",
        "Shannon S et al. Perm J, 2019 — Série de casos clínicos: 79% dos pacientes reportaram diminuição de ansiedade no primeiro mês;",
        "Blessing EM et al. Neurotherapeutics, 2015 — Revisão apontando CBD como potencial tratamento para múltiplos transtornos de ansiedade."
      ]
    };
  }

  // Generic fallback for others
  return {
      mechanism: "A interação ocorre primordialmente através da modulação do tônus endocanabinoide basal (AEA e 2-AG). O CBD atua como modulador alostérico negativo do CB1 e agonista de múltiplos receptores periféricos (5-HT1A, TRPV1), enquanto o THC atua como agonista parcial CB1/CB2, restaurando a homeostase do sistema nervoso e imunológico.",
      strategy: "Priorizar o Efeito Entourage utilizando extratos Full ou Broad Spectrum. A introdução deve seguir estritamente o princípio 'Start Low, Go Slow' (iniciar com doses mínimas e titular lentamente) para mitigar efeitos adversos bifásicos e evitar a saturação de receptores.",
      eligiblePatientProfile: [
        "Diagnóstico clínico estabelecido refratário ou intolerante às terapias convencionais de primeira linha;",
        "Pacientes em polifarmácia buscando redução de danos (efeito poupador de opioides, benzodiazepínicos ou AINEs);",
        "Ausência de histórico pessoal de esquizofrenia ou psicoses induzidas por substâncias (especialmente para uso de THC);",
        "Pacientes com função hepática e renal estáveis."
      ],
      titrationProtocol: {
        start: "CBD: 2,5 a 5 mg/dose | THC (se aplicável): 1 a 2,5 mg/dose",
        titration: "Aumentos graduais a cada 3-7 dias, monitorando a janela terapêutica.",
        range: "Variável. Doses médias de CBD: 20-50 mg/dia. Doses altas: >100 mg/dia.",
        thc: "Apenas se refratário ou quadro de dor/espasticidade severa. Proporção ajustada individualmente.",
        note: "O sistema endocanabinoide possui alta variabilidade interindividual. O protocolo de titulação exige acompanhamento de perto e diário de sintomas pelo paciente."
      },
      precautions: [
        "Interações medicamentosas mediadas pelo Citocromo P450 (CYP3A4, CYP2C19, CYP2C9).",
        "Risco de hipotensão ortostática e taquicardia transitória no início do tratamento com THC.",
        "Cuidado em pacientes idosos devido ao risco aumentado de quedas secundárias à sedação.",
        "Efeitos adversos gastrointestinais dependentes da base oleosa (TCM ou azeite) e sonolência diurna."
      ],
      monitoring: [
        "Acompanhamento quinzenal no primeiro mês para ajuste fino de dose;",
        "Avaliação de função hepática (TGO, TGP, GGT) semestral ou se sintomas sugerirem hepatotoxicidade;",
        "Uso de escalas analógicas visuais (VAS) e questionários de qualidade de vida (QoL);",
        "Ajuste da via de administração conforme a resposta (óleo para base, vaporização para resgate)."
      ],
      expectedOutcomes: [
        "Atenuação de picos sintomáticos (inflamatórios, álgicos ou psiquiátricos).",
        "Melhora na qualidade de vida subjetiva, restauração do padrão de sono e aumento de funcionalidade diária.",
        "Possibilidade de desmame gradual de medicações alopáticas concomitantes após estabilização clínica (2 a 3 meses de tratamento contínuo)."
      ],
      evidences: [
        "Evidências substanciais da NASEM (National Academies of Sciences, Engineering, and Medicine) para dor crônica, espasticidade e náuseas.",
        "Estudos clínicos de fase II e III demonstram eficácia superior ao placebo em quadros refratários específicos.",
        "Ampla literatura observacional atestando perfil de segurança favorável quando acompanhado por equipe médica."
      ]
  };
}

export function enrichMedicationDetails(
  productName: string, 
  brand?: string, 
  origin?: string, 
  type?: string,
  product?: CBDProduct
): EnrichedMedicationInfo {
  const result = _enrichMedicationDetails(productName, brand, origin, type, product);
  
  if (product) {
    if (product.usageInstructions) result.usageInstructions = product.usageInstructions;
    if (product.activeIngredients) result.activeIngredients = product.activeIngredients;
    if (product.concentration) result.concentration = product.concentration;
    if (product.pharmaceuticalForm) result.pharmaceuticalForm = product.pharmaceuticalForm;
    if (product.quantity) result.quantity = product.quantity;
    if (product.administrationRoute) result.administrationRoute = product.administrationRoute;
  }
  
  return result;
}

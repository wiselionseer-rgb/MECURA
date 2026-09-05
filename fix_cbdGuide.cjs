const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const prefix = `export interface CBDProduct {
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
  priceUSD?: number;
  priceBRL?: number;
  indications?: string;
}

export interface CBDCategory {
  id: string;
  title: string;
  description: string;
  dosageGuidance: string;
  products: CBDProduct[];
}

export const cbdGuideData: CBDCategory[] = [
  {
    id: "ansiedade",
    title: "1. ANSIEDADE, ESTRESSE E TRANSTORNOS MENTAIS",
    description: "Produtos com perfil ansiolítico, calmante e regulador do humor. Indicados para ansiedade generalizada, estresse crônico e melhora do humor.",
    dosageGuidance: "Iniciar com doses baixas (ex: 10-15 mg/dia de CBD ou 1/2 goma). Aumentar gradualmente conforme a resposta do paciente.",
    products: [
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
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "3mg THC∆9, 3mg CBC, 3mg CBD, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: "Combina a pureza de um extrato Live Rosin livre de solventes com a sinergia dos canabinoides CBD, THC, CBC e CBG. Sabor natural de framboesa."
      },
      {
        name: "Drops By GreenBudz Goma River Float THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Caryophyllene"],
        description: "Extrato Live Rosin com sabor natural de melancia. Promove leveza física, relaxamento, alívio de tensões e equilíbrio sistêmico."
      }
    ]
  },
  {
    id: "dor_cronica",
    title: "2. DOR CRÔNICA E INFLAMAÇÃO",
    description: "Formulações focadas em analgesia, redução de resposta inflamatória e relaxamento muscular.",
    dosageGuidance: "Dose inicial moderada. Aumentar conforme dor referida e tolerabilidade. Uso 2 a 3 vezes ao dia.",
    products: [
      {
        name: "GreenBudz Chill Vibe Gummies - THC 1:1 CBD",
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
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 4mg CBD por goma", "Sabor framboesa", "Efeito longo 4 a 6 horas"],
        description: "Combina a pureza de um extrato Live Rosin com sinergia do THC e CBD para relaxamento, equilíbrio sistêmico e regulação funcional."
      },
      {
        name: "Drops By GreenBudz Goma Crickets CBD e THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 10mg CBD por goma", "Sabor amora", "Efeito longo 4 a 6 horas"],
        description: "Apresentado em gomas veganas sabor amora, formulação desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional."
      },
      {
        name: "Drops By GreenBudz Goma 100 Sheep THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Limonene e Caryophyllene"],
        description: "Live Rosin sabor cereja para relaxamento profundo, alívio de tensões e regulação do repouso."
      }
    ]
  },
  {
    id: "insonia",
    title: "3. INSÔNIA E DISTÚRBIOS DO SONO",
    description: "Produtos com CBN, THC e terpenos sedativos, indicados para indução e manutenção do sono.",
    dosageGuidance: "Administrar dose 30 a 60 minutos antes de deitar.",
    products: [
      {
        name: "Drops By GreenBudz Goma Nightshade CBD CBN e THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 5mg CBD, 5mg CBN por goma", "Efeito longo 4 a 6 horas"],
        description: "Live Rosin com CBD, CBN e THC. Sabor natural de framboesa escura para promover relaxamento profundo, regulação do repouso noturno."
      }
    ]
  },
  {
    id: "energia_foco",
    title: "4. ENERGIA, FOCO E METABOLISMO",
    description: "Canabinoides como THCV, CBG e terpenos estimulantes (ex: limoneno) para foco, disposição e controle metabólico.",
    dosageGuidance: "Uso diurno. Evitar após as 16h para não interferir no sono.",
    products: [
      {
        name: "GreenBudz Super Vibe Oil 3000mg • 100 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/f59e0b/ffffff?text=Super+Vibe",
        details: ["Frasco 30ml", "aprox. 2,5 mg/gota", "2,5% Terpenos Limoneno, Pineno, Terpinoleno e Caryophylleno"],
        description: "Blend exclusivo de terpenos de perfil Sativa. Favorece a biodisponibilidade para suporte da disposição, do foco e do equilíbrio ao longo do dia."
      },
      {
        name: "GreenBudz Slim Vibe Oil 1500 mg CBD + 1500 mg THCv (50 mg/ml CBD + 50 mg/ml THCv)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum + THCv",
        priceUSD: 120.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Slim+Vibe",
        details: ["Frasco 30ml", "aprox. 1,75 mg CBD + 1,75mg THCv/gota", "THCv não possui efeito psicoativo", "Sabor hortelã"],
        description: "Desenvolvido para promover equilíbrio metabólico e bem-estar. Base de óleo MCT e sabor natural de hortelã."
      },
      {
        name: "Drops By GreenBudz Goma Rodeo Queen THCV CBG e THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THCV, 3mg THC∆9, 3mg CBG por goma", "Sabor morango"],
        description: "Live Rosin com THCV, CBG e THC. Promove foco, vitalidade, regulação metabólica e equilíbrio sistêmico."
      },
      {
        name: "Drops By GreenBudz Goma Formula One THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Pinene e Limonene"],
        description: "Live Rosin sabor lima, formulado para promover conforto físico, disposição e equilíbrio sistêmico."
      },
      {
        name: "Drops By GreenBudz Goma Evergreen THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Limonene, Humulene e Caryophyllene"],
        description: "Live Rosin sabor limão para conforto físico, vitalidade e equilíbrio sistêmico."
      }
    ]
  },
  {
    id: "concentrados",
    title: "5. CONCENTRADOS E EXTRATOS DE ALTA POTÊNCIA",
    description: "Via inalatória por vaporizador dosimetrado (180-210°C). Sem combustão. Tmax em 2 a 10 min. Ideal para dor aguda, crises convulsivas ou condições severas refratárias.",
    dosageGuidance: "Dose de 0.5g em vaporizador de ervas secas/extratos com temperatura controlada.",
    products: [
      {
        name: "GreenBudz Stirred Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Stirred)",
        priceUSD: 109.00,
        details: ["THCa 350mg, CBD 85mg, CBG 2.5mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura pastosa", "Temp: 180-210C"],
        description: "Extrato obtido por mistura com terpenos. Strains: LC (Mirceno, Cariofileno, Limoneno - Relaxante), TW (Terpinoleno, Mirceno, Pineno - Estimulante), ICC (Mirceno, Limoneno, Cariofileno - Anti-inflamatório), AH (Cariofileno, Limoneno, Linalol - Analgésico). $109 (10 Doses) / $350 (40 Doses)."
      },
      {
        name: "GreenBudz Granulated Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Granulated)",
        priceUSD: 109.00,
        details: ["THCa 400mg, CBD 17mg, CBC 48mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura granulada", "Temp: 180-210C"],
        description: "Mistura com terpenos. Strains: CD (Relaxante, Analgésico), TW (Estimulante, Focado), BM (Relaxante, Sedativo). $109 (10 Doses) / $350 (40 Doses)."
      },
      {
        name: "GreenBudz Crystalized Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Crystalized)",
        priceUSD: 109.00,
        details: ["THCa 465mg, CBD 17mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Cristais em sauce", "Temp: 180-210C"],
        description: "Cristais isolados de THCa banhados em sauce de terpenos. Strain: ICC (Mirceno, Limoneno, Cariofileno - Relaxante, revigorante, anti-inflamatório). $109 (10 Doses) / $350 (40 Doses)."
      },
      {
        name: "GreenBudz Dried Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Dried Ice)",
        priceUSD: 75.00,
        details: ["THCa 100mg por dose, Full Spectrum", "Dose 0.5g", ">0,3% THC∆9", "Textura pulverulenta", "Temp: 180-210C"],
        description: "Extração mecânica a seco com gelo seco. Strains: DS (Relaxante, revigorante), PR (Estimulante, focado), BM (Relaxante, sedativo). $75 (10 Doses) / $260 (40 Doses)."
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
        name: "GreenBudz Isolate CBD Hemp Formula",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Isolado de CBD",
        priceUSD: 89.00,
        details: ["CBD 465mg por dose", "0% THC∆9", "Dose 0.5g", "Sem Terpenos", "Temp: 160-190C"],
        description: "Cristais de CBD isolado de alta pureza. $89 (10 Doses) / $299 (40 Doses)."
      }
    ]
  },
  {
    id: "bem_estar",
    title: "6. BEM-ESTAR GERAL E MANUTENÇÃO",
    description: "Opções para uso diário visando manutenção do Sistema Endocanabinoide.",
    dosageGuidance: "Uso contínuo, baixas dosagens.",
    products: [
      {
        name: "Drops By GreenBudz Goma Beethoven THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Limonene"],
        description: "Live Rosin sabor laranja para conforto físico, alívio e equilíbrio sistêmico."
      }
    ]
  },
  {
    id: "associacoes-nacionais",
    title: "7. ASSOCIAÇÕES BRASILEIRAS (PRODUTOS NACIONAIS)",
    description: "Opções acessíveis e de alta qualidade produzidas por associações brasileiras de pacientes, amparadas por decisões judiciais e habeas corpus.",
    dosageGuidance: "A posologia varia conforme a concentração do produto e a prescrição médica. Acesso via receita médica e cadastro na associação.",
    products: [
      {
        name: "Óleo Integral THC/CBD 100mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30ml", "100mg/ml de Canabinoides Totais", "Relação THC/CBD balanceada", "Produto Nacional"],
        description: "Óleo de amplo espectro produzido por associação nacional. Eficaz para dores crônicas, espasticidade e distúrbios do sono refratários. Custo mais acessível."
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
      },
      {
        name: "Gomas Terapêuticas CBD/CBN 25mg - 30 unidades",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Gomas (Comestível)",
        details: ["Pote com 30 unidades", "25mg CBD/CBN por goma", "Sabor Frutas"],
        description: "Gomas terapêuticas para facilidade de ingestão e liberação prolongada, indicadas para indução e manutenção do sono reparador."
      },
      {
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 50 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: "Óleo de Cannabis sativa Full Spectrum indicado para modulação do sistema endocanabinoide."
      },
      {
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 100 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: "Óleo de Cannabis sativa Full Spectrum em alta concentração, indicado para casos que exigem maior aporte de fitocanabinoides."
      },
      {
        name: "Broad Spectrum Balanceado (50 mg/mL — 5%)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 50 mg/mL (5%)", "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Balanceado. Posologia Sugerida: Semana 1: Administrar 0,2 mL (4 gotas) a cada 12 horas. Semana 2: Aumentar para 0,4 mL (8 gotas) a cada 12 horas. Manutenção: Ajustar 0,1 mL (2 gotas) por dose a cada 7 dias conforme resposta clínica."
      },
      {
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Alta Concentração. Posologia Sugerida: Dias 1 a 5: Administrar 0,1 mL (2 gotas) a cada 12 horas. Dias 6 a 10: Administrar 0,2 mL (4 gotas) a cada 12 horas. Dias 11 a 15: Administrar 0,3 mL (6 gotas) a cada 12 horas."
      },
      {
        name: "Broad Spectrum com Razão Enriquecida (CBD + CBN para Sono)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 60 mg/mL (6%)", "CBD 50 mg/mL, CBN 10 mg/mL, THC 0,0%", "Veículo com terpenos relaxantes (Mirceno/Linalol)", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Sono. Posologia Sugerida: Semana 1: Administrar 0,25 mL (5 gotas) via sublingual, 30 a 45 min antes de deitar. Semana 2: Se persistir latência aumentada, progredir para 0,5 mL (10 gotas) antes de deitar."
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
}

export function enrichMedicationDetails(
  productName: string, 
  brand?: string, 
  origin?: string, 
  type?: string
): EnrichedMedicationInfo {
  const pName = productName || '';
  const isNational = /Associação|Nacional|ÓLEO INTEGRAL|Pomada Canábica|Gomas Terapêuticas|Flores in natura/i.test(pName) || origin === 'Nacional';
  const manufacturer = brand || (isNational ? 'Associação Brasileira' : 'GreenBudzCBD');
  const prodOrigin = origin || (isNational ? 'Nacional' : 'Importado');

  // 1. Pomadas
  if (/Pomada|Tópico|Cream|Balm/i.test(pName)) {
    return {
      name: pName,
      activeIngredients: 'Extrato Canábico Rico em Fitocanabinoides (CBD + CBG) 500mg com Terpenos Anti-inflamatórios',
      concentration: '10mg/g (500mg de Canabinoides Totais)',
      pharmaceuticalForm: 'Pomada Terapêutica de Uso Tópico',
      quantity: '01 Pote com 50g',
      administrationRoute: 'Uso Tópico / Dérmico',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Pomada fitocanabinoide de uso tópico para alívio localizado de dores musculares, articulares e processos inflamatórios.'
    };
  }

  // 2. Flores in natura
  if (/Flores|Flor|In natura/i.test(pName)) {
    const isTHC = /THC/i.test(pName);
    return {
      name: pName,
      activeIngredients: isTHC 
        ? 'Inflorescências Secas de Cannabis sativa L. com Alto Teor de Delta-9-THC (15% a 20%) e Terpenos Mirceno/Beta-Cariofileno'
        : 'Inflorescências Secas de Cannabis sativa L. com Alto Teor de Canabidiol (CBD 10% a 15%) e Delta-9-THC < 0,3%',
      concentration: isTHC ? 'THC ~18% | CBD < 1%' : 'CBD ~14% | THC < 0,3%',
      pharmaceuticalForm: 'Inflorescências Secas Padronizadas para Vaporização Medicinal',
      quantity: '01 Embalagem hermética de 15g',
      administrationRoute: 'Via Inalatória (Vaporização Medicinal - Não Comburente)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Inalação vaporizada para rápida absorção e efeito analgésico ou ansiolítico imediato em momentos de crise.'
    };
  }

  // 3. Gomas
  if (/Goma|Gummies|Gummy|Drops/i.test(pName)) {
    const hasCBN = /CBN/i.test(pName);
    const hasTHC = /THC/i.test(pName) && !/CBN/i.test(pName);
    return {
      name: pName,
      activeIngredients: hasCBN
        ? 'Fitocanabinoides Padronizados: Canabidiol (CBD 10mg) + Canabinol (CBN 2.5mg) + Delta-9-THC (1mg)'
        : (hasTHC ? 'Fitocanabinoides Padronizados: Canabidiol (CBD 10mg) + Delta-9-THC (10mg)' : 'Canabidiol (CBD Isolado / Broad Spectrum 25mg)'),
      concentration: '25mg de Fitocanabinoides por unidade',
      pharmaceuticalForm: 'Gomas Mastigáveis (Forma Farmacêutica Comestível)',
      quantity: '01 Frasco com 20 a 30 unidades mastigáveis',
      administrationRoute: 'Via Oral (Mastigável)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Gomas mastigáveis com liberação gradual e prolongada para relaxamento sustentado e sono reparador.'
    };
  }

  // 5. Concentrados e Extrações (Vaporização)
  if (/Stirred|Granulated|Crystalized|Dried Hemp|Isolate/i.test(pName)) {
    const isIsolate = /Isolate/i.test(pName);
    const isTHCa = /THCa/i.test(pName);
    return {
      name: pName,
      activeIngredients: isIsolate 
        ? (isTHCa ? 'Cristais Isolados de THCa (Tetrahidrocanabinol Ácido) de Alta Pureza' : 'Cristais Isolados de Canabidiol (CBD) de Alta Pureza')
        : 'Extrato Concentrado de Cannabis Rico em Canabinoides e Terpenos',
      concentration: isTHCa ? 'Alto Teor de THCa (>350mg/dose)' : 'Alto Teor de CBD',
      pharmaceuticalForm: 'Extrato Concentrado para Vaporização',
      quantity: '01 Embalagem (5g a 20g)',
      administrationRoute: 'Via Inalatória (Vaporizador Dosimetrado, 160°C - 210°C)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Absorção pulmonar rápida sem combustão, oferecendo pico plasmático em minutos para resposta terapêutica ágil.'
    };
  }

  // 4. Óleos e Extratos
  if (/THC\/CBD|1:1|Balanceado/i.test(pName)) {
    return {
      name: pName,
      activeIngredients: 'Extrato Integral de Cannabis Full Spectrum com Proporção Balanceada THC:CBD (1:1) 50mg/ml THC + 50mg/ml CBD',
      concentration: '100mg/ml (50mg/ml THC + 50mg/ml CBD) - 3000mg totais',
      pharmaceuticalForm: 'Solução Oleosa Sublingual com Conta-gotas',
      quantity: '01 Frasco de 30ml',
      administrationRoute: 'Via Sublingual / Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Extrato balanceado 1:1 indicado para analgesia potente, dores neuropáticas, rigidez e espasticidade.'
    };
  }

  if (/PREDOMINANTE THC|Rico em THC|High THC/i.test(pName)) {
    return {
      name: pName,
      activeIngredients: 'Extrato Integral de Cannabis com Predominância de Tetrahidrocanabinol (Delta-9-THC 100mg/ml) + Canabinoides Menores',
      concentration: '100mg/ml Delta-9-THC (3000mg totais)',
      pharmaceuticalForm: 'Solução Oleosa Sublingual com Conta-gotas',
      quantity: '01 Frasco de 30ml',
      administrationRoute: 'Via Sublingual / Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Extrato predominante em THC para analgesia em dores intratáveis, insônia refratária e relaxamento neuromuscular.'
    };
  }

  if (/CBG/i.test(pName)) {
    return {
      name: pName,
      activeIngredients: 'Extrato de Canabigerol (CBG) + Canabidiol (CBD) Full Spectrum com Terpenos Energizantes',
      concentration: '50mg/ml a 80mg/ml de Canabinoides Totais (Frasco 30ml)',
      pharmaceuticalForm: 'Solução Oleosa Sublingual com Conta-gotas',
      quantity: '01 Frasco de 30ml',
      administrationRoute: 'Via Sublingual / Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Formulação rica em CBG para clareza mental, foco, suporte anti-inflamatório sistêmico e imunológico.'
    };
  }

  if (/6000/i.test(pName)) {
    return {
      name: pName,
      activeIngredients: 'Canabidiol (CBD) Full Spectrum 200mg/ml (6000mg totais) + Terpenos Naturais + Delta-9-THC < 0,2%',
      concentration: '200mg/ml (6000mg CBD por frasco de 30ml - Aprox. 5mg/gota)',
      pharmaceuticalForm: 'Solução Oleosa Sublingual com Conta-gotas',
      quantity: '01 Frasco de 30ml',
      administrationRoute: 'Via Sublingual / Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Canabidiol de altíssima concentração para quadros de ansiedade severa, dores refratárias e regulação do humor.'
    };
  }

  if (/3000/i.test(pName)) {
    return {
      name: pName,
      activeIngredients: 'Canabidiol (CBD) Full Spectrum 100mg/ml (3000mg totais) + Blend Terpênico Mirceno/Linalol + Delta-9-THC < 0,2%',
      concentration: '100mg/ml (3000mg CBD por frasco de 30ml - Aprox. 2,5mg/gota)',
      pharmaceuticalForm: 'Solução Oleosa Sublingual com Conta-gotas',
      quantity: '01 Frasco de 30ml',
      administrationRoute: 'Via Sublingual / Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Extrato Full Spectrum enriquecido com terpenos calmantes para relaxamento, inflamação e alívio da dor.'
    };
  }

  // Padrão Geral
  return {
    name: pName,
    activeIngredients: isNational 
      ? 'Extrato Integral de Cannabis Sativa Rico em Canabidiol (CBD) e Fitocanabinoides' 
      : 'Canabidiol (CBD) Full Spectrum com Terpenos Naturais (Delta-9-THC < 0,2%)',
    concentration: 'Variável conforme apresentação',
    pharmaceuticalForm: 'Solução Oleosa Sublingual / Comestível / Extrato',
    quantity: '01 Embalagem padrão',
    administrationRoute: 'Conforme produto',
    brand: manufacturer,
    origin: prodOrigin,
    description: 'Modulação terapêutica do Sistema Endocanabinoide.'
  };
}
`;

fs.writeFileSync(path, prefix);
console.log("Successfully rebuilt completely clean cbdGuide.ts");

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

export const cbdGuideData: CBDCategory[] = [
  {
    id: "ansiedade",
    title: "1. ANSIEDADE, ESTRESSE E TRANSTORNOS MENTAIS",
    description: "Produtos com perfil ansiolítico calmante e regulador do humor.",
    indicationsList: ["Ansiedade", "Depressão", "Estresse Crônico", "Burnout", "TDAH", "Transtornos do Humor"],
    dosageGuidance: "Iniciar com doses baixas (ex: 10-15 mg/dia de CBD ou 1/2 goma). Aumentar gradualmente conforme a resposta do paciente.",
    products: [
            {
        name: "Cápsulas Gelatinosas CBD Isolado 25mg",
        manufacturer: "PharmaHemp",
        origin: "Nacional",
        type: "Cápsula Softgel",
        priceBRL: 229.50,
        details: ["Frasco com 30 cápsulas", "25mg CBD por cápsula", "0% THC", "Liberação prolongada"],
        description: "Opção prática e discreta para quem busca CBD sem efeitos psicoativos, ideal para manter níveis séricos estáveis ao longo do dia para ansiedade generalizada."
      },
      {
        name: "Spray Sublingual Broad Spectrum Calming Blend",
        manufacturer: "NatureCBD",
        origin: "Nacional",
        type: "Spray Sublingual",
        priceBRL: 193.80,
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
        description: `O Drops By GreenBudz Looking Glass combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides CBD, THC, CBC e CBG, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de framboesa, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
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
        description: `O Drops By GreenBudz River Float combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de melancia, sua formulação foi desenhada para promover leveza física, relaxamento e equilíbrio, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
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
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Semana 1: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Semana 2: Aumentar para 0,4 mL (8 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Manutenção: Ajustar 0,1 mL (2 gotas) por dose a cada 7 dias conforme resposta clínica.`
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
            {
        name: "Adesivo Transdérmico CBD/THC 1:1 (Patch 72h)",
        manufacturer: "MedPatch",
        origin: "Nacional",
        type: "Adesivo Transdérmico",
        priceBRL: 306.00,
        details: ["Caixa com 5 adesivos", "20mg CBD + 20mg THC por adesivo", "Liberação lenta por até 72h"],
        description: "Excelente alternativa para dor crônica localizada (ex: lombalgia, hérnia), oferecendo analgesia contínua sem necessidade de dosagem oral constante."
      },
      {
        name: "Óleo Concentrado CBG + CBD 2000mg (Anti-inflamatório)",
        manufacturer: "HempMeds",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        priceBRL: 433.50,
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
            {
        name: "Cápsulas CBD + CBN 30mg Sleep Formula",
        manufacturer: "ZzzCBD",
        origin: "Nacional",
        type: "Cápsula",
        priceBRL: 280.50,
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
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Semana 1: Administrar 0,25 mL (5 gotas) via sublingual, 30 a 45 minutos antes de deitar. (Total: 12,5 mg CBD + 2,5 mg CBN)\n• Semana 2: Se persistir latência aumentada, progredir para 0,5 mL (10 gotas) antes de deitar. (Total: 25 mg CBD + 5 mg CBN)`
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
            {
        name: "Extrato Fluido Rico em THCV (Focus & Energy)",
        manufacturer: "VitalLeaf",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        priceBRL: 484.50,
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
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Dias 1 a 5: Administrar 0,1 mL (2 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (6 gotas) a cada 12 horas. (Total: 30 mg/dose)`
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
        priceBRL: 357.00,
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
        priceBRL: 408.00,
        details: ["60 cápsulas", "25mg CBD + 10mg CBG por cápsula", "Revestimento entérico"],
        description: "Cápsulas desenvolvidas para resistir ao ácido estomacal e liberar os fitocanabinoides diretamente no intestino, modulando a inflamação local da Colite e Crohn."
      },
      {
        name: "Spray Oral Anti-Emético (Rico em THC)",
        manufacturer: "Associação Nacional",
        origin: "Nacional",
        type: "Spray Oral",
        priceBRL: 250.00,
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
        priceBRL: 561.00,
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
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Dias 1 a 5: Administrar 0,1 mL (2 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (6 gotas) a cada 12 horas. (Total: 30 mg/dose)`
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
        priceBRL: 1275.00,
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
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Dias 1 a 5: Administrar 0,1 mL (2 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (6 gotas) a cada 12 horas. (Total: 30 mg/dose)`
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
        priceBRL: 204.00,
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
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Semana 1: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Semana 2: Aumentar para 0,4 mL (8 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Manutenção: Ajustar 0,1 mL (2 gotas) por dose a cada 7 dias conforme resposta clínica.`
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
        description: `O Drops By GreenBudz Looking Glass combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides CBD, THC, CBC e CBG, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de framboesa, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
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
        priceBRL: 229.50,
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
        priceBRL: 102.00,
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
        usageInstructions: `USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Dias 1 a 5: Administrar 0,1 mL (2 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (6 gotas) a cada 12 horas. (Total: 30 mg/dose)`
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
        priceBRL: 450.00,
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
        description: `O Drops By GreenBudz Beethoven combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de laranja, sua formulação foi desenhada para promover conforto físico, alívio e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
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
        description: `O Drops By GreenBudz Evergreen combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de limão, sua formulação foi desenhada para promover conforto físico, vitalidade e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.`
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
  const isNational = /Associação|Nacional|ÓLEO INTEGRAL|Pomada Canábica|Gomas Terapêuticas|Flores in natura/i.test(pName) || origin === 'Nacional';
  const manufacturer = brand || (isNational ? 'Associação Brasileira' : 'GreenBudzCBD');
  const prodOrigin = origin || (isNational ? 'Nacional' : 'Importado');
  const typeLower = (type || '').toLowerCase();
  const nameLower = pName.toLowerCase();
  
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
      pharmaceuticalForm: 'Gomas Mastigáveis (Forma Farmacêutica Comestível)',
      quantity: '01 Frasco',
      administrationRoute: 'Via Oral (Comestível)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Sinergia terapêutica e fácil administração.',
      usageInstructions: '• Ingerir 1/2 a 1 goma mastigável, 1 vez ao dia. Não ultrapassar 2 gomas ao dia sem orientação médica. Efeito pode demorar até 2h para iniciar.'
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
  const isImported = prodOrigin.toLowerCase() === 'importado';
  const dropsPerMl = isImported ? 'aprox. 40 gotas por mL' : 'aprox. 20 a 30 gotas por mL';
  const dropsNote = isImported 
    ? '(Nota p/ Importados: 1 mL costuma equivaler a ~40 gotas devido ao gotejador padrão americano/europeu. Verifique a bula).'
    : '(Nota p/ Nacionais: 1 mL costuma equivaler a cerca de 20-30 gotas, dependendo do dosador do frasco).';

  return {
    name: pName,
    activeIngredients: isNational 
      ? 'Extrato Integral de Cannabis Sativa Rico em Canabidiol (CBD)' 
      : 'Canabidiol (CBD) Full Spectrum / Broad Spectrum',
    concentration: 'Variável (Verificar concentração no rótulo)',
    pharmaceuticalForm: `Solução Oleosa Sublingual (${dropsPerMl})`,
    quantity: '01 Frasco de 30ml',
    administrationRoute: 'Via Sublingual',
    brand: manufacturer,
    origin: prodOrigin,
    description: 'Modulação terapêutica do Sistema Endocanabinoide.',
    usageInstructions: `• Pingar as gotas recomendadas sob a língua e aguardar 1 a 2 minutos antes de engolir. ${dropsNote}`
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

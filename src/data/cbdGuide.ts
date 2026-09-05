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
        origin: "Importado",
        type: "Cápsula Softgel",
        priceUSD: 45.00,
        details: ["Frasco com 30 cápsulas", "25mg CBD por cápsula", "0% THC", "Liberação prolongada"],
        description: "Opção prática e discreta para quem busca CBD sem efeitos psicoativos, ideal para manter níveis séricos estáveis ao longo do dia para ansiedade generalizada."
      },
      {
        name: "Spray Sublingual Broad Spectrum Calming Blend",
        manufacturer: "NatureCBD",
        origin: "Importado",
        type: "Spray Sublingual",
        priceUSD: 38.00,
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
        description: "Live Rosin sabor melancia para leveza física, relaxamento e equilíbrio."
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
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 50 mg/mL (5%)", "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Balanceado."
      }
    ]
  },
  {
    id: "dor_cronica",
    title: "2. DOR CRÔNICA E INFLAMAÇÃO",
    description: "Formulações focadas em analgesia sistêmica e relaxamento muscular profundo.",
    indicationsList: ["Dor Crônica", "Enxaqueca", "Fibromialgia", "Artrite / Artrose", "Hérnia de Disco", "Dores Neuropáticas", "Esclerose Múltipla", "Asma", "Glaucoma"],
    dosageGuidance: "Dose inicial moderada. Aumentar conforme dor referida e tolerabilidade. Uso 2 a 3 vezes ao dia.",
    products: [
            {
        name: "Adesivo Transdérmico CBD/THC 1:1 (Patch 72h)",
        manufacturer: "MedPatch",
        origin: "Importado",
        type: "Adesivo Transdérmico",
        priceUSD: 60.00,
        details: ["Caixa com 5 adesivos", "20mg CBD + 20mg THC por adesivo", "Liberação lenta por até 72h"],
        description: "Excelente alternativa para dor crônica localizada (ex: lombalgia, hérnia), oferecendo analgesia contínua sem necessidade de dosagem oral constante."
      },
      {
        name: "Óleo Concentrado CBG + CBD 2000mg (Anti-inflamatório)",
        manufacturer: "HempMeds",
        origin: "Importado",
        type: "Óleo Broad Spectrum",
        priceUSD: 85.00,
        details: ["Frasco 30ml", "1000mg CBG + 1000mg CBD"],
        description: "Alto teor de Canabigerol (CBG), um potente inibidor de inflamação sistêmica, ideal para condições autoimunes e articulares severas."
      },
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
        origin: "Importado",
        type: "Cápsula",
        priceUSD: 55.00,
        details: ["30 cápsulas", "25mg CBD + 5mg CBN por cápsula", "Com Melatonina natural"],
        description: "Formulação noturna específica contendo CBN, conhecido pelo seu forte potencial sedativo e indutor do sono."
      },
{
        name: "Drops By GreenBudz Goma Nightshade CBD CBN e THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 5mg CBD, 5mg CBN por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: "Combina a pureza de um extrato Live Rosin com a sinergia dos canabinoides CBD, CBN e THC para induzir relaxamento profundo e repouso noturno."
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
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 60 mg/mL (6%)", "CBD 50 mg/mL, CBN 10 mg/mL, THC 0,0%", "Veículo com terpenos relaxantes (Mirceno/Linalol)", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Sono."
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
    indicationsList: ["TDAH", "Burnout", "Foco e Concentração", "Obesidade e Controle Metabólico", "Melhora no Esporte", "Fadiga Crônica"],
    dosageGuidance: "Uso diurno. Evitar após as 16h para não interferir no sono.",
    products: [
            {
        name: "Extrato Fluido Rico em THCV (Focus & Energy)",
        manufacturer: "VitalLeaf",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 95.00,
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
        description: "Desenvolvido para promover equilíbrio metabólico e bem-estar. Base de óleo MCT e sabor natural de hortelã."
      },
      {
        name: "Drops By GreenBudz Goma Rodeo Queen THCV CBG e THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THCV, 3mg THC∆9, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: "Combina extrato Live Rosin com THCV, CBG e THC, desenhado para promover foco, vitalidade, regulação metabólica e equilíbrio sistêmico."
      },
      {
        name: "Drops By GreenBudz Goma Formula One THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Pinene e Limonene"],
        description: "Live Rosin sabor lima, para promover conforto físico, disposição e equilíbrio sistêmico."
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
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Alta Concentração."
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
        origin: "Importado",
        type: "Supositório",
        priceUSD: 70.00,
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
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THCV, 3mg THC∆9, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: "Combina extrato Live Rosin com THCV, CBG e THC, desenhado para promover foco, vitalidade, regulação metabólica e equilíbrio sistêmico."
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
        origin: "Importado",
        type: "Cápsula Gastrorresistente",
        priceUSD: 80.00,
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
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Limonene"],
        description: "Live Rosin sabor laranja para conforto físico, alívio e equilíbrio sistêmico."
      },
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
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 50 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: "Óleo de Cannabis sativa Full Spectrum indicado para modulação do sistema endocanabinoide."
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
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 110.00,
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
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THCV, 3mg THC∆9, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: "Combina extrato Live Rosin com THCV, CBG e THC, desenhado para promover foco, vitalidade, regulação metabólica e equilíbrio sistêmico."
      },
      {
        name: "Drops By GreenBudz Goma Formula One THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Pinene e Limonene"],
        description: "Live Rosin sabor lima, para promover conforto físico, disposição e equilíbrio sistêmico."
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
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Alta Concentração."
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
        origin: "Importado",
        type: "Óleo Isolado",
        priceUSD: 250.00,
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
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 100 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: "Óleo de Cannabis sativa Full Spectrum em alta concentração, indicado para casos que exigem maior aporte de fitocanabinoides."
      },
      {
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Alta Concentração."
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
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 40.00,
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
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 50 mg/mL (5%)", "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Balanceado."
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
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 50 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: "Óleo de Cannabis sativa Full Spectrum indicado para modulação do sistema endocanabinoide."
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
        origin: "Importado",
        type: "Creme Tópico",
        priceUSD: 45.00,
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
        origin: "Importado",
        type: "Flor In Natura",
        priceUSD: 20.00,
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
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 100 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: "Óleo de Cannabis sativa Full Spectrum em alta concentração, indicado para casos que exigem maior aporte de fitocanabinoides."
      },
      {
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Alta Concentração."
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
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Limonene"],
        description: "Live Rosin sabor laranja para conforto físico, alívio e equilíbrio sistêmico."
      },
      {
        name: "Drops By GreenBudz Goma Evergreen THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Limonene, Humulene e Caryophyllene"],
        description: "Live Rosin sabor limão, para conforto físico, vitalidade e equilíbrio sistêmico."
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
      description: 'Pomada fitocanabinoide de uso tópico para alívio localizado de dores musculares, articulares e processos inflamatórios.',
      usageInstructions: '• Aplicar uma fina camada sobre a região afetada e massagear suavemente até completa absorção, 2 a 3 vezes ao dia, ou conforme necessidade para alívio da dor.'
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
      description: 'Inalação vaporizada para rápida absorção e efeito analgésico ou ansiolítico imediato em momentos de crise.',
      usageInstructions: '• Vaporizar a 180°C - 200°C através de vaporizador de ervas secas. Iniciar com 1 a 2 inalações profundas em momentos de crise (dor aguda, pico de ansiedade) e aguardar 15 minutos para avaliar o efeito.'
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
      description: 'Gomas mastigáveis com liberação gradual e prolongada para relaxamento sustentado e sono reparador.',
      usageInstructions: '• Ingerir 1/2 a 1 goma mastigável, 1 vez ao dia (ou cerca de 45 minutos antes de dormir em caso de insônia). Não ultrapassar 2 gomas ao dia sem orientação médica.'
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
      description: 'Absorção pulmonar rápida sem combustão, oferecendo pico plasmático em minutos para resposta terapêutica ágil.',
      usageInstructions: '• Vaporizar a 160°C - 210°C usando vaporizador apropriado para concentrados. Realizar 1 inalação em momentos de crise aguda (dor, ansiedade, espasticidade) e aguardar 10-15 minutos.'
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
      description: 'Extrato balanceado 1:1 indicado para analgesia potente, dores neuropáticas, rigidez e espasticidade.',
      usageInstructions: '• Iniciar com 2 a 3 gotas (12/12 horas) via sublingual. Aumentar 1 gota por dose a cada 3 a 5 dias conforme tolerância e resposta analgésica.'
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
      description: 'Extrato predominante em THC para analgesia em dores intratáveis, insônia refratária e relaxamento neuromuscular.',
      usageInstructions: '• Iniciar com 1 a 2 gotas exclusivamente à noite via sublingual. Aumentar 1 gota a cada 3 a 5 dias. Uso diurno apenas sob estrita recomendação médica devido ao efeito psicoativo.'
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
      description: 'Formulação rica em CBG para clareza mental, foco, suporte anti-inflamatório sistêmico e imunológico.',
      usageInstructions: '• Iniciar com 3 a 5 gotas via sublingual pela manhã ou início da tarde. Aumentar gradualmente conforme resposta para foco e modulação do humor. Evitar uso próximo ao horário de dormir.'
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
      description: 'Canabidiol de altíssima concentração para quadros de ansiedade severa, dores refratárias e regulação do humor.',
      usageInstructions: '• Iniciar com 5-10 mg de CBD (aproximadamente 2-4 gotas, considerando que 1 gota = 5 mg de CBD a 200mg/ml) sublingual, 1 vez ao dia (preferencialmente à noite para iniciar). Aumentar gradualmente em 2-4 gotas a cada 3-5 dias, conforme tolerância e resposta, até 10-20 mg de CBD (aproximadamente 4-8 gotas) 2 vezes ao dia (12/12 horas).'
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
      description: 'Extrato Full Spectrum enriquecido com terpenos calmantes para relaxamento, inflamação e alívio da dor.',
      usageInstructions: '• Iniciar com 3-5 gotas (aprox. 7,5 - 12,5 mg de CBD) sublingual, 1 a 2 vezes ao dia. Aumentar 2 gotas a cada 3 a 5 dias até controle dos sintomas ou conforme indicação clínica.'
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

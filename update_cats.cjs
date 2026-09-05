const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

function injectAfterTitle(titleFragment, injectionString) {
  const titleIndex = code.indexOf(titleFragment);
  if (titleIndex === -1) {
    console.error("Title not found: " + titleFragment);
    return;
  }
  
  const productsIndex = code.indexOf('products: [', titleIndex);
  if (productsIndex === -1) {
    console.error("products array not found after title: " + titleFragment);
    return;
  }
  
  const insertionPoint = productsIndex + 'products: ['.length;
  code = code.slice(0, insertionPoint) + '\n' + injectionString + code.slice(insertionPoint);
}

const ansiedadeInjection = `
      {
        name: "GreenBudz Stirred Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Stirred)",
        priceUSD: 109.00,
        details: ["THCa 350mg, CBD 85mg, CBG 2.5mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura pastosa", "Temp: 180-210C"],
        description: "Extrato obtido por mistura com terpenos. Strains indicadas: ICC (Mirceno, Limoneno, Cariofileno - Relaxante, Anti-inflamatório) ou AH (Analgésico e Calmante)."
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
      },`;

const dorInjection = `
      {
        name: "GreenBudz Stirred Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Stirred)",
        priceUSD: 109.00,
        details: ["THCa 350mg, CBD 85mg, CBG 2.5mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura pastosa", "Temp: 180-210C"],
        description: "Extrato obtido por mistura com terpenos. Strain indicada: LC (Mirceno, Cariofileno, Limoneno - Relaxante e Analgésico)."
      },
      {
        name: "GreenBudz Granulated Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Granulated)",
        priceUSD: 109.00,
        details: ["THCa 400mg, CBD 17mg, CBC 48mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura granulada", "Temp: 180-210C"],
        description: "Mistura com terpenos. Strain indicada: CD (Cariofileno, Limoneno, Mirceno - Relaxante, Analgésico, Calmante)."
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
      },`;

const insoniaInjection = `
      {
        name: "GreenBudz Granulated Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Granulated)",
        priceUSD: 109.00,
        details: ["THCa 400mg, CBD 17mg, CBC 48mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura granulada", "Temp: 180-210C"],
        description: "Mistura com terpenos. Strain indicada: BM (Cariofileno, Mirceno e Limoneno - Relaxante, Sedativo, Calmante profundo)."
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
        name: "Broad Spectrum com Razão Enriquecida (CBD + CBN para Sono)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 60 mg/mL (6%)", "CBD 50 mg/mL, CBN 10 mg/mL, THC 0,0%", "Veículo com terpenos relaxantes (Mirceno/Linalol)"],
        description: "Extrato Broad Spectrum Sono enriquecido com CBN."
      },
      {
        name: "Gomas Terapêuticas CBD/CBN 25mg - 30 unidades",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Gomas (Comestível)",
        details: ["Pote com 30 unidades", "25mg CBD/CBN por goma", "Sabor Frutas"],
        description: "Gomas terapêuticas para facilidade de ingestão e liberação prolongada, indicadas para indução e manutenção do sono reparador."
      },`;

const energiaInjection = `
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
        description: "Extração mecânica a seco com gelo seco. Strain indicada: PR (Limoneno, Cariofileno - Estimulante, Focado, Equilibrado)."
      },
      {
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%"],
        description: "Extrato Broad Spectrum de alta concentração, ideal para suporte diurno severo mantendo foco."
      },`;

injectAfterTitle('1. ANSIEDADE', ansiedadeInjection);
injectAfterTitle('2. DOR CRÔNICA', dorInjection);
injectAfterTitle('3. INSÔNIA', insoniaInjection);
injectAfterTitle('4. ENERGIA', energiaInjection);

fs.writeFileSync(path, code);
console.log('Categories updated!');

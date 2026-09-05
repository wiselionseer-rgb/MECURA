const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const newProducts = {
  "ansiedade": `      {
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
      }`,
  "dor_cronica": `      {
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
      }`,
  "insonia": `      {
        name: "Cápsulas CBD + CBN 30mg Sleep Formula",
        manufacturer: "ZzzCBD",
        origin: "Importado",
        type: "Cápsula",
        priceUSD: 55.00,
        details: ["30 cápsulas", "25mg CBD + 5mg CBN por cápsula", "Com Melatonina natural"],
        description: "Formulação noturna específica contendo CBN, conhecido pelo seu forte potencial sedativo e indutor do sono."
      }`,
  "energia_foco": `      {
        name: "Extrato Fluido Rico em THCV (Focus & Energy)",
        manufacturer: "VitalLeaf",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 95.00,
        details: ["Frasco 30ml", "500mg THCV + 1000mg CBD", "Perfil Sativa"],
        description: "O THCV possui propriedades estimulantes e supressoras de apetite, sendo uma excelente opção para TDAH, fadiga crônica e foco sem a agitação da cafeína."
      }`,
  "saude_mulher": `      {
        name: "Supositório Pélvico CBD/THC (Endometriose e Cólicas)",
        manufacturer: "FemmeCare CBD",
        origin: "Importado",
        type: "Supositório",
        priceUSD: 70.00,
        details: ["Caixa com 10 unidades", "50mg CBD + 10mg THC por unidade"],
        description: "Absorção local no plexo pélvico. Extremamente eficaz para dor aguda de endometriose e dismenorreia severa, evitando processamento hepático e efeitos psicoativos centrais."
      }`,
  "gastro": `      {
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
      }`,
  "neurodegenerativas": `      {
        name: "Óleo Oral CBD/THC 10:1 (Parkinson)",
        manufacturer: "NeuroHemp",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 110.00,
        details: ["Frasco 30ml", "100mg/ml CBD + 10mg/ml THC"],
        description: "Proporção específica para neuroproteção e controle de tremores, oferecendo alto CBD sistêmico com traços de THC para sinergia de relaxamento muscular."
      }`,
  "epilepsia": `      {
        name: "Extrato Purificado CBD Isolado 200mg/ml (Epidiolex-like)",
        manufacturer: "PharmaCBD",
        origin: "Importado",
        type: "Óleo Isolado",
        priceUSD: 250.00,
        details: ["Frasco 50ml", "200mg/ml CBD", "0% THC Garantido", "Grau Farmacêutico"],
        description: "Fórmula pura de CBD em altíssima concentração, sem risco de interferência psicoativa. Dosagem robusta baseada em peso (mg/kg) para quadros convulsivos refratários."
      }`,
  "autismo": `      {
        name: "Gomas Infantis CBD Broad Spectrum (Sabor Morango)",
        manufacturer: "KidsHemp",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 40.00,
        details: ["30 gomas", "10mg CBD por goma", "0% THC", "Vegano e sem açúcar"],
        description: "Apresentação amigável e fácil de administrar para crianças com TEA. Ajuda no controle de ansiedade, regulação sensorial e agressividade, sem THC."
      }`,
  "dermatologia": `      {
        name: "Creme Tópico CBD/CBG (Psoríase e Dermatite Atópica)",
        manufacturer: "DermaWeed",
        origin: "Importado",
        type: "Creme Tópico",
        priceUSD: 45.00,
        details: ["Bisnaga 100g", "1000mg CBD + 500mg CBG"],
        description: "Ação direta nos receptores CB1 e CB2 da pele. O CBG age como potente anti-inflamatório, reduzindo escamação e coceira da psoríase rapidamente."
      }`,
  "vicios": `      {
        name: "Flor de Cânhamo CBD Indoor (Pré-Rolled) - Controle de Craving",
        manufacturer: "PureHemp",
        origin: "Importado",
        type: "Flor In Natura",
        priceUSD: 20.00,
        details: ["Embalagem com 5 unidades", "Aproximadamente 15% CBD", "Terapêutica Inalatória"],
        description: "A inalação oferece biodisponibilidade instantânea. Excelente ferramenta de redução de danos para substituir o ato de fumar (tabaco/crack), reduzindo fissuras agudas (craving)."
      }`,
  "oncologia": `      {
        name: "Óleo Rick Simpson (RSO) - THC Altamente Concentrado",
        manufacturer: "Associação Nacional",
        origin: "Nacional",
        type: "Extrato Concentrado",
        priceBRL: 450.00,
        details: ["Seringa 10ml", "Extrato pastoso 70% THC", "Dosagem de precisão"],
        description: "Extrato integral não diluído extremamente potente. Usado em cuidados paliativos para manejo de dor lancinante, resgate de apetite e caquexia severa em pacientes oncológicos tolerantes ao THC."
      }`
};

Object.keys(newProducts).forEach(catId => {
  const regexString = '(id:\\s*"' + catId + '"[\\s\\S]*?products:\\s*\\[\\s*)';
  const regex = new RegExp(regexString, 'g');
  code = code.replace(regex, '$1' + newProducts[catId] + ',\n');
});

fs.writeFileSync(path, code);
console.log('Added new diverse products to all categories');


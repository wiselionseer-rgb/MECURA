const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const targetCategory = 'id: "associacoes-nacionais",';

const newProducts = `
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
      },`;

// Insert the new products into the "associacoes-nacionais" category
if (code.includes(targetCategory)) {
  const productsArrayStart = code.indexOf('products: [', code.indexOf(targetCategory)) + 11;
  const before = code.substring(0, productsArrayStart);
  const after = code.substring(productsArrayStart);
  const newCode = before + newProducts + after;
  fs.writeFileSync(path, newCode);
  console.log("Successfully added new products to cbdGuide.ts");
} else {
  console.log("Could not find associacoes-nacionais category");
}

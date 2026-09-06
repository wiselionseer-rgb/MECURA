const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const explicitData = {
  "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%": {
    activeIngredients: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
    concentration: "CBD 50 mg/mL + THC < 0,2%",
    pharmaceuticalForm: "Solução Oleosa Sublingual",
    quantity: "01 (um) frasco de 30 mL",
    administrationRoute: "Sublingual"
  },
  "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%": {
    activeIngredients: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%",
    concentration: "CBD 100 mg/mL + THC < 0,2%",
    pharmaceuticalForm: "Solução Oleosa Sublingual",
    quantity: "01 (um) frasco de 30 mL",
    administrationRoute: "Sublingual"
  },
  "Broad Spectrum Balanceado (50 mg/mL — 5%)": {
    activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
    concentration: "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, Delta-9-THC: 0,0%",
    pharmaceuticalForm: "Solução Oleosa Sublingual",
    quantity: "01 (um) frasco de 30 mL",
    administrationRoute: "Sublingual / Oral"
  },
  "Broad Spectrum Alta Concentração (100 mg/mL — 10%)": {
    activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum)",
    concentration: "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%",
    pharmaceuticalForm: "Solução Oleosa Sublingual",
    quantity: "01 (um) frasco de 30 mL",
    administrationRoute: "Sublingual / Oral"
  },
  "Broad Spectrum com Razão Enriquecida (CBD + CBN para Sono)": {
    activeIngredients: "Extrato de Cannabis sativa (Broad Spectrum Sono) + Terpenos relaxantes (Mirceno/Linalol)",
    concentration: "CBD 50 mg/mL, CBN 10 mg/mL, Delta-9-THC: 0,0%",
    pharmaceuticalForm: "Solução Oleosa Sublingual",
    quantity: "01 (um) frasco de 30 mL",
    administrationRoute: "Sublingual / Oral"
  }
};

for (const [name, overrides] of Object.entries(explicitData)) {
  let idx = 0;
  while(true) {
    let nameIdx = code.indexOf(`name: "${name}"`, idx);
    if(nameIdx === -1) break;
    
    // insert right after name
    const insertStr = `\n        activeIngredients: "${overrides.activeIngredients}",\n        concentration: "${overrides.concentration}",\n        pharmaceuticalForm: "${overrides.pharmaceuticalForm}",\n        quantity: "${overrides.quantity}",\n        administrationRoute: "${overrides.administrationRoute}",`;
    
    code = code.substring(0, nameIdx + `name: "${name}",`.length) + insertStr + code.substring(nameIdx + `name: "${name}",`.length);
    
    idx = nameIdx + 100;
  }
}

fs.writeFileSync(path, code);
console.log('Added explicit overrides');

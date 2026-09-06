const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const gomasData = {
  "GreenBudz Chill Vibe Gummies - THC 1:1 CBD": {
    activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
    concentration: "10mg CBD + 10mg THC∆9 por goma",
    quantity: "30 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma Looking Glass CBD THC CBC CBG": {
    activeIngredients: "Extrato Live Rosin (CBD + THC∆9 + CBC + CBG)",
    concentration: "3mg CBD + 3mg THC∆9 + 3mg CBC + 3mg CBG por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma River Float THC": {
    activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Linalol, Cariofileno)",
    concentration: "5mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma Bicycle Day THC e CBD": {
    activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
    concentration: "4mg CBD + 5mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma Crickets CBD e THC": {
    activeIngredients: "Extrato Live Rosin (CBD + THC∆9)",
    concentration: "10mg CBD + 5mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma 100 Sheep THC": {
    activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Limoneno, Cariofileno)",
    concentration: "5mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma Nightshade CBD CBN e THC": {
    activeIngredients: "Extrato Live Rosin (CBD + CBN + THC∆9)",
    concentration: "5mg CBD + 5mg CBN + 5mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma Rodeo Queen THCV CBG e THC": {
    activeIngredients: "Extrato Live Rosin (THCV + CBG + THC∆9)",
    concentration: "5mg THCV + 3mg CBG + 3mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma Formula One THC": {
    activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Pineno, Limoneno)",
    concentration: "5mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma Beethoven THC": {
    activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Mirceno, Linalol, Limoneno)",
    concentration: "5mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  },
  "Drops By GreenBudz Goma Evergreen THC": {
    activeIngredients: "Extrato Live Rosin (THC∆9) + Terpenos (Limoneno, Humuleno, Cariofileno)",
    concentration: "5mg THC∆9 por goma",
    quantity: "20 gomas por frasco",
    pharmaceuticalForm: "Gomas Veganas (Pectina com Açúcar)",
    administrationRoute: "Via Oral"
  }
};

for (const [name, overrides] of Object.entries(gomasData)) {
  let idx = 0;
  while(true) {
    let nameIdx = code.indexOf(`name: "${name}"`, idx);
    if(nameIdx === -1) break;
    
    // Check if we already have activeIngredients inserted for this occurrence
    let activeIngredientsIdx = code.indexOf(`activeIngredients:`, nameIdx);
    if (activeIngredientsIdx !== -1 && activeIngredientsIdx < nameIdx + 200) {
      // Remove the old overrides up to administrationRoute
      let endIdx = code.indexOf(`administrationRoute:`, activeIngredientsIdx);
      if (endIdx !== -1) {
         let endLine = code.indexOf(`\n`, endIdx);
         code = code.substring(0, activeIngredientsIdx - 9) + code.substring(endLine + 1);
      }
    }
    
    // insert right after name
    const insertStr = `\n        activeIngredients: "${overrides.activeIngredients}",\n        concentration: "${overrides.concentration}",\n        pharmaceuticalForm: "${overrides.pharmaceuticalForm}",\n        quantity: "${overrides.quantity}",\n        administrationRoute: "${overrides.administrationRoute}",`;
    
    code = code.substring(0, nameIdx + `name: "${name}",`.length) + insertStr + code.substring(nameIdx + `name: "${name}",`.length);
    
    idx = nameIdx + insertStr.length + 50;
  }
}

fs.writeFileSync(path, code);
console.log('Added explicit overrides for gomas');

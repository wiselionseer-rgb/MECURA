const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const mapping = {
  "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%": {
    description: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%\\nQuantidade: 01 (um) frasco de 30 mL."
  },
  "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%": {
    description: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%\\nQuantidade: 01 (um) frasco de 30 mL."
  },
  "Broad Spectrum Balanceado (50 mg/mL — 5%)": {
    description: "Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 50 mg/mL (5%).\\nComposição: CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, Delta-9-THC: 0,0%.\\nQuantidade: 01 (um) frasco de 30 mL.",
    usageInstructions: "USO ORAL / SUBLINGUAL\\nPosologia (Considerando 1 mL = 20 gotas):\\n• Semana 1: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 10 mg/dose)\\n• Semana 2: Aumentar para 0,4 mL (8 gotas) a cada 12 horas. (Total: 20 mg/dose)\\n• Manutenção: Ajustar 0,1 mL (2 gotas) por dose a cada 7 dias conforme resposta clínica."
  },
  "Broad Spectrum Alta Concentração (100 mg/mL — 10%)": {
    description: "Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 100 mg/mL (10%).\\nComposição: CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%.\\nQuantidade: 01 (um) frasco de 30 mL.",
    usageInstructions: "USO ORAL / SUBLINGUAL\\nPosologia (Considerando 1 mL = 20 gotas):\\n• Dias 1 a 5: Administrar 0,1 mL (2 gotas) a cada 12 horas. (Total: 10 mg/dose)\\n• Dias 6 a 10: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 20 mg/dose)\\n• Dias 11 a 15: Administrar 0,3 mL (6 gotas) a cada 12 horas. (Total: 30 mg/dose)"
  },
  "Broad Spectrum com Razão Enriquecida (CBD + CBN para Sono)": {
    description: "Extrato de Cannabis sativa (Broad Spectrum Sono) — Canabinoides Totais: 60 mg/mL (6%).\\nComposição: CBD 50 mg/mL, CBN 10 mg/mL, Delta-9-THC: 0,0%.\\nVeículo: com terpenos relaxantes (Mirceno/Linalol).\\nQuantidade: 01 (um) frasco de 30 mL.",
    usageInstructions: "USO ORAL / SUBLINGUAL\\nPosologia (Considerando 1 mL = 20 gotas):\\n• Semana 1: Administrar 0,25 mL (5 gotas) via sublingual, 30 a 45 minutos antes de deitar. (Total: 12,5 mg CBD + 2,5 mg CBN)\\n• Semana 2: Se persistir latência aumentada, progredir para 0,5 mL (10 gotas) antes de deitar. (Total: 25 mg CBD + 5 mg CBN)"
  }
};

for (const [name, updates] of Object.entries(mapping)) {
  // Let's find index of name and replace manually
  let idx = 0;
  while(true) {
    let nameIdx = code.indexOf(`name: "${name}"`, idx);
    if(nameIdx === -1) break;
    
    let descStart = code.indexOf(`description: "`, nameIdx);
    if(descStart !== -1 && descStart < nameIdx + 1000) {
      let descEnd = code.indexOf(`"`, descStart + 14);
      
      code = code.substring(0, descStart) + `description: \`${updates.description}\`` + code.substring(descEnd + 1);
      
      // Let's add usage instructions if present
      if(updates.usageInstructions) {
         let newDescStart = code.indexOf(`description: \``, nameIdx);
         let newDescEnd = code.indexOf(`\``, newDescStart + 14);
         
         // Insert usageInstructions
         code = code.substring(0, newDescEnd + 1) + `,\n        usageInstructions: \`${updates.usageInstructions}\`` + code.substring(newDescEnd + 1);
      }
    }
    idx = nameIdx + 10;
  }
}

fs.writeFileSync(path, code);
console.log('Fixed manually');

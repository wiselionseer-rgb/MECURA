const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const mapping = {
  "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%": {
    description: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%\nQuantidade: 01 (um) frasco de 30 mL."
  },
  "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%": {
    description: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%\nQuantidade: 01 (um) frasco de 30 mL."
  },
  "Broad Spectrum Balanceado (50 mg/mL — 5%)": {
    description: "Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 50 mg/mL (5%).\nComposição: CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.",
    usageInstructions: "USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Semana 1: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Semana 2: Aumentar para 0,4 mL (8 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Manutenção: Ajustar 0,1 mL (2 gotas) por dose a cada 7 dias conforme resposta clínica."
  },
  "Broad Spectrum Alta Concentração (100 mg/mL — 10%)": {
    description: "Extrato de Cannabis sativa (Broad Spectrum) — Canabinoides Totais: 100 mg/mL (10%).\nComposição: CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, Delta-9-THC: 0,0%.\nQuantidade: 01 (um) frasco de 30 mL.",
    usageInstructions: "USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Dias 1 a 5: Administrar 0,1 mL (2 gotas) a cada 12 horas. (Total: 10 mg/dose)\n• Dias 6 a 10: Administrar 0,2 mL (4 gotas) a cada 12 horas. (Total: 20 mg/dose)\n• Dias 11 a 15: Administrar 0,3 mL (6 gotas) a cada 12 horas. (Total: 30 mg/dose)"
  },
  "Broad Spectrum com Razão Enriquecida (CBD + CBN para Sono)": {
    description: "Extrato de Cannabis sativa (Broad Spectrum Sono) — Canabinoides Totais: 60 mg/mL (6%).\nComposição: CBD 50 mg/mL, CBN 10 mg/mL, Delta-9-THC: 0,0%.\nVeículo: com terpenos relaxantes (Mirceno/Linalol).\nQuantidade: 01 (um) frasco de 30 mL.",
    usageInstructions: "USO ORAL / SUBLINGUAL\nPosologia (Considerando 1 mL = 20 gotas):\n• Semana 1: Administrar 0,25 mL (5 gotas) via sublingual, 30 a 45 minutos antes de deitar. (Total: 12,5 mg CBD + 2,5 mg CBN)\n• Semana 2: Se persistir latência aumentada, progredir para 0,5 mL (10 gotas) antes de deitar. (Total: 25 mg CBD + 5 mg CBN)"
  }
};

for (const [name, updates] of Object.entries(mapping)) {
  // We will find the object where name: "X" and replace its description and usageInstructions (if any)
  const regex = new RegExp(`(name:\\s*["']` + name.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&') + `["'].*?description:\\s*["'])(.*?)(["'])`, 'gs');
  code = code.replace(regex, `$1${updates.description.replace(/\\n/g, '\\n')}$3`);
  
  if (updates.usageInstructions) {
      // Let's add usageInstructions after description if not present
      const regexUsage = new RegExp(`(name:\\s*["']` + name.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&') + `["'].*?)(usageInstructions:\\s*\`.*?\`)`, 'gs');
      if (code.match(regexUsage)) {
        code = code.replace(regexUsage, `$1usageInstructions: \`${updates.usageInstructions}\``);
      } else {
        // Just insert it after description
        const regexInsert = new RegExp(`(name:\\s*["']` + name.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&') + `["'].*?description:\\s*["'].*?["'])`, 'gs');
        code = code.replace(regexInsert, `$1,\n        usageInstructions: \`${updates.usageInstructions}\``);
      }
  }
}

fs.writeFileSync(path, code);
console.log('Updated descriptions and usage instructions');

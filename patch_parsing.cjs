const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `          const rawName = cols[0].replace(/\\*\\*/g, '').trim();
            const isNational = /ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL/i.test(rawName);
            medications.push({`;

const replaceStr = `          const rawName = cols[0].replace(/\\*\\*/g, '').trim();
            let isNational = false;
            if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado')) {
              isNational = false;
            } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL/i.test(rawName)) {
              isNational = true;
            }
            medications.push({`;

code = code.replace(targetStr, replaceStr);

const targetStr2 = `        if (nameMatch && nameMatch[1].trim()) {
          const rawName = nameMatch[1].replace(/\\*\\*/g, '').replace(/^- /, '').replace(/\\*$/, '').trim();
          const isNational = /ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL/i.test(rawName) ||
                             block.includes('Associação') || block.includes('Nacional');

          medications.push({`;

const replaceStr2 = `        if (nameMatch && nameMatch[1].trim()) {
          const rawName = nameMatch[1].replace(/\\*\\*/g, '').replace(/^- /, '').replace(/\\*$/, '').trim();
          
          let isNational = false;
          if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado')) {
            isNational = false;
          } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL/i.test(rawName) || block.includes('Associação') || block.includes('Nacional')) {
            isNational = true;
          }

          medications.push({`;

code = code.replace(targetStr2, replaceStr2);

// Fix in table logic just in case
const oldPrompt = `(Para CADA produto nacional sugerido, use EXATAMENTE este bloco e DEVE INCLUIR o texto "- Associação Nacional" no nome)`;
const newPrompt = `(Para CADA produto nacional sugerido, use EXATAMENTE este bloco e DEVE INCLUIR o texto "- Associação Nacional" no nome. IMPORTANTE: NUNCA sugira produtos da marca "GreenBudz" ou "Drops By GreenBudz" na lista de Nacionais. Eles SÃO IMPORTADOS.)`;
code = code.replace(oldPrompt, newPrompt);

fs.writeFileSync(path, code);

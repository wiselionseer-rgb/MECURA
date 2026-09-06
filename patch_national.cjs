const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr1 = `            if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado') || rawName.toLowerCase().includes('broad spectrum') || rawName.toLowerCase().includes('cbd + cbn para sono') || rawName.toLowerCase().includes('isolate')) {
              isNational = false;
            } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL|INTEGRAL/i.test(rawName)) {
              isNational = true;
            }`;

const replaceStr1 = `            if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado') || rawName.toLowerCase().includes('broad spectrum') || rawName.toLowerCase().includes('cbd + cbn para sono') || rawName.toLowerCase().includes('isolate')) {
              isNational = false;
            } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL|INTEGRAL/i.test(rawName)) {
              isNational = true;
            }`;

const targetStr2 = `          if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado')) {
            isNational = false;
          } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL/i.test(rawName) || block.includes('Associação') || block.includes('Nacional')) {
            isNational = true;
          }`;

const replaceStr2 = `          if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado') || rawName.toLowerCase().includes('broad spectrum') || rawName.toLowerCase().includes('cbd + cbn para sono') || rawName.toLowerCase().includes('isolate')) {
            isNational = false;
          } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL|INTEGRAL/i.test(rawName) || block.includes('Associação') || block.includes('Nacional')) {
            isNational = true;
          }`;

code = code.replace(targetStr1, replaceStr1); // This one might fail if already patched, we just patch the second one
code = code.replace(targetStr2, replaceStr2);

fs.writeFileSync(path, code);

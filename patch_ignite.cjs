const fs = require('fs');

let file1 = 'src/screens/PharmacyScreen.tsx';
let code1 = fs.readFileSync(file1, 'utf8');

code1 = code1.replace(`      // 4. Ignite - Óleos
      else if (nameLower.includes('ignite') && (nameLower.includes('óleo') || nameLower.includes('oil') || nameLower.includes('30ml'))) {
        const setsOf3 = Math.floor(qty / 3);
        const remainder = qty % 3;
        itemTotal = (setsOf3 * 2 * basePrice) + (remainder * basePrice);
      }`, '');

code1 = code1.replace(` } else if (nameLower.includes('ignite') && (nameLower.includes('óleo') || nameLower.includes('oil') || nameLower.includes('30ml'))) {
                        itemTotal = (Math.floor(qty / 3) * 2 * basePrice) + ((qty % 3) * basePrice);
                      }`, '');

fs.writeFileSync(file1, code1);

let file2 = 'src/store/useAdminStore.ts';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(`\\n• Ignite (Queima de estoque): Leve 3, pague 2 em todos os 4 óleos.`, '');
fs.writeFileSync(file2, code2);
console.log("Patched Pharmacy and Store");

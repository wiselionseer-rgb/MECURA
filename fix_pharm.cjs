const fs = require('fs');

const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(`itemTotal = (Math.floor(qty / 2) * 49.90 * exchangeRate) + ((qty % 2) * basePrice);
                      
                       
                      return itemTotal.toLocaleString`, `itemTotal = (Math.floor(qty / 2) * 49.90 * exchangeRate) + ((qty % 2) * basePrice);
                      }
                       
                      return itemTotal.toLocaleString`);
fs.writeFileSync(path, code);

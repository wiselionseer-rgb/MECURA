const fs = require('fs');

const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(`} else if (nameLower.includes('drops by greenbudz') && nameLower.includes('gumm')) {
                        itemTotal = (Math.floor(qty / 2) * 49.90 * exchangeRate) + ((qty % 2) * basePrice);
                        
                         
                      return itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}`, `} else if (nameLower.includes('drops by greenbudz') && nameLower.includes('gumm')) {
                        itemTotal = (Math.floor(qty / 2) * 49.90 * exchangeRate) + ((qty % 2) * basePrice);
                      }
                         
                      return itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}`);

fs.writeFileSync(path, code);

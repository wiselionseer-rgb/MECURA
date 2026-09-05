const fs = require('fs');

const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const lines = code.split('\\n');
lines[396] = '                      }'; 

fs.writeFileSync(path, lines.join('\\n'));

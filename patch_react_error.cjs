const fs = require('fs');
const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/React\.useEffect/g, 'useEffect');
fs.writeFileSync(path, code);

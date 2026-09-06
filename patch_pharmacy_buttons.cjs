const fs = require('fs');
const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/VER CATÁLOGO IMPORTADOS/g, "VER CATÁLOGO PRODUTOS VIA INALADA");
code = code.replace(/VER CATÁLOGO NACIONAL/g, "VER CATÁLOGO PRODUTOS VIA ORAL");

fs.writeFileSync(path, code);

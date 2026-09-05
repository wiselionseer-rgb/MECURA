const fs = require('fs');

const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

// The string "\\n" was added literally multiple times, let's just replace all literal "\\n" with real "\n"
code = code.replace(/\\n/g, '\n');

fs.writeFileSync(path, code);

const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// There's a missing brace for the enrichMedicationDetails function at the very end
code = code + "\n}\n";

fs.writeFileSync(path, code);
console.log('Fixed syntax error');

const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const target = "const OBJECTIVES_OTHER = ['Outros'];";
const newCode = `const OBJECTIVES_OTHER = [
  'TDAH',
  'Autismo (TEA)',
  'Parkinson',
  'Alzheimer',
  'Epilepsia',
  'Fibromialgia',
  'Depressão',
  'Enxaqueca',
  'Endometriose',
  'Artrose / Artrite',
  'Doença de Crohn',
  'Esclerose Múltipla',
  'Glaucoma',
  'Psoríase',
  'Burnout',
  'Outros'
];`;

if (code.includes(target)) {
  code = code.replace(target, newCode);
  fs.writeFileSync(path, code);
  console.log("Success replacing OBJECTIVES_OTHER");
} else {
  console.log("Target not found");
}

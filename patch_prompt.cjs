const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

const oldText = `2. Opção de Associações Nacionais: Sugira formulações de associações brasileiras (ex: Óleo Integral THC/CBD 100mg/ml, Pomada Canábica, Gomas Terapêuticas, ou Flores in natura), adequadas à fisiopatologia do paciente.`;
const newText = `2. Opção de Associações Nacionais: Sugira formulações de associações brasileiras (ex: Óleo Integral THC/CBD 100mg/ml, Pomada Canábica, Gomas Terapêuticas, Flores in natura, ou Extrações e Concentrados), adequadas à fisiopatologia do paciente. Lembre-se que as Extrações e Concentrados (como Crumble, Live Resin, Diamonds) devem aparecer nas recomendações de acordo com cada paciente, igual aos outros medicamentos, principalmente para casos severos ou pacientes experientes.`;

if(code.includes(oldText)) {
    code = code.replace(oldText, newText);
    fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code);
    console.log("Successfully patched prompt");
} else {
    console.log("Could not find old text in prompt");
}

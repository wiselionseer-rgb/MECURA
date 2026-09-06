const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetPoint = `addMessage({
                        text: \`**Protocolo de Entrada (Importado)**\\n\\n\${msg}\\n\\n**Medicamento Prescrito:**\\n\${productData.name} - \${productData.dosage}\`,
                        sender: 'doctor',`;

const newCode = `addMessage({
                        text: \`**Protocolo de Entrada (Importado)**\\n\\n\${msg}\\n\\n**Medicamento Prescrito:**\\n\${productData.name} - \${productData.dosage[0]}\`,
                        sender: 'doctor',`;

if(dashboardCode.includes(targetPoint)) {
  dashboardCode = dashboardCode.replace(targetPoint, newCode);
  fs.writeFileSync(dashboardPath, dashboardCode);
  console.log("Success");
} else {
  console.log("Target point not found");
}

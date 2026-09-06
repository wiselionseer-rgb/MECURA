const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetPoint = `                        dosage: accessibleImportType === 'cbd' ? "Iniciar com 2 gotas 2x/dia. Titulação lenta." :
                                accessibleImportType === 'balanced' ? "Iniciar com 3 gotas 30 min antes de deitar." :
                                "Iniciar com 2 gotas 12/12h. Aumentar 1 gota após 5 dias.",`;

const newCode = `                        dosage: accessibleImportType === 'cbd' ? ["Iniciar com 2 gotas 2x/dia. Titulação lenta."] :
                                accessibleImportType === 'balanced' ? ["Iniciar com 3 gotas 30 min antes de deitar."] :
                                ["Iniciar com 2 gotas 12/12h. Aumentar 1 gota após 5 dias."],`;

if(dashboardCode.includes(targetPoint)) {
  dashboardCode = dashboardCode.replace(targetPoint, newCode);
  fs.writeFileSync(dashboardPath, dashboardCode);
  console.log("Success");
} else {
  console.log("Target point not found");
}

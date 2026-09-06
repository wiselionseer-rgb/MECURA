const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

// Replace map 1
dashboardCode = dashboardCode.replace(
  /\{\(msg\.productData\.dosage \|\| \[\]\)\.map\(\(dose, idx\) => \(/g,
  "{(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage || '']).map((dose, idx) => ("
);

// Replace map 2
dashboardCode = dashboardCode.replace(
  /\{\(msg\.productData\.dosage \|\| \[\]\)\.map\(\(d: string, i: number\) => \(/g,
  "{(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage || '']).map((d: string, i: number) => ("
);

fs.writeFileSync(dashboardPath, dashboardCode);
console.log("Success");

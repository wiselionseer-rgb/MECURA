const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetPoint = `{(msg.productData.dosage || []).map((dose, idx) => (`;

if(dashboardCode.includes(targetPoint)) {
  console.log("Target point found in map 1");
} else {
  console.log("Target point not found in map 1");
}

const targetPoint2 = `{(msg.productData.dosage || []).map((d: string, i: number) => (`;

if(dashboardCode.includes(targetPoint2)) {
  console.log("Target point found in map 2");
} else {
  console.log("Target point not found in map 2");
}

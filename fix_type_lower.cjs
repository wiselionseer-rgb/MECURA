const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetCode1 = `      const typeLower = selectedProduct.type.toLowerCase();`;
const newCode1 = `      const typeLower = (selectedProduct.type || '').toLowerCase();`;

const targetCode2 = `                                const typeLower = msg.productData?.name?.toLowerCase() || '';`;
const newCode2 = `                                const typeLower = (msg.productData?.name || '').toLowerCase();`;

if(dashboardCode.includes(targetCode1)) {
  dashboardCode = dashboardCode.replace(targetCode1, newCode1);
  console.log("Fixed target 1");
}

if(dashboardCode.includes(targetCode2)) {
  dashboardCode = dashboardCode.replace(targetCode2, newCode2);
  console.log("Fixed target 2");
}

fs.writeFileSync(dashboardPath, dashboardCode);
console.log("Success type lower");

const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

// The issue is likely duplicate keys in the map, because idx or i might not be unique enough 
// if React re-renders quickly, or the array has duplicate values.
// Plus, there might be other maps missing keys.

const targetCode1 = `{(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage || '']).map((dose, idx) => (
                              <li key={idx}>`;
const newCode1 = `{(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage || '']).map((dose, idx) => (
                              <li key={\`\${msg.id}-dose-\${idx}\`}>`;


const targetCode2 = `{(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage || '']).map((d: string, i: number) => (
                                      <p key={i} className="text-xs text-mecura-silver">• {d}</p>`;
const newCode2 = `{(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage || '']).map((d: string, i: number) => (
                                      <p key={\`\${msg.id}-protocol-\${i}\`} className="text-xs text-mecura-silver">• {d}</p>`;

if(dashboardCode.includes(targetCode1)) {
  dashboardCode = dashboardCode.replace(targetCode1, newCode1);
  console.log("Fixed target 1");
}

if(dashboardCode.includes(targetCode2)) {
  dashboardCode = dashboardCode.replace(targetCode2, newCode2);
  console.log("Fixed target 2");
}

fs.writeFileSync(dashboardPath, dashboardCode);
console.log("Success keys");

const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

dashboardCode = dashboardCode.replace(
  /if \(selectedProduct\.type\.includes/g,
  "if ((selectedProduct.type || '').includes"
).replace(
  /else if \(selectedProduct\.type\.includes/g,
  "else if ((selectedProduct.type || '').includes"
).replace(
  /p\.name\.toLowerCase\(\)\.includes/g,
  "(p.name || '').toLowerCase().includes"
).replace(
  /p\.manufacturer\.toLowerCase\(\)\.includes/g,
  "(p.manufacturer || '').toLowerCase().includes"
).replace(
  /p\.type\.toLowerCase\(\)\.includes/g,
  "(p.type || '').toLowerCase().includes"
);

fs.writeFileSync(dashboardPath, dashboardCode);
console.log("Success includes");

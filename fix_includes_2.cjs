const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

dashboardCode = dashboardCode.replace(
  /selectedProduct\.type\.includes\('Bálsamo'\)/g,
  "(selectedProduct.type || '').includes('Bálsamo')"
).replace(
  /selectedProduct\.type\.includes\('Gel'\)/g,
  "(selectedProduct.type || '').includes('Gel')"
).replace(
  /selectedProduct\.type\.includes\('Comestível'\)/g,
  "(selectedProduct.type || '').includes('Comestível')"
);

fs.writeFileSync(dashboardPath, dashboardCode);
console.log("Success includes 2");

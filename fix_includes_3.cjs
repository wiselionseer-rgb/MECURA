const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

dashboardCode = dashboardCode.replace(
  /\(p\.patientName \|\| ''\)\.toLowerCase\(\)\.includes\(queueSearchTerm\.toLowerCase\(\)\)/g,
  "(p.patientName || '').toLowerCase().includes((queueSearchTerm || '').toLowerCase())"
).replace(
  /\(h\.patientName \|\| ''\)\.toLowerCase\(\)\.includes\(historySearchTerm\.toLowerCase\(\)\)/g,
  "(h.patientName || '').toLowerCase().includes((historySearchTerm || '').toLowerCase())"
).replace(
  /\(p\.name \|\| ''\)\.toLowerCase\(\)\.includes\(productSearchTerm\.toLowerCase\(\)\)/g,
  "(p.name || '').toLowerCase().includes((productSearchTerm || '').toLowerCase())"
).replace(
  /\(p\.manufacturer \|\| ''\)\.toLowerCase\(\)\.includes\(productSearchTerm\.toLowerCase\(\)\)/g,
  "(p.manufacturer || '').toLowerCase().includes((productSearchTerm || '').toLowerCase())"
).replace(
  /\(p\.type \|\| ''\)\.toLowerCase\(\)\.includes\(productSearchTerm\.toLowerCase\(\)\)/g,
  "(p.type || '').toLowerCase().includes((productSearchTerm || '').toLowerCase())"
);

fs.writeFileSync(dashboardPath, dashboardCode);
console.log("Success includes 3");

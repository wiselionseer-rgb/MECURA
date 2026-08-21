const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

if (!code.includes('import { db, auth }') && !code.includes('import { auth }')) {
  code = code.replace("import { db } from '../firebase';", "import { db, auth } from '../firebase';");
  fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');
  console.log('Fixed auth import.');
} else {
  console.log('auth already imported or db not found.');
}

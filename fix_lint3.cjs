const fs = require('fs');

let docDashPath = 'src/screens/DoctorDashboardScreen.tsx';
let docCode = fs.readFileSync(docDashPath, 'utf8');

// duplicate import of cbdGuideData
// import { categories as cbdGuideData, ... }
docCode = docCode.replace(/import \{ categories as cbdGuideData, products, default as guideData \} from '\.\.\/data\/cbdGuide';/, '');

fs.writeFileSync(docDashPath, docCode);

let premiumPath = 'src/screens/PremiumCheckoutScreen.tsx';
let premCode = fs.readFileSync(premiumPath, 'utf8');

// type '"system"' is not assignable to type '"user" | "doctor"'.
premCode = premCode.replace(/sender: 'system'/g, "sender: 'doctor'");

fs.writeFileSync(premiumPath, premCode);
console.log('Fixed more lint issues');

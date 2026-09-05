const fs = require('fs');

// 1. Fix cbdGuide.ts duplicate usageInstructions (from previous edits or generation)
let guidePath = 'src/data/cbdGuide.ts';
let guideCode = fs.readFileSync(guidePath, 'utf8');
guideCode = guideCode.replace(/export const usageInstructions = \[[\s\S]*?\];/g, '');
guideCode = guideCode.replace(/export const usageInstructions = /g, '// export const usageInstructions = ');
// we just wipe duplicates or comment it out if it was declared multiple times. Since it's complaining about duplicates we'll just try to ensure it only appears once.
let usageCount = 0;
guideCode = guideCode.replace(/export const usageInstructions =/g, (match) => {
  usageCount++;
  if (usageCount > 1) return '// duplicate export const usageInstructions =';
  return match;
});
fs.writeFileSync(guidePath, guideCode);

// 2. Fix AdminDashboardScreen.tsx missing imports
let adminPath = 'src/screens/AdminDashboardScreen.tsx';
let adminCode = fs.readFileSync(adminPath, 'utf8');
if (!adminCode.includes('sendPasswordResetEmail')) {
    adminCode = adminCode.replace(/import \{ ([^}]+) \} from 'firebase\/auth';/, "import { $1, sendPasswordResetEmail } from 'firebase/auth';");
}
fs.writeFileSync(adminPath, adminCode);

console.log('Fixed simple lint issues');

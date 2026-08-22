const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');
if (!code.includes('BrainCircuit')) {
    code = code.replace("FileText,", "FileText,\n  BrainCircuit,");
    fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
}

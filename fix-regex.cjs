const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');
code = code.replace(/agronomicResult\.replace\(\/[\s\S]*?'<br \/>'\)/g, "agronomicResult.replace(/\\n/g, '<br />')");
fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

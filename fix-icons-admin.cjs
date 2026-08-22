const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

if (!code.includes(" Trash2,")) {
    code = code.replace("import { Users", "import { Users, Trash2");
}

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

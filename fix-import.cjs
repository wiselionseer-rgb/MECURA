const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

if (!code.includes("import { Users, FileText, Plus, Package")) {
    code = code.replace("import { Users, FileText, Plus", "import { Users, FileText, Plus, Package");
} else if (!code.includes("Package,") && !code.includes(" Package ")) {
    code = code.replace("import { Users,", "import { Users, Package,");
}

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

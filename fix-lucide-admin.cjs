const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

if (!code.includes("  Package,")) {
    code = code.replace("} from 'lucide-react';", "  Package,\n  Plus,\n  Trash2\n} from 'lucide-react';");
}

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

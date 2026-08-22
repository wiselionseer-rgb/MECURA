const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

code = code.replace("  Plus,\n  Trash2\n} from 'lucide-react';", "} from 'lucide-react';");
fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

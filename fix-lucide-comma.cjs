const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

code = code.replace("  MessageCircle  Package,", "  MessageCircle,\n  Package,");

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

// The import looks like: import {  Users,  Pill,
if (!code.includes('UserCircle,')) {
    code = code.replace("Users,", "Users, UserCircle, MessageCircle,");
}

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

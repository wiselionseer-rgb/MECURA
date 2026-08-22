const fs = require('fs');

let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

// Fix imports
if (!code.includes('UserCircle')) {
    code = code.replace("  Users,", "  Users,\n  UserCircle,\n  MessageCircle,");
}

// Fix activeTab state type
code = code.replace(
    "useState<'overview' | 'doctors' | 'catalog' | 'coupons' | 'notifications' | 'support'>('overview')",
    "useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'coupons' | 'notifications'>('overview')"
);

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

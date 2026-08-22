const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetState = `  const [activeTab, setActiveTab] = useState<'metrics' | 'patients' | 'doctors' | 'chat' | 'history' | 'abandonment' | 'coupons' | 'promotions' | 'notifications' | 'support'>('metrics');`;
const replacementState = `  const [activeTab, setActiveTab] = useState<'metrics' | 'patients' | 'doctors' | 'chat' | 'history' | 'abandonment' | 'coupons' | 'promotions' | 'notifications' | 'support' | 'medicines'>('metrics');`;

if (code.includes(targetState)) {
    code = code.replace(targetState, replacementState);
} else {
    // regex
    const regex = /useState<'metrics' \| 'patients'[\s\S]*?>\('metrics'\);/;
    const match = code.match(regex);
    if (match) {
        let block = match[0].replace(">", " | 'medicines'>");
        code = code.replace(regex, block);
    }
}

if (!code.includes("import { Package }") && !code.includes(" Package,")) {
    code = code.replace("import { Users", "import { Users, Package");
}

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

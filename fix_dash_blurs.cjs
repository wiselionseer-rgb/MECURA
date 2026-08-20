const fs = require('fs');
let content = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

content = content.replace(/mix-blend-screen/g, '');
content = content.replace(/blur-\[120px\]/g, 'blur-[60px]');
content = content.replace(/blur-\[150px\]/g, 'blur-[80px]');

fs.writeFileSync('src/screens/DashboardScreen.tsx', content, 'utf8');
console.log('dash blurs optimized');

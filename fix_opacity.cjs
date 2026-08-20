const fs = require('fs');
let content = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

content = content.replace(/opacity-\[0\.35\]/g, 'opacity-40');

fs.writeFileSync('src/screens/DashboardScreen.tsx', content, 'utf8');
console.log('patched opacity');

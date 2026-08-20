const fs = require('fs');
let content = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

content = content.replace(/2131\.mov/g, '2131.mp4');

fs.writeFileSync('src/screens/DashboardScreen.tsx', content, 'utf8');
console.log('patched video extension');

const fs = require('fs');

let content = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

content = content.replace(/<div className="absolute right-\[-30px\] bottom-\[-20px\][^>]+>[\s\S]*?<\/div>/g, '');

fs.writeFileSync('src/screens/DashboardScreen.tsx', content, 'utf8');
console.log('Icons removed');

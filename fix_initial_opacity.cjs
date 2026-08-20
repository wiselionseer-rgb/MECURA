const fs = require('fs');

let welcome = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');
let dashboard = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

// Replace opacity-80 or opacity-100 on the video with opacity-0
welcome = welcome.replace(/className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-10"/g, 'className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none z-10"');
dashboard = dashboard.replace(/className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"/g, 'className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none z-10"');

fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcome, 'utf8');
fs.writeFileSync('src/screens/DashboardScreen.tsx', dashboard, 'utf8');

console.log('Fixed initial opacity to 0');

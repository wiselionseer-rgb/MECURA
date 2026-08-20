const fs = require('fs');

let welcome = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');
welcome = welcome.replace(/<video/g, '<video\n                poster="/welcome-bg-poster.jpg"');
fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcome, 'utf8');

let dashboard = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');
dashboard = dashboard.replace(/<video/g, '<video\n                  poster="/dashboard-bg-poster.jpg"');
fs.writeFileSync('src/screens/DashboardScreen.tsx', dashboard, 'utf8');

console.log('Added poster attribute');

const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf8');

const oldMap = `{notifications.map(notification => (`;
const newMap = `{Array.from(new Map(notifications.map(n => [n.id, n])).values()).map(notification => (`;

if (code.includes(oldMap)) {
  code = code.replace(oldMap, newMap);
  fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code, 'utf8');
  console.log('Fixed rendering to deduplicate in AdminDashboard.');
} else {
  console.log('Could not find notifications.map line.');
}

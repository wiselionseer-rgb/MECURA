const fs = require('fs');
const path = 'src/screens/DashboardScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `          <div className="grid grid-cols-4 gap-3">`;
const replacement = `          <div className={\`grid gap-3 \${!pagamento_premium ? 'grid-cols-3' : 'grid-cols-4'}\`}>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('grid patched successfully');
} else {
  console.log('grid target string not found');
}

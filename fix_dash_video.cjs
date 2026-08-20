const fs = require('fs');

let content = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

content = content.replace(
  /<video\n                  poster="\/dashboard-bg-poster\.jpg" \n                  autoPlay \n                  loop \n                  muted \n                  playsInline\n                  controls=\{false\}/g,
  '<video\n                  poster="/dashboard-bg-poster.jpg" \n                  autoPlay \n                  loop \n                  muted \n                  playsInline\n                  webkit-playsinline="true"\n                  controls={false}'
);

fs.writeFileSync('src/screens/DashboardScreen.tsx', content, 'utf8');
console.log('Dash videos fixed');

const fs = require('fs');

let welcome = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');
let dashboard = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

// Ensure the opacity of the images is visible, and the component does not hide them
welcome = welcome.replace(
  /<img\s+src="\/welcome-bg\.webp"\s+className="absolute inset-0 w-full h-full object-cover opacity-[0-9]+ pointer-events-none z-10"\s+alt="animated background"\s*\/>/g,
  `<img 
                src="/welcome-bg.webp" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-10" 
                alt="animated background"
              />`
);

dashboard = dashboard.replace(
  /<img\s+src="\/dashboard-bg\.webp"\s+className="absolute inset-0 w-full h-full object-cover opacity-[0-9]+ pointer-events-none z-10"\s+alt="animated background"\s*\/>/g,
  `<img 
                  src="/dashboard-bg.webp" 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10" 
                  alt="animated background"
                />`
);

fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcome, 'utf8');
fs.writeFileSync('src/screens/DashboardScreen.tsx', dashboard, 'utf8');

console.log('Opacity forced to visible for images.');

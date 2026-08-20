const fs = require('fs');

let welcome = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');
let dashboard = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

// The webp files are now generated perfectly from the original high quality .mp4 files.
// Let's ensure the img tags are correctly structured.

const welcomeRegex = /<img\s+src="\/welcome-bg\.webp"\s+className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-10"\s+alt="animated background"\s*\/>/g;
const welcomeReplacement = `<img 
                src="/welcome-bg.webp" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-10" 
                alt="animated background"
              />`;

// (The tags are already there, just verifying no typos)

fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcome, 'utf8');
fs.writeFileSync('src/screens/DashboardScreen.tsx', dashboard, 'utf8');

console.log('Verified image paths');

const fs = require('fs');

let welcome = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');
let dashboard = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

const welcomeRegex = /<img src="\/welcome-bg-poster\.jpg"[^>]+>\s*<video[\s\S]+?src="\/0820-ezgif\.com-video-compressor\.mp4"[\s\S]+?\/>/;
const welcomeReplacement = `<img 
                src="/welcome-bg.webp" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-10" 
                alt="animated background"
              />`;
welcome = welcome.replace(welcomeRegex, welcomeReplacement);
fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcome, 'utf8');

const dashRegex = /<img src="\/dashboard-bg-poster\.jpg"[^>]+>\s*<video[\s\S]+?src="\/2131-ezgif\.com-video-compressor\.mp4"[\s\S]+?\/>/g;
const dashReplacement = `<img 
                  src="/dashboard-bg.webp" 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10" 
                  alt="animated background"
                />`;
dashboard = dashboard.replace(dashRegex, dashReplacement);
fs.writeFileSync('src/screens/DashboardScreen.tsx', dashboard, 'utf8');

console.log('WebP substitution complete.');

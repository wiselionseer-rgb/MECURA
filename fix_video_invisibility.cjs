const fs = require('fs');

let welcome = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');
let dashboard = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

// WelcomeScreen Cleanup
welcome = welcome.replace(/const bgVideoRef = useRef<HTMLVideoElement>\(null\);\s*useEffect\(\(\) => \{\s*if \(bgVideoRef\.current\) \{\s*bgVideoRef\.current\.play\(\)\.catch\(\(e\) => \{\s*console\.log\('Video autoplay prevented:', e\);\s*if \(bgVideoRef\.current\) bgVideoRef\.current\.style\.display = 'none';\s*\}\);\s*\}\s*\}, \[\]\);/g, '');

const welcomeVideoRefOld = /ref=\{bgVideoRef\}/g;
const welcomeVideoRefNew = `ref={(el) => {
                  if (el && !el.dataset.initialized) {
                    el.dataset.initialized = 'true';
                    el.style.opacity = '0';
                    el.addEventListener('playing', () => {
                      el.style.transition = 'opacity 1s ease-in-out';
                      el.style.opacity = '0.8';
                    });
                    el.play().catch(()=>{});
                  }
                }}`;
welcome = welcome.replace(welcomeVideoRefOld, welcomeVideoRefNew);
fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcome, 'utf8');

// DashboardScreen Update
const dashVideoRefOld = /ref=\{\(el\) => \{ if \(el\) \{ el\.play\(\)\.catch\(\(\)=>\{ el\.style\.display = 'none'; \}\); \} \}\}/g;
const dashVideoRefNew = `ref={(el) => {
                  if (el && !el.dataset.initialized) {
                    el.dataset.initialized = 'true';
                    el.style.opacity = '0';
                    el.addEventListener('playing', () => {
                      el.style.transition = 'opacity 1s ease-in-out';
                      el.style.opacity = '1';
                    });
                    el.play().catch(()=>{});
                  }
                }}`;
dashboard = dashboard.replace(dashVideoRefOld, dashVideoRefNew);
fs.writeFileSync('src/screens/DashboardScreen.tsx', dashboard, 'utf8');

console.log('Video invisibility logic applied successfully.');

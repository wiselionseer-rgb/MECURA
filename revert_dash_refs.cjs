const fs = require('fs');
let content = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

// Remove the injected hook
content = content.replace(/\s*const bgVideoRef = useRef<HTMLVideoElement>\(null\);\s*useEffect\(\(\) => \{\s*if \(bgVideoRef\.current\) \{\s*bgVideoRef\.current\.play\(\)\.catch\(\(e\) => console\.log\('Video autoplay prevented:', e\)\);\s*\}\s*\}, \[\]\);/g, '');

// Restore inline refs
content = content.replace(/ref=\{bgVideoRef\}/g, 'ref={(el) => { if (el) { el.play().catch(()=>{}); } }}');

fs.writeFileSync('src/screens/DashboardScreen.tsx', content, 'utf8');
console.log('Reverted dash refs');

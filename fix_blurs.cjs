const fs = require('fs');
let content = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');

// The main background blob blur: blur-[120px] is very heavy. Change to blur-[80px]
content = content.replace(/blur-\[120px\]/g, 'blur-[80px]');

// Same for the other blobs
content = content.replace(/blur-\[150px\]/g, 'blur-[80px]');

// Replace some backdrop-blur-xl with backdrop-blur-md for better performance on mobile
content = content.replace(/backdrop-blur-xl/g, 'backdrop-blur-md');

fs.writeFileSync('src/screens/WelcomeScreen.tsx', content, 'utf8');
console.log('blurs optimized');

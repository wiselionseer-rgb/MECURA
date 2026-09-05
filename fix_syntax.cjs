const fs = require('fs');

let viewPath = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(viewPath, 'utf8');

// Replace the fragment with a simple div
code = code.replace(/<\/>\s*\n\s*\)\}/g, "</div>\n        )}");
code = code.replace(/\) :\s*\(\s*<>/g, ") : (\n          <div className=\"space-y-6\">");

fs.writeFileSync(viewPath, code);
console.log('Fixed syntax');

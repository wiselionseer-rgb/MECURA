const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace("container.style.width = '794px';\n  container.style.height = '1123px';", "");

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);

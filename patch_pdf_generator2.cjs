const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace(
  "container.style.position = 'fixed';\n  container.style.left = '0';\n  container.style.top = '0';\n  container.style.zIndex = '-9999';\n  container.style.opacity = '1';",
  "container.style.position = 'absolute';\n  container.style.left = '0';\n  container.style.top = '0';\n  container.style.zIndex = '-9999';\n  container.style.width = '794px';\n  container.style.height = '1123px';" // Force width and height
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);

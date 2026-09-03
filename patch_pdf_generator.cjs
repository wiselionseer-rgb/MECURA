const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace(
  "container.style.position = 'absolute';\n  container.style.left = '-9999px';\n  container.style.top = '0';",
  "container.style.position = 'fixed';\n  container.style.left = '0';\n  container.style.top = '0';\n  container.style.zIndex = '-9999';\n  container.style.opacity = '1';" // we can just use z-index to hide it under everything
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);

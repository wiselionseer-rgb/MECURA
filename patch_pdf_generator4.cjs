const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace(
  "html2canvas: { scale: 2, useCORS: true, logging: false }",
  "html2canvas: { scale: 2, useCORS: true, logging: true, windowWidth: 794 }"
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace(
  "html2canvas: { scale: 2, useCORS: true, logging: true, windowWidth: 794 }",
  "html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 }"
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);

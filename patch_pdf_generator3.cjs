const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace(
  "await html2pdf().set(opt).from(container).output('blob');",
  "await html2pdf().set(opt).from(container.firstElementChild || container).output('blob');"
);

code = code.replace(
  "await html2pdf().set(opt).from(container).save();",
  "await html2pdf().set(opt).from(container.firstElementChild || container).save();"
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace(
  "jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }\n  };\n\n  if (patientData?.returnBlob) {\n    const pdfBlob = await html2pdf().set(opt).from(container.firstElementChild || container).output('blob');",
  "jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },\n    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }\n  };\n\n  if (patientData?.returnBlob) {\n    const pdfBlob = await html2pdf().set(opt).from(container.firstElementChild || container).output('blob');"
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);

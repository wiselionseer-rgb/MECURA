const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');
code = code.replace(/\\`Receita_Medica_\\\${sanitizedUserName}\.pdf\\`/g, "\`Receita_Medica_\${sanitizedUserName}.pdf\`");
fs.writeFileSync('src/utils/pdfGenerator.tsx', code);

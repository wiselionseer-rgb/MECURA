const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const oldOpt = `          const opt = {
              margin: 15,
              filename: 'Parecer_Tecnico_Agronomico.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };`;

const newOpt = `          const opt = {
              margin: 15,
              filename: 'Parecer_Tecnico_Agronomico.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          };`;

code = code.replace(oldOpt, newOpt);
fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

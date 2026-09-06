const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetPrompt = `        CATÁLOGO OFICIAL DISPONÍVEL (Para a Opção Importada):
        \${productCategories.map(cat => \`Categoria: \${cat.title}\\n\${cat.products.map(p => \`- \${p.name} (\${p.type}): \${p.description || ''}\`).join('\\n')}\`).join('\\n\\n')}`;

const newPrompt = `        CATÁLOGO OFICIAL DE IMPORTADOS (MARCA GREENBUDZCBD):
        \${productCategories.map(cat => {
          const imported = cat.products.filter(p => p.origin === 'Importado' || p.manufacturer === 'GreenBudzCBD');
          if(imported.length === 0) return '';
          return \`Categoria: \${cat.title}\\n\${imported.map(p => \`- \${p.name} (\${p.type}): \${p.description || ''}\`).join('\\n')}\`;
        }).filter(Boolean).join('\\n\\n')}

        CATÁLOGO OFICIAL DE NACIONAIS (ASSOCIAÇÕES BRASILEIRAS):
        \${productCategories.map(cat => {
          const national = cat.products.filter(p => p.origin === 'Nacional' || p.manufacturer !== 'GreenBudzCBD');
          if(national.length === 0) return '';
          return \`Categoria: \${cat.title}\\n\${national.map(p => \`- \${p.name} (\${p.type}): \${p.description || ''}\`).join('\\n')}\`;
        }).filter(Boolean).join('\\n\\n')}`;

if (dashboardCode.includes(targetPrompt)) {
  dashboardCode = dashboardCode.replace(targetPrompt, newPrompt);
  console.log("Success prompt fix");
} else {
  console.log("Target prompt not found");
}

const targetModalText = 'Óleo GreenBudz CBD Isolate / Broad';
const newModalText = 'GreenBudz Isolate CBD Hemp Formula';
if (dashboardCode.includes(targetModalText)) {
  dashboardCode = dashboardCode.replace(targetModalText, newModalText);
  console.log("Success modal text fix");
} else {
  console.log("Target modal text not found");
}

fs.writeFileSync(dashboardPath, dashboardCode);

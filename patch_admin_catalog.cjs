const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const target = `<Button onClick={() => setShowImportMedicineModal(true)}>
                <BrainCircuit className="w-4 h-4 mr-2" /> Assistente IA
              </Button>`;

const replacement = `<div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  if(window.confirm('Tem certeza? Isso irá restaurar o catálogo do banco de dados oficial (PDF atualizado).')) {
                    setProductCategories(cbdGuideData);
                  }
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Atualizar via Sistema (PDF)
                </Button>
                <Button onClick={() => setShowImportMedicineModal(true)}>
                  <BrainCircuit className="w-4 h-4 mr-2" /> Assistente IA
                </Button>
              </div>`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(path, code);
  console.log('Patched AdminDashboardScreen successfully.');
} else {
  console.log('Target not found in AdminDashboardScreen.');
}

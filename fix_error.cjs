const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

const target = `<div className="mb-4">
                      <h3 className="font-bold text-white text-xl mb-1">{selectedDisease.name}</h3>
                      <p className="text-mecura-silver text-sm">Tratamento classificado em: <strong className="text-white">{selectedCategory.name}</strong></p>
                    </div>`;

code = code.replace(target, '');
fs.writeFileSync(path, code);
console.log('Fixed CBDGuideView error');

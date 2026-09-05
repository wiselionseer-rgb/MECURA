const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// I will insert a new block for Concentrates before "// 4. Óleos e Extratos"

const newBlock = `
  // 5. Concentrados e Extrações (Vaporização)
  if (/Stirred|Granulated|Crystalized|Dried Hemp|Isolate/i.test(pName)) {
    const isIsolate = /Isolate/i.test(pName);
    const isTHCa = /THCa/i.test(pName);
    return {
      name: pName,
      activeIngredients: isIsolate 
        ? (isTHCa ? 'Cristais Isolados de THCa (Tetrahidrocanabinol Ácido) de Alta Pureza' : 'Cristais Isolados de Canabidiol (CBD) de Alta Pureza')
        : 'Extrato Concentrado de Cannabis Rico em Canabinoides e Terpenos',
      concentration: isTHCa ? 'Alto Teor de THCa (>350mg/dose)' : 'Alto Teor de CBD',
      pharmaceuticalForm: 'Extrato Concentrado para Vaporização',
      quantity: '01 Embalagem (5g a 20g)',
      administrationRoute: 'Via Inalatória (Vaporizador Dosimetrado, 160°C - 210°C)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Absorção pulmonar rápida sem combustão, oferecendo pico plasmático em minutos para resposta terapêutica ágil.'
    };
  }
`;

if (code.includes('// 4. Óleos e Extratos')) {
  code = code.replace('// 4. Óleos e Extratos', newBlock + '\n  // 4. Óleos e Extratos');
  fs.writeFileSync(path, code);
  console.log("Successfully patched enrichMedicationDetails with concentrates");
} else {
  console.log("Could not find // 4. Óleos e Extratos");
}

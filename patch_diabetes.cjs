const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// Dor crônica
const targetDorCronica = '"Dor Crônica", "Enxaqueca", "Fibromialgia", "Artrite / Artrose", "Hérnia de Disco", "Dores Neuropáticas", "Esclerose Múltipla", "Asma", "Glaucoma"';
const replacementDorCronica = '"Dor Crônica", "Enxaqueca", "Fibromialgia", "Artrite / Artrose", "Hérnia de Disco", "Dores Neuropáticas", "Neuropatia Diabética", "Esclerose Múltipla", "Asma", "Glaucoma"';
code = code.replace(targetDorCronica, replacementDorCronica);

// Energia e metabolismo
const targetEnergia = '"TDAH", "Burnout", "Foco e Concentração", "Obesidade e Controle Metabólico", "Melhora no Esporte", "Fadiga Crônica"';
const replacementEnergia = '"TDAH", "Burnout", "Foco e Concentração", "Obesidade e Controle Metabólico", "Diabetes e Resistência Insulínica", "Melhora no Esporte", "Fadiga Crônica"';
code = code.replace(targetEnergia, replacementEnergia);

// Slim Vibe Oil description
const targetSlim = '"Desenvolvido para promover equilíbrio metabólico e bem-estar. Base de óleo MCT e sabor natural de hortelã."';
const replacementSlim = '"Desenvolvido para promover equilíbrio metabólico e bem-estar. O THCv atua como coadjuvante no manejo da Diabetes, regulação da glicemia e controle de peso. Base de óleo MCT e sabor natural de hortelã."';
code = code.replace(targetSlim, replacementSlim);

fs.writeFileSync(path, code);
console.log('Added Diabetes mentions');

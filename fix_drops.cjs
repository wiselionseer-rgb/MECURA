const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// The default return block in enrichMedicationDetails currently says:
// pharmaceuticalForm: 'Solução Oleosa Sublingual (aprox. 20 a 30 gotas por mL)',
// usageInstructions: '... (Nota: 1 mL equivale a cerca de 20-30 gotas, consulte o medidor do fabricante).'

// We need to change this logic to check `prodOrigin`.
// If it's Importado (or not Nacional), 1 mL = approx 40 drops.
// If it's Nacional, 1 mL = approx 20 a 30 drops.

const targetRegex = /\/\/ DEFAULT \(ÓLEOS\)[\s\S]*?return \{\s*name: pName,[\s\S]*?\};\s*\}/;

const replacement = `// DEFAULT (ÓLEOS)
  const isImported = prodOrigin.toLowerCase() === 'importado';
  const dropsPerMl = isImported ? 'aprox. 40 gotas por mL' : 'aprox. 20 a 30 gotas por mL';
  const dropsNote = isImported 
    ? '(Nota p/ Importados: 1 mL costuma equivaler a ~40 gotas devido ao gotejador padrão americano/europeu. Verifique a bula).'
    : '(Nota p/ Nacionais: 1 mL costuma equivaler a cerca de 20-30 gotas, dependendo do dosador do frasco).';

  return {
    name: pName,
    activeIngredients: isNational 
      ? 'Extrato Integral de Cannabis Sativa Rico em Canabidiol (CBD)' 
      : 'Canabidiol (CBD) Full Spectrum / Broad Spectrum',
    concentration: 'Variável (Verificar concentração no rótulo)',
    pharmaceuticalForm: \`Solução Oleosa Sublingual (\${dropsPerMl})\`,
    quantity: '01 Frasco de 30ml',
    administrationRoute: 'Via Sublingual',
    brand: manufacturer,
    origin: prodOrigin,
    description: 'Modulação terapêutica do Sistema Endocanabinoide.',
    usageInstructions: \`• Pingar as gotas recomendadas sob a língua e aguardar 1 a 2 minutos antes de engolir. \${dropsNote}\`
  };
}`;

code = code.replace(targetRegex, replacement);

fs.writeFileSync(path, code);
console.log('Fixed drops per mL calculation based on origin');

const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// We need to fix `enrichMedicationDetails` so that it parses the type/name correctly
// and provides the exact "gotas por mL" for oils, and avoids putting "Solução Oleosa Sublingual"
// on capsules and suppositories!

const targetFnStart = "export function enrichMedicationDetails(pName: string, manufacturer: string, prodOrigin: string, type?: string) {";

const replacementFn = `export function enrichMedicationDetails(pName: string, manufacturer: string, prodOrigin: string, type?: string) {
  const isNational = prodOrigin.toLowerCase().includes('nacional');
  const typeLower = (type || '').toLowerCase();
  
  // Custom parsing for the newly added products to give them correct presentation
  if (typeLower.includes('cápsula')) {
    return {
      name: pName,
      activeIngredients: pName.includes('Isolado') ? 'Canabidiol (CBD) Isolado' : (pName.includes('CBG') ? 'Canabidiol (CBD) + Canabigerol (CBG)' : 'Canabidiol (CBD) + Canabinol (CBN)'),
      concentration: 'Conforme rótulo',
      pharmaceuticalForm: 'Cápsulas Gelatinosas (Via Oral)',
      quantity: '01 Frasco',
      administrationRoute: 'Via Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Cápsulas para liberação prolongada ou entérica.',
      usageInstructions: '• Ingerir 1 cápsula via oral conforme orientação médica. Não partir ou mastigar cápsulas gastrorresistentes.'
    };
  }

  if (typeLower.includes('spray')) {
    return {
      name: pName,
      activeIngredients: pName.includes('THC') ? 'Tetrahidrocanabinol (THC) + Canabidiol (CBD)' : 'Canabidiol (CBD) Broad Spectrum',
      concentration: 'Conforme rótulo',
      pharmaceuticalForm: 'Spray Sublingual/Oral',
      quantity: '01 Frasco',
      administrationRoute: 'Via Sublingual ou Mucosa Oral',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Absorção rápida pelas mucosas.',
      usageInstructions: '• Borrifar diretamente sob a língua ou na mucosa oral (parte interna da bochecha). Aguardar 1 minuto antes de engolir.'
    };
  }

  if (typeLower.includes('adesivo') || typeLower.includes('transdérmico')) {
    return {
      name: pName,
      activeIngredients: 'Canabidiol (CBD) + Tetrahidrocanabinol (THC) 1:1',
      concentration: '20mg CBD + 20mg THC / adesivo',
      pharmaceuticalForm: 'Adesivo Transdérmico (Patch)',
      quantity: '01 Caixa',
      administrationRoute: 'Via Transdérmica',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Liberação lenta e contínua.',
      usageInstructions: '• Aplicar 1 adesivo em área limpa, seca e sem pelos (ex: ombro, costas, face interna do braço). Trocar a cada 72 horas. Alternar o local de aplicação.'
    };
  }

  if (typeLower.includes('supositório')) {
    return {
      name: pName,
      activeIngredients: 'Canabidiol (CBD) + Tetrahidrocanabinol (THC)',
      concentration: '50mg CBD + 10mg THC / unidade',
      pharmaceuticalForm: 'Supositório Pélvico/Vaginal',
      quantity: '01 Caixa',
      administrationRoute: 'Via Intravaginal / Retal',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Ação localizada no plexo pélvico.',
      usageInstructions: '• Inserir 1 unidade via intravaginal ou retal em momentos de crise aguda (cólicas fortes). Recomenda-se deitar por 15-20 minutos após a inserção.'
    };
  }

  if (typeLower.includes('tópica') || typeLower.includes('creme') || typeLower.includes('pomada')) {
    return {
      name: pName,
      activeIngredients: pName.includes('CBG') ? 'Canabidiol (CBD) + Canabigerol (CBG)' : 'Fitocanabinoides (CBD predominante)',
      concentration: 'Conforme rótulo',
      pharmaceuticalForm: 'Creme / Pomada Tópica',
      quantity: '01 Bisnaga/Pote',
      administrationRoute: 'Via Tópica (Uso Externo)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Ação local em receptores cutâneos e articulares.',
      usageInstructions: '• Aplicar fina camada sobre a área afetada 2 a 3 vezes ao dia, massageando suavemente até completa absorção. Não aplicar em feridas abertas profundas.'
    };
  }

  if (typeLower.includes('flor') || typeLower.includes('in natura')) {
    return {
      name: pName,
      activeIngredients: 'Canabidiol (CBD) e Fitocanabinoides (In Natura)',
      concentration: '~15% CBD (Variável por safra)',
      pharmaceuticalForm: 'Flor Seca de Cânhamo (In Natura)',
      quantity: '01 Embalagem',
      administrationRoute: 'Via Inalatória (Vaporização)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Rápida biodisponibilidade para resgate.',
      usageInstructions: '• Utilizar em vaporizador de ervas secas em temperatura de 170°C a 195°C para extração de terpenos e CBD sem combustão. Utilizar em crises agudas.'
    };
  }
`;

// Find where the function starts and replace everything up to `if (/Nacional/i.test(pName) || isNational) {`
const originalRegex = /export function enrichMedicationDetails[\s\S]*?if \(\/Nacional\/i\.test\(pName\)/;

code = code.replace(originalRegex, replacementFn + "\n  if (/Nacional/i.test(pName)");

// Also, let's fix the default case so it mentions "gotas por mL" for oils.
const defaultPattern = /return \{\s*name: pName,\s*activeIngredients:(.|\n)*?Modulação terapêutica do Sistema Endocanabinoide.'\s*\};\s*\}/;

const newDefault = `return {
    name: pName,
    activeIngredients: isNational 
      ? 'Extrato Integral de Cannabis Sativa Rico em Canabidiol (CBD)' 
      : 'Canabidiol (CBD) Full Spectrum / Broad Spectrum',
    concentration: 'Variável (Verificar concentração no rótulo)',
    pharmaceuticalForm: typeLower.includes('goma') || typeLower.includes('comestível') 
      ? 'Gomas / Comestível' 
      : (typeLower.includes('extrato') ? 'Extrato Sólido/Pastoso' : 'Solução Oleosa Sublingual (aprox. 20 a 30 gotas por mL)'),
    quantity: '01 Embalagem padrão',
    administrationRoute: typeLower.includes('goma') ? 'Via Oral' : 'Via Sublingual',
    brand: manufacturer,
    origin: prodOrigin,
    description: 'Modulação terapêutica do Sistema Endocanabinoide.',
    usageInstructions: typeLower.includes('goma') ? '• Ingerir conforme orientação médica.' : '• Pingar as gotas sob a língua e aguardar 1 a 2 minutos antes de engolir. (Nota p/ o Brasil: 1 mL costuma equivaler a 20-30 gotas, dependendo do dosador do frasco. Verifique a bula).'
  };
}`;

code = code.replace(defaultPattern, newDefault);

fs.writeFileSync(path, code);
console.log('Fixed presentations and added drops per ML information');


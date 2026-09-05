const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// I completely botched the function replace. Let's rewrite it from scratch.

const replacement = `export function enrichMedicationDetails(
  productName: string, 
  brand?: string, 
  origin?: string, 
  type?: string
): EnrichedMedicationInfo {
  const pName = productName || '';
  const isNational = /Associação|Nacional|ÓLEO INTEGRAL|Pomada Canábica|Gomas Terapêuticas|Flores in natura/i.test(pName) || origin === 'Nacional';
  const manufacturer = brand || (isNational ? 'Associação Brasileira' : 'GreenBudzCBD');
  const prodOrigin = origin || (isNational ? 'Nacional' : 'Importado');
  const typeLower = (type || '').toLowerCase();
  const nameLower = pName.toLowerCase();
  
  // Custom parsing for the newly added products to give them correct presentation
  if (typeLower.includes('cápsula') || nameLower.includes('cápsula')) {
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

  if (typeLower.includes('spray') || nameLower.includes('spray')) {
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

  if (typeLower.includes('adesivo') || typeLower.includes('transdérmico') || nameLower.includes('adesivo')) {
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

  if (typeLower.includes('supositório') || nameLower.includes('supositório')) {
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

  if (typeLower.includes('tópica') || typeLower.includes('creme') || typeLower.includes('pomada') || nameLower.includes('creme') || nameLower.includes('pomada')) {
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

  if (typeLower.includes('flor') || typeLower.includes('in natura') || nameLower.includes('flor')) {
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
  
  if (typeLower.includes('goma') || typeLower.includes('comestível') || nameLower.includes('goma') || nameLower.includes('gummies')) {
    return {
      name: pName,
      activeIngredients: nameLower.includes('thc') ? 'Fitocanabinoides Padronizados: Canabidiol (CBD) + Delta-9-THC' : 'Canabidiol (CBD) Broad Spectrum (0% THC)',
      concentration: '10mg a 20mg por goma (Verificar rótulo)',
      pharmaceuticalForm: 'Gomas Mastigáveis (Forma Farmacêutica Comestível)',
      quantity: '01 Frasco',
      administrationRoute: 'Via Oral (Comestível)',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Sinergia terapêutica e fácil administração.',
      usageInstructions: '• Ingerir 1/2 a 1 goma mastigável, 1 vez ao dia. Não ultrapassar 2 gomas ao dia sem orientação médica. Efeito pode demorar até 2h para iniciar.'
    };
  }
  
  if (typeLower.includes('concentrado') || typeLower.includes('extrato pastoso') || nameLower.includes('rick simpson') || nameLower.includes('rso')) {
     return {
      name: pName,
      activeIngredients: 'Fitocanabinoides Altamente Concentrados (CBD ou THC predominante)',
      concentration: 'Alta Potência (Aprox. 700mg a 800mg por grama)',
      pharmaceuticalForm: 'Extrato Concentrado Sólido/Pastoso',
      quantity: '01 Seringa ou Pote (1g a 10g)',
      administrationRoute: 'Via Sublingual ou Vaporização',
      brand: manufacturer,
      origin: prodOrigin,
      description: 'Extrato potente para quadros severos e refratários.',
      usageInstructions: '• Dose inicial do tamanho de um "grão de arroz" via sublingual ou diluído. Altamente potente, titular com extrema cautela.'
    };
  }

  // DEFAULT (ÓLEOS)
  return {
    name: pName,
    activeIngredients: isNational 
      ? 'Extrato Integral de Cannabis Sativa Rico em Canabidiol (CBD)' 
      : 'Canabidiol (CBD) Full Spectrum / Broad Spectrum',
    concentration: 'Variável (Verificar concentração no rótulo)',
    pharmaceuticalForm: 'Solução Oleosa Sublingual (aprox. 20 a 30 gotas por mL)',
    quantity: '01 Frasco de 30ml',
    administrationRoute: 'Via Sublingual',
    brand: manufacturer,
    origin: prodOrigin,
    description: 'Modulação terapêutica do Sistema Endocanabinoide.',
    usageInstructions: '• Pingar as gotas recomendadas sob a língua e aguardar 1 a 2 minutos antes de engolir. (Nota: 1 mL equivale a cerca de 20-30 gotas, consulte o medidor do fabricante).'
  };
}
`;

code = code.replace(/export function enrichMedicationDetails[\s\S]*$/, replacement);

fs.writeFileSync(path, code);
console.log('Fixed enrichMedicationDetails to always return an object');


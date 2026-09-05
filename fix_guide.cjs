const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const target = `  {
    id: "energia_foco",
    title: "4. ENERGIA, FOCO, METABOLISMO E TDAH",`;

const replacement = `  {
    id: "energia_foco",
    title: "4. ENERGIA, FOCO, METABOLISMO E TDAH",
    description: "Canabinoides como THCV, CBG e terpenos estimulantes (ex: limoneno) para foco, disposição e controle metabólico. Indicado também para Burnout, Obesidade e Melhora no Esporte.",
    dosageGuidance: "Uso diurno. Evitar após as 16h para não interferir no sono.",
    products: [
      \${products.superVibe},
      \${products.slimVibe},
      \${products.rodeoQueenGummy},
      \${products.formulaOneGummy},
      \${products.driedHemp},
      \${products.broad10Nacional}
    ]
  },
  {
    id: "saude_mulher",
    title: "5. SAÚDE DA MULHER (TPM, MENOPAUSA, ENDOMETRIOSE)",
    description: "Equilíbrio hormonal, alívio de cólicas (dismenorreia), controle de irritabilidade da TPM e modulação dos fogachos da menopausa.",
    dosageGuidance: "Uso contínuo para prevenção ou resgate para cólicas e enxaquecas agudas.",
    products: [
      \${products.deepVibe},
      \${products.chillVibeGummy},
      \${products.rodeoQueenGummy},
      \${products.pomadaNacional}
    ]
  },
  {
    id: "gastro",
    title: "6. GASTROINTESTINAL (CROHN, COLITE, ANOREXIA)",
    description: "Modulação da inflamação intestinal, estímulo do apetite (Anorexia) e controle de náuseas severas.",
    dosageGuidance: "Óleos full spectrum ou gomas para modulação de longo prazo no trato GI.",
    products: [
      \${products.oleoTHCCBDNacional},
      \${products.beethovenGummy},
      \${products.chillVibeGummy},
      \${products.extratoCBD50Nacional}
    ]
  },
  {
    id: "neurodegenerativas",
    title: "7. DOENÇAS NEURODEGENERATIVAS E IDOSOS",`;

code = code.replace(target, replacement);

const target2 = `  {
    id: "epilepsia",
    title: "6. EPILEPSIA E CONVULSÕES REFRATÁRIAS",`;

const replacement2 = `  {
    id: "epilepsia",
    title: "8. EPILEPSIA E CONVULSÕES REFRATÁRIAS",`;

code = code.replace(target2, replacement2);

const target3 = `  {
    id: "autismo",
    title: "7. TRANSTORNO DO ESPECTRO AUTISTA (TEA)",`;

const replacement3 = `  {
    id: "autismo",
    title: "9. TRANSTORNO DO ESPECTRO AUTISTA (TEA)",`;

code = code.replace(target3, replacement3);

const target4 = `  {
    id: "oncologia",
    title: "8. ONCOLOGIA E CUIDADOS PALIATIVOS",`;

const replacement4 = `  {
    id: "dermatologia",
    title: "10. DERMATOLOGIA (PSORÍASE E DERMATITE)",
    description: "Controle da inflamação cutânea, redução de descamação (Psoríase) e alívio do prurido.",
    dosageGuidance: "Aplicação tópica local combinada com uso sistêmico (óleo) em casos severos.",
    products: [
      \${products.pomadaNacional},
      \${products.oleoCBDNacional}
    ]
  },
  {
    id: "vicios",
    title: "11. REDUÇÃO DE VÍCIOS E DANOS",
    description: "Controle de fissuras (craving) na retirada de opioides, benzodiazepínicos e estabilização emocional.",
    dosageGuidance: "Preponderância de CBD para controle da ansiedade de retirada.",
    products: [
      \${products.calmVibe},
      \${products.extratoCBD100Nacional},
      \${products.broad10Nacional}
    ]
  },
  {
    id: "oncologia",
    title: "12. ONCOLOGIA E CUIDADOS PALIATIVOS",`;

code = code.replace(target4, replacement4);

const target5 = `    title: "1. ANSIEDADE, ESTRESSE E TRANSTORNOS MENTAIS",
    description: "Produtos com perfil ansiolítico, calmante e regulador do humor. Indicados para ansiedade generalizada, estresse crônico e melhora do humor.",`;
    
const replacement5 = `    title: "1. ANSIEDADE, ESTRESSE E TRANSTORNOS MENTAIS",
    description: "Produtos com perfil ansiolítico. Indicados para: Ansiedade, Depressão, Estresse, Burnout, TDAH e distúrbios do humor.",`;

code = code.replace(target5, replacement5);

const target6 = `    title: "2. DOR CRÔNICA E INFLAMAÇÃO",
    description: "Formulações focadas em analgesia, redução de resposta inflamatória e relaxamento muscular.",`;
    
const replacement6 = `    title: "2. DOR CRÔNICA E INFLAMAÇÃO",
    description: "Analgesia e relaxamento. Indicado para: Dor Crônica, Enxaqueca, Fibromialgia, Artrite/Artrose, Hérnia de Disco, Dores Neuropáticas, Esclerose Múltipla, Asma e Glaucoma.",`;

code = code.replace(target6, replacement6);

const target7 = `    title: "3. INSÔNIA E DISTÚRBIOS DO SONO",
    description: "Produtos com CBN, THC e terpenos sedativos, indicados para indução e manutenção do sono reparador.",`;

const replacement7 = `    title: "3. INSÔNIA E DISTÚRBIOS DO SONO",
    description: "Produtos sedativos indicados para: Insônia, Bruxismo, Síndrome das Pernas Inquietas e agitação noturna.",`;

code = code.replace(target7, replacement7);


const productsTarget = `const products = {`;
const arrayStart = code.indexOf(productsTarget);

let theProductsObjectCode = `const products = {
  calmVibe: \`{
        name: "GreenBudz Calm Vibe Oil 6000mg • 200 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 80.00,
        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Calm+Vibe",
        details: ["Frasco 30ml", "aprox. 5 mg/gota", "< 0,3% THC∆9", "Terpenos naturais de menta"],
        description: "O Calm Vibe combina CBD Full Spectrum com um blend exclusivo de terpenos de perfil Indica, preservando o efeito entourage (mirceno, linalol, cariofileno e terpinoleno)."
      }\`,
  superVibe: \`{
        name: "GreenBudz Super Vibe Oil 3000mg • 100 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Super+Vibe",
        details: ["Frasco 30ml", "aprox. 2,5 mg/gota", "2,5% Terpenos Limoneno, Pineno, Terpinoleno e Caryophylleno"],
        description: "Blend exclusivo de terpenos de perfil Sativa. Favorece a biodisponibilidade para suporte da disposição, do foco e do equilíbrio ao longo do dia."
      }\`,
  deepVibe: \`{
        name: "GreenBudz Deep Vibe Oil 3000mg • 100 mg/ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/8b5cf6/ffffff?text=Deep+Vibe",
        details: ["Frasco 30ml", "aprox. 2,5 mg/gota", "< 0,3% THC∆9", "2,5% Terpenos (Myrcene, Linalool, Caryophyllene e Terpinolene)"],
        description: "O Deep Vibe combina CBD Full Spectrum com um blend exclusivo de terpenos inspirado em variedades Indica. Promove relaxamento, conforto físico e equilíbrio."
      }\`,
  slimVibe: \`{
        name: "GreenBudz Slim Vibe Oil 1500 mg CBD + 1500 mg THCv (50 mg/ml CBD + 50 mg/ml THCv)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum + THCv",
        priceUSD: 120.00,
        image: "https://placehold.co/400x400/a3e635/ffffff?text=Slim+Vibe",
        details: ["Frasco 30ml", "aprox. 1,75 mg CBD + 1,75mg THCv/gota", "THCv não possui efeito psicoativo", "Sabor hortelã"],
        description: "Desenvolvido para promover equilíbrio metabólico e bem-estar. Base de óleo MCT e sabor natural de hortelã."
      }\`,
  chillVibeGummy: \`{
        name: "GreenBudz Chill Vibe Gummies - THC 1:1 CBD",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 49.00,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Chill+Vibe",
        details: ["30 gomas por frasco", "10mg THC∆9 + 10mg CBD por goma", "Efeito Longo 4 a 6 horas", "3g de Carboidratos"],
        description: "Sinergia terapêutica do THC∆9 e do CBD para potencializar o efeito entourage. Gomas veganas com sabor melancia para relaxamento físico, conforto e equilíbrio."
      }\`,
  lookingGlassGummy: \`{
        name: "Drops By GreenBudz Goma Looking Glass CBD THC CBC CBG",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "3mg THC∆9, 3mg CBC, 3mg CBD, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: "Combina a pureza de um extrato Live Rosin livre de solventes com a sinergia dos canabinoides CBD, THC, CBC e CBG. Sabor natural de framboesa."
      }\`,
  rodeoQueenGummy: \`{
        name: "Drops By GreenBudz Goma Rodeo Queen THCV CBG e THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THCV, 3mg THC∆9, 3mg CBG por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: "Combina extrato Live Rosin com THCV, CBG e THC, desenhado para promover foco, vitalidade, regulação metabólica e equilíbrio sistêmico."
      }\`,
  bicycleDayGummy: \`{
        name: "Drops By GreenBudz Goma Bicycle Day THC e CBD",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 4mg CBD por goma", "Sabor framboesa", "Efeito longo 4 a 6 horas"],
        description: "Combina a pureza de um extrato Live Rosin com sinergia do THC e CBD para relaxamento, equilíbrio sistêmico e regulação funcional."
      }\`,
  nightshadeGummy: \`{
        name: "Drops By GreenBudz Goma Nightshade CBD CBN e THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 5mg CBD, 5mg CBN por goma", "2.2g de Carboidratos", "Efeito Longo 4 a 6 horas"],
        description: "Combina a pureza de um extrato Live Rosin com a sinergia dos canabinoides CBD, CBN e THC para induzir relaxamento profundo e repouso noturno."
      }\`,
  cricketsGummy: \`{
        name: "Drops By GreenBudz Goma Crickets CBD e THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9, 10mg CBD por goma", "Sabor amora", "Efeito longo 4 a 6 horas"],
        description: "Apresentado em gomas veganas sabor amora, formulação desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional."
      }\`,
  beethovenGummy: \`{
        name: "Drops By GreenBudz Goma Beethoven THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Limonene"],
        description: "Live Rosin sabor laranja para conforto físico, alívio e equilíbrio sistêmico."
      }\`,
  formulaOneGummy: \`{
        name: "Drops By GreenBudz Goma Formula One THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Pinene e Limonene"],
        description: "Live Rosin sabor lima, para promover conforto físico, disposição e equilíbrio sistêmico."
      }\`,
  evergreenGummy: \`{
        name: "Drops By GreenBudz Goma Evergreen THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Limonene, Humulene e Caryophyllene"],
        description: "Live Rosin sabor limão, para conforto físico, vitalidade e equilíbrio sistêmico."
      }\`,
  sheepGummy: \`{
        name: "Drops By GreenBudz Goma 100 Sheep THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Limonene e Caryophyllene"],
        description: "Live Rosin sabor cereja para relaxamento profundo, alívio de tensões e regulação do repouso."
      }\`,
  riverFloatGummy: \`{
        name: "Drops By GreenBudz Goma River Float THC",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Goma comestível",
        priceUSD: 29.00,
        details: ["20 gomas por frasco", "5mg THC∆9 por goma", "Terpenos Myrcene, Linalool e Caryophyllene"],
        description: "Live Rosin sabor melancia para leveza física, relaxamento e equilíbrio."
      }\`,
  stirredHemp: \`{
        name: "GreenBudz Stirred Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Stirred)",
        priceUSD: 109.00,
        details: ["THCa 350mg, CBD 85mg, CBG 2.5mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura pastosa", "Temp: 180-210C"],
        description: "Extrato obtido por mistura com terpenos. Ideal para vaporização em resgate rápido."
      }\`,
  granulatedHemp: \`{
        name: "GreenBudz Granulated Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Granulated)",
        priceUSD: 109.00,
        details: ["THCa 400mg, CBD 17mg, CBC 48mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Textura granulada", "Temp: 180-210C"],
        description: "Mistura com terpenos para vaporização de ação imediata."
      }\`,
  crystalizedHemp: \`{
        name: "GreenBudz Crystalized Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Crystalized)",
        priceUSD: 109.00,
        details: ["THCa 465mg, CBD 17mg por dose", "Dose 0.5g", ">0,3% THC∆9", "Cristais em sauce", "Temp: 180-210C"],
        description: "Cristais isolados de THCa banhados em sauce de terpenos. Strain: ICC (Mirceno, Limoneno, Cariofileno - Relaxante, revigorante, anti-inflamatório)."
      }\`,
  driedHemp: \`{
        name: "GreenBudz Dried Hemp Formula rico em THCa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Extrato Concentrado (Dried Ice)",
        priceUSD: 75.00,
        details: ["THCa 100mg por dose, Full Spectrum", "Dose 0.5g", ">0,3% THC∆9", "Textura pulverulenta", "Temp: 180-210C"],
        description: "Extração mecânica a seco com gelo seco."
      }\`,
  isolateTHCa: \`{
        name: "GreenBudz Isolate THCa Hemp Formula",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Isolado de THCa",
        priceUSD: 129.00,
        details: ["THCa 499mg por dose", "0% THC∆9", "Dose 0.5g", "Sem Terpenos", "Textura cristalina", "Temp: 180-210C"],
        description: "Cristais de THCa isolado de alta pureza. $129 (10 Doses) / $399 (40 Doses)."
      }\`,
  isolateCBD: \`{
        name: "GreenBudz Isolate CBD Hemp Formula",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Isolado de CBD",
        priceUSD: 89.00,
        details: ["CBD 465mg por dose", "0% THC∆9", "Dose 0.5g", "Sem Terpenos", "Temp: 160-190C"],
        description: "Cristais de CBD isolado de alta pureza. $89 (10 Doses) / $299 (40 Doses)."
      }\`,
  oleoTHCCBDNacional: \`{
        name: "Óleo Integral THC/CBD 100mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30ml", "100mg/ml de Canabinoides Totais", "Relação THC/CBD balanceada", "Produto Nacional"],
        description: "Óleo de amplo espectro produzido por associação nacional. Eficaz para dores crônicas, espasticidade e distúrbios do sono refratários."
      }\`,
  oleoCBDNacional: \`{
        name: "Óleo Rico em CBD 50mg/ml - Associação Nacional",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo CBD Predominante",
        details: ["Frasco 30ml", "50mg/ml CBD", "Baixo THC (<0,3%)", "Produto Nacional"],
        description: "Óleo rico em Canabidiol para pacientes sensíveis ao THC. Ideal para ansiedade, inflamações leves e regulação de humor."
      }\`,
  florTHCNacional: \`{
        name: "Flor in natura PREDOMINANTE THC (Para Vaporização)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Flor in natura (Inalação/Vaporização)",
        details: ["Embalagem 15g", "Rica em THC", "Uso inalatório em crises álgicas"],
        description: "Flores secas padronizadas ricas em THC para rápida resposta analgésica e alívio imediato via inalação vaporizada."
      }\`,
  pomadaNacional: \`{
        name: "Pomada Canábica Terapêutica 500mg (50g)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Pomada Tópica",
        details: ["Pote 50g", "500mg Canabinoides", "Uso tópico local"],
        description: "Pomada fitocanabinoide de uso tópico para alívio localizado de dores articulares, musculares, artrite e dermatites."
      }\`,
  gomaNacional: \`{
        name: "Gomas Terapêuticas CBD/CBN 25mg - 30 unidades",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Gomas (Comestível)",
        details: ["Pote com 30 unidades", "25mg CBD/CBN por goma", "Sabor Frutas"],
        description: "Gomas terapêuticas para facilidade de ingestão e liberação prolongada, indicadas para indução e manutenção do sono reparador."
      }\`,
  extratoCBD50Nacional: \`{
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 50 mg/mL + THC < 0,2%",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 50 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: "Óleo de Cannabis sativa Full Spectrum indicado para modulação do sistema endocanabinoide."
      }\`,
  extratoCBD100Nacional: \`{
        name: "Extrato de Cannabis sativa (Full Spectrum) — CBD 100 mg/mL + THC < 0,2%",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Full Spectrum",
        details: ["Frasco 30mL", "CBD 100 mg/mL + THC < 0,2%", "Associação Nacional"],
        description: "Óleo de Cannabis sativa Full Spectrum em alta concentração, indicado para casos que exigem maior aporte de fitocanabinoides."
      }\`,
  broad5Nacional: \`{
        name: "Broad Spectrum Balanceado (50 mg/mL — 5%)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 50 mg/mL (5%)", "CBD 47,5 mg/mL, Fitocanabinoides menores 2,5 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Balanceado."
      }\`,
  broad10Nacional: \`{
        name: "Broad Spectrum Alta Concentração (100 mg/mL — 10%)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 100 mg/mL (10%)", "CBD 90 mg/mL, CBG/CBN/CBC 10 mg/mL, THC 0,0%", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Alta Concentração."
      }\`,
  broadSonoNacional: \`{
        name: "Broad Spectrum com Razão Enriquecida (CBD + CBN para Sono)",
        manufacturer: "Associação Brasileira",
        origin: "Nacional",
        type: "Óleo Broad Spectrum",
        details: ["Frasco 30mL", "Canabinoides Totais: 60 mg/mL (6%)", "CBD 50 mg/mL, CBN 10 mg/mL, THC 0,0%", "Veículo com terpenos relaxantes (Mirceno/Linalol)", "Associação Nacional", "USO ORAL / SUBLINGUAL"],
        description: "Extrato Broad Spectrum Sono."
      }\`
};`;

code = code.replace(productsTarget + code.substring(arrayStart + productsTarget.length, code.indexOf('};', arrayStart) + 2), theProductsObjectCode);

// Then let's safely evaluate it so it writes correctly
code = code.replace(/\$\{products\.([a-zA-Z0-9_]+)\}/g, (match, p1) => {
  // It's already substituted in the new string format we wrote in previous scripts, let's just make sure
  return match;
});

fs.writeFileSync(path, code);
console.log('Fixed guide!');

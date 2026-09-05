const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const target1 = `const OBJECTIVES_MAIN = [
  { id: 'sono', title: 'Melhora do Sono', desc: 'Ajuda para dormir e manter o descanso.' },
  { id: 'calma', title: 'Equilíbrio emocional', desc: 'Controle da agitação e do nervosismo diário.' },
  { id: 'foco', title: 'Aumento do Foco', desc: 'Mais concentração nas suas atividades.' },
  { id: 'estresse', title: 'Menos Estresse', desc: 'Melhora do estresse e exaustão diária.' },
  { id: 'ansiedade', title: 'Controle da Ansiedade', desc: 'Busca por mais equilíbrio emocional.' },
  { id: 'dor', title: 'Dor Crônica', desc: 'Alívio de dores constantes.' },
  { id: 'esporte', title: 'Melhora no Esporte', desc: 'Mais energia e menos fadiga muscular.' },
  { id: 'libido', title: 'Aumento da Libido', desc: 'Recupere a sensação de prazer.' },
  { id: 'enxaqueca', title: 'Enxaqueca', desc: 'Alívio para dores de cabeça fortes.' },
  { id: 'tpm', title: 'Controle da TPM', desc: 'Controle para mudanças de humor e irritação.' },
];`;

// The user wants ALL conditions and motives registered in the app to be in the "Guia Completo".
// We just added these descriptions and mappings to cbdGuide.ts.

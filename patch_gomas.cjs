const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

const descriptions = {
  "Drops By GreenBudz Goma Looking Glass CBD THC CBC CBG": "O Drops By GreenBudz Looking Glass combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides CBD, THC, CBC e CBG, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de framboesa, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma River Float THC": "O Drops By GreenBudz River Float combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de melancia, sua formulação foi desenhada para promover leveza física, relaxamento e equilíbrio, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma Bicycle Day THC e CBD": "O Drops By GreenBudz Bicycle Day combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do CBD e do THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de framboesa, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma Crickets CBD e THC": "O Drops By GreenBudz Crickets combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do CBD e do THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de amora, sua formulação foi desenhada para promover relaxamento, equilíbrio sistêmico e regulação funcional, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma 100 Sheep THC": "O Drops By GreenBudz 100 Sheep combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de cereja, sua formulação foi desenhada para promover relaxamento profundo, alívio de tensões e regulação do repouso, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma Nightshade CBD CBN e THC": "O Drops By GreenBudz Nightshade combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides CBD, CBN e THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar, sua formulação foi desenhada para induzir relaxamento profundo e repouso noturno, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma Rodeo Queen THCV CBG e THC": "O Drops By GreenBudz Rodeo Queen combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica dos canabinoides THCV, CBG e THC, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar, sua formulação foi desenhada para promover foco, vitalidade, regulação metabólica e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma Formula One THC": "O Drops By GreenBudz Formula One combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de lima, sua formulação foi desenhada para promover conforto físico, disposição e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma Beethoven THC": "O Drops By GreenBudz Beethoven combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de laranja, sua formulação foi desenhada para promover conforto físico, alívio e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar.",
  "Drops By GreenBudz Goma Evergreen THC": "O Drops By GreenBudz Evergreen combina a pureza de um extrato Live Rosin livre de solventes com a sinergia terapêutica do THC e de terpenos selecionados, desenvolvido para potencializar o efeito entourage. Apresentado em gomas veganas de pectina com açúcar e sabor natural de limão, sua formulação foi desenhada para promover conforto físico, vitalidade e equilíbrio sistêmico, proporcionando uma experiência terapêutica limpa e de alto bem-estar."
};

for (const [name, desc] of Object.entries(descriptions)) {
  let idx = 0;
  while(true) {
    let nameIdx = code.indexOf(`name: "${name}"`, idx);
    if(nameIdx === -1) break;
    
    let descStart = code.indexOf(`description: "`, nameIdx);
    if(descStart !== -1 && descStart < nameIdx + 500) {
      let descEnd = code.indexOf(`"`, descStart + 14);
      code = code.substring(0, descStart) + `description: \`${desc}\`` + code.substring(descEnd + 1);
    }
    idx = nameIdx + 10;
  }
}

fs.writeFileSync(path, code);
console.log('Updated gomas');

const fs = require('fs');

const adminPath = 'src/store/useAdminStore.ts';
let adminCode = fs.readFileSync(adminPath, 'utf8');

const newText = `🔥 PROMOÇÕES ATIVAS 🔥\n\n• Drops Day&Night: 15% OFF (NIGHTSHADE + FORMULA ONE).\n• Combo para Dormir bem: Compre 2x óleos Deep Vibe e ganhe uma NIGHTSHADE.\n• Combo para ser Produtivo: Compre 2x óleos Super Vibe e ganhe uma FORMULA ONE.\n• Linha vibe na sua rotina: 15% OFF no combo SUPER e DEEP vibe.\n• Foco mental com THCV: 15% OFF no SLIM VIBE.\n• Formula de 40 Servings: Leve outra de 10 Servings com 50% OFF.\n• 2x Formulas da mesma Strain: Leve a segunda com 20% OFF (10 ou 40 Servings).\n• 2x Dried Formula da Strain BM: De 40 servings, leve a segunda com 30% OFF.`;

adminCode = adminCode.replace(/promotionsText:\s*'[^']*'/, "promotionsText: '" + newText + "'");

fs.writeFileSync(adminPath, adminCode);

console.log('Updated promotions in store code');

const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetAllProductsGrid = `className="p-5 rounded-2xl bg-mecura-surface border border-mecura-elevated hover:border-mecura-neon/40 transition-all flex flex-col h-full shadow-lg"`;
const replaceAllProductsGrid = `className="p-5 rounded-2xl bg-mecura-surface border border-mecura-elevated hover:border-mecura-neon/40 transition-all flex flex-col h-full shadow-lg cursor-pointer hover:bg-white/5"\n                    onClick={() => setSelectedProduct(product)}`;

code = code.replace(targetAllProductsGrid, replaceAllProductsGrid);

const targetMobileCard = `className="bg-mecura-surface p-4 rounded-xl border border-mecura-elevated"`;
const replaceMobileCard = `className="bg-mecura-surface p-4 rounded-xl border border-mecura-elevated cursor-pointer hover:border-mecura-neon/40 hover:bg-white/5 transition-colors"\n                    onClick={() => setSelectedProduct({ ...product, categoryName: category.title, categoryIndications: category.indicationsList || [] })}`;

code = code.replace(targetMobileCard, replaceMobileCard);

const targetDesktopTable = `<tr key={idx} className="hover:bg-white/5 transition-colors group">`;
const replaceDesktopTable = `<tr key={idx} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedProduct({ ...product, categoryName: category.title, categoryIndications: category.indicationsList || [] })}>`;

code = code.replace(targetDesktopTable, replaceDesktopTable);

fs.writeFileSync(path, code);
console.log('Added onClick to cards');

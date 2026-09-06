const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetMobileCard = `className="p-4 rounded-xl bg-[#0E0E14] border border-mecura-elevated hover:border-mecura-neon/40 transition-all space-y-2.5"`;
const replaceMobileCard = `className="p-4 rounded-xl bg-[#0E0E14] border border-mecura-elevated hover:border-mecura-neon/40 transition-all space-y-2.5 cursor-pointer hover:bg-white/5"\n                          onClick={() => setSelectedProduct({ ...product, categoryName: category.title, categoryIndications: category.indicationsList || [] })}`;

if(code.includes(targetMobileCard)) {
  code = code.replace(targetMobileCard, replaceMobileCard);
  fs.writeFileSync(path, code);
  console.log('Fixed mobile onClick');
} else {
  console.log('Target not found for mobile card');
}

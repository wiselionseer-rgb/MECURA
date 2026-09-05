const fs = require('fs');

const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

// For mobile
code = code.replace(
  `<strong className="text-mecura-pearl">Princípio Ativo:</strong> {enriched.activeIngredients}`,
  `<strong className="text-mecura-pearl">Princípio Ativo:</strong> {enriched.activeIngredients} - {enriched.concentration}`
);

// For desktop
code = code.replace(
  `<strong className="text-mecura-pearl">Princípio Ativo:</strong> {enriched.activeIngredients}`,
  `<strong className="text-mecura-pearl">Princípio Ativo:</strong> {enriched.activeIngredients} - {enriched.concentration}`
);

fs.writeFileSync(path, code);

const fs = require('fs');

const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

// I also need to make sure the CBDGuideView renders the "administrationRoute" properly 
// instead of hardcoding "Via Sublingual / Comestível".
// Around line 692 of CBDGuideView.tsx:
const target = `{enriched.pharmaceuticalForm} • {enriched.quantity}`;
const replacement = `{enriched.pharmaceuticalForm} • {enriched.quantity}
                              {enriched.administrationRoute && <span className="block mt-0.5"><span className="font-bold">Via:</span> {enriched.administrationRoute}</span>}`;
code = code.replace(target, replacement);

fs.writeFileSync(path, code);
console.log('Fixed CBDGuideView to show administrationRoute');

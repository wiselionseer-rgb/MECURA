const fs = require('fs');

const path = 'src/utils/aiAnalysisFallback.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `name: "IgniteCBD by Isospec Health 1200mg:1200mg CBD:CBG - 30ml - Mint"`,
  `name: "GreenBudz Super Vibe Oil 3000mg • 100 mg/ml"`
);

code = code.replace(
  `name: "IgniteCBD by Isospec Health 1200mg:1200mg CBD:CBN - 30ml - Mint"`,
  `name: "Drops By GreenBudz Goma Nightshade CBD CBN e THC"`
);

fs.writeFileSync(path, code);
console.log("Patched fallback");

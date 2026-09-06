const fs = require('fs');
const catalogPath = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(catalogPath, 'utf8');

// The user mentioned "Broad Spectrum e nacional" so we need to ensure the catalog
// actually reflects this so the AI knows.

// Replace origin: "Importado" with origin: "Nacional" for all "Broad Spectrum" and "Isolate"
// We need to carefully do this.
const lines = code.split('\n');
let insideBroad = false;
let currentName = '';

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('name:')) {
    currentName = lines[i];
  }
  if (lines[i].includes('origin:') && currentName.toLowerCase().includes('broad spectrum')) {
    lines[i] = lines[i].replace('"Importado"', '"Nacional"').replace("'Importado'", "'Nacional'");
  }
}

fs.writeFileSync(catalogPath, lines.join('\n'));

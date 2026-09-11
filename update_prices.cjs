const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove all priceBRL
code = code.replace(/\s*priceBRL:\s*\d+(\.\d+)?,/g, '');

const newPrices = [
  { match: "Stirred Hemp Formula", price: 109 },
  { match: "Granulated Hemp Formula", price: 109 },
  { match: "Crystalized Hemp Formula", price: 109 },
  { match: "Dried Hemp Formula", price: 75 },
  { match: "Isolate THCa Hemp Formula", price: 129 },
  { match: "Isolate CBD Hemp Formula", price: 89 },
  { match: "Calm Vibe Oil", price: 80 },
  { match: "Super Vibe Oil", price: 60 },
  { match: "Deep Vibe Oil", price: 60 },
  { match: "Slim Vibe Oil", price: 120 },
  { match: "Chill Vibe Gummies", price: 49 },
  { match: "Looking Glass", price: 29 },
  { match: "Rodeo Queen", price: 29 },
  { match: "Bicycle Day", price: 29 },
  { match: "Nightshade", price: 29 },
  { match: "Crickets", price: 29 },
  { match: "Beethoven", price: 29 },
  { match: "Formula One", price: 29 },
  { match: "Evergreen", price: 29 },
  { match: "100 Sheep", price: 29 },
  { match: "River Float", price: 29 }
];

// Let's split by '{' and '}' which define objects, and update them.
let newCode = "";
let blocks = code.split('origin:');

for (let i = 0; i < blocks.length; i++) {
  if (i === 0) {
    newCode += blocks[i];
    continue;
  }
  
  let block = blocks[i];
  
  if (block.includes('"Importado"')) {
    // See which name it matched
    // The previous block ends with name: "...." 
    const prevBlock = blocks[i-1];
    const nameMatch = prevBlock.match(/name:\s*"([^"]+)"\s*,\s*manufacturer/);
    if (nameMatch) {
       let pName = nameMatch[1];
       for (const np of newPrices) {
         if (pName.includes(np.match)) {
           // update priceUSD in the current block
           block = block.replace(/priceUSD:\s*\d+(\.\d+)?,/, `priceUSD: ${np.price}.00,`);
           break;
         }
       }
    }
  }
  newCode += 'origin:' + block;
}

fs.writeFileSync(path, newCode);
console.log("Success updating prices");

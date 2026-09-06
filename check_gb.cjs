const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
const code = fs.readFileSync(path, 'utf8');
const products = [];

const regex = /name:\s*"([^"]+)",\s*manufacturer:\s*"GreenBudzCBD"[^}]+priceUSD:\s*([\d.]+)/g;
let match;
while ((match = regex.exec(code)) !== null) {
  products.push({ name: match[1], price: match[2] });
}

console.log(JSON.stringify(products, null, 2));

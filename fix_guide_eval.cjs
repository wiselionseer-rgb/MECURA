const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// The file currently has literal \${products.xxx} in the exported array.
// Let's parse out the products object from the file and replace them.

const productsMatch = code.match(/const products = \{[\s\S]*?\n\};/);
if (productsMatch) {
  const productsCode = productsMatch[0];
  const evalFunc = new Function(productsCode + ' return products;');
  const productsObj = evalFunc();
  
  code = code.replace(/\$\{products\.([a-zA-Z0-9_]+)\}/g, (match, p1) => {
    return productsObj[p1] || match;
  });
  
  fs.writeFileSync(path, code);
  console.log('Evaluated and replaced product references');
} else {
  console.log('Could not find products object');
}

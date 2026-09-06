const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

let count = 0;
code = code.replace(/\{([^{}]+origin:\s*"Importado"[^{}]+)\}/g, (match, inner) => {
    if (!inner.includes('GreenBudz')) {
        let updated = match.replace(/origin:\s*"Importado"/, 'origin: "Nacional"');
        updated = updated.replace(/priceUSD:\s*([\d.]+)/, (m, price) => {
            return "priceBRL: " + (parseFloat(price) * 5.1).toFixed(2);
        });
        count++;
        return updated;
    }
    return match;
});

fs.writeFileSync(path, code);
console.log('Converted non-Greenbudz imported products to Nacional: ' + count);

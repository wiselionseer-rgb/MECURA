const fs = require('fs');
let code = fs.readFileSync('src/data/cbdGuide.ts', 'utf-8');

const targetInterface = `export interface CBDProduct {
  name: string;
  manufacturer: string;
  origin: string;
  type: string;
  activeIngredients?: string;
  concentration?: string;
  pharmaceuticalForm?: string;
  quantity?: string;
  administrationRoute?: string;
  image?: string;
  details?: string[];
  italicText?: string;
  description?: string;
  priceUSD?: number;
}`;

// Use regex to avoid whitespace issues
const regex = /export interface CBDProduct\s*\{[\s\S]*?priceUSD\?: number;\s*\}/;

const match = code.match(regex);
if (match) {
    const newInterface = match[0].replace('priceUSD?: number;', 'priceUSD?: number;\n  priceBRL?: number;\n  indications?: string;');
    code = code.replace(regex, newInterface);
    fs.writeFileSync('src/data/cbdGuide.ts', code);
    console.log("Patched successfully");
} else {
    console.log("Could not match regex");
}

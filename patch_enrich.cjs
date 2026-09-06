const fs = require('fs');
const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// Update signature
code = code.replace(
  /export function enrichMedicationDetails\([\s\S]*?\): EnrichedMedicationInfo {/,
  `export function enrichMedicationDetails(
  productName: string, 
  brand?: string, 
  origin?: string, 
  type?: string,
  product?: CBDProduct
): EnrichedMedicationInfo {`
);

// We need to intercept all returns. Let's rename the original function.
code = code.replace(
  `export function enrichMedicationDetails(`,
  `function _enrichMedicationDetails(`
);

// Add the wrapper
code += `
export function enrichMedicationDetails(
  productName: string, 
  brand?: string, 
  origin?: string, 
  type?: string,
  product?: CBDProduct
): EnrichedMedicationInfo {
  const result = _enrichMedicationDetails(productName, brand, origin, type, product);
  
  if (product) {
    if (product.usageInstructions) result.usageInstructions = product.usageInstructions;
    if (product.activeIngredients) result.activeIngredients = product.activeIngredients;
    if (product.concentration) result.concentration = product.concentration;
    if (product.pharmaceuticalForm) result.pharmaceuticalForm = product.pharmaceuticalForm;
    if (product.quantity) result.quantity = product.quantity;
    if (product.administrationRoute) result.administrationRoute = product.administrationRoute;
  }
  
  return result;
}
`;

fs.writeFileSync(path, code);

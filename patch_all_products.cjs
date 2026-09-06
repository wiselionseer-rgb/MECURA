const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

const target = `  const allProducts = React.useMemo(() => {
    const products = [];
    productCategories.forEach(cat => {
      cat.products.forEach(prod => {
        products.push({ 
          ...prod, 
          categoryId: cat.id, 
          categoryName: cat.title,
          categoryIndications: cat.indicationsList || []
        });
      });
    });
    return products.sort((a, b) => a.name.localeCompare(b.name));
  }, [productCategories]);`;

const replace = `  const allProducts = React.useMemo(() => {
    const productsMap = new Map();
    productCategories.forEach(cat => {
      cat.products.forEach(prod => {
        if (!productsMap.has(prod.name)) {
          productsMap.set(prod.name, { 
            ...prod, 
            categoryId: cat.id, 
            categoryName: cat.title,
            categoryIndications: cat.indicationsList || []
          });
        } else {
          const existing = productsMap.get(prod.name);
          existing.categoryIndications = Array.from(new Set([...existing.categoryIndications, ...(cat.indicationsList || [])]));
        }
      });
    });
    return Array.from(productsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [productCategories]);`;

if(code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync(path, code);
  console.log('Fixed duplicate products in CBDGuideView');
} else {
  console.log('Target not found');
}

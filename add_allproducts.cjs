const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

const allDiseasesBlock = `  const allDiseases = React.useMemo(() => {
    const diseases = [];
    productCategories.forEach(cat => {
      if (cat.indicationsList) {
        cat.indicationsList.forEach(ind => {
          diseases.push({ name: ind, category: cat });
        });
      }
    });
    return diseases.sort((a, b) => a.name.localeCompare(b.name));
  }, [productCategories]);`;

const allProductsBlock = `  const allProducts = React.useMemo(() => {
    const products = [];
    productCategories.forEach(cat => {
      cat.products.forEach(prod => {
        products.push({ ...prod, categoryId: cat.id, categoryName: cat.title });
      });
    });
    return products.sort((a, b) => a.name.localeCompare(b.name));
  }, [productCategories]);`;

code = code.replace(allDiseasesBlock, allDiseasesBlock + '\n\n' + allProductsBlock);

fs.writeFileSync(path, code);
console.log('Added allProducts state');

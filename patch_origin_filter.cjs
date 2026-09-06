const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('const [originFilter, setOriginFilter]')) {
  code = code.replace(
    "const [viewMode, setViewMode] = useState<'categories' | 'diseases' | 'all_products'>('categories');",
    "const [viewMode, setViewMode] = useState<'categories' | 'diseases' | 'all_products'>('categories');\n  const [originFilter, setOriginFilter] = useState<'all' | 'nacional' | 'importado'>('all');"
  );
}

const allProductsRegex = /const allProducts = React\.useMemo\(\(\) => \{[\s\S]*?products\.push\(\{ \.\.\.prod, categoryId: cat\.id, categoryName: cat\.title \}\);[\s\S]*?return products\.sort\(\(a, b\) => a\.name\.localeCompare\(b\.name\)\);\n  \}, \[productCategories\]\);/;

const newAllProducts = `const allProducts = React.useMemo(() => {
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

code = code.replace(allProductsRegex, newAllProducts);

fs.writeFileSync(path, code);
console.log('Done patching originFilter state and allProducts logic');

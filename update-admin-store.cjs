const fs = require('fs');
let code = fs.readFileSync('src/store/useAdminStore.ts', 'utf-8');

if (!code.includes("import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';")) {
  code = `import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';\n` + code;
}

if (!code.includes("productCategories: CBDCategory[];")) {
  const targetInterface = `  catalogUrl: string;
  setCatalogUrl: (url: string) => void;
}`;
  const replacementInterface = `  catalogUrl: string;
  setCatalogUrl: (url: string) => void;
  productCategories: CBDCategory[];
  setProductCategories: (categories: CBDCategory[]) => void;
  addProduct: (categoryId: string, product: CBDProduct) => void;
  updateProduct: (categoryId: string, productName: string, product: Partial<CBDProduct>) => void;
  deleteProduct: (categoryId: string, productName: string) => void;
}`;
  code = code.replace(targetInterface, replacementInterface);
}

if (!code.includes("productCategories: cbdGuideData,")) {
  const targetInitialState = `      catalogUrl: 'https://drive.google.com/file/d/1QvJjJlj6gLaljo4-Jp0XhStUbwn_yYBA/preview?usp=drive_link',
      setCatalogUrl: (url) => set({ catalogUrl: url }),`;
  const replacementInitialState = `      catalogUrl: 'https://drive.google.com/file/d/1QvJjJlj6gLaljo4-Jp0XhStUbwn_yYBA/preview?usp=drive_link',
      setCatalogUrl: (url) => set({ catalogUrl: url }),
      productCategories: cbdGuideData,
      setProductCategories: (categories) => set({ productCategories: categories }),
      addProduct: (categoryId, product) => set((state) => ({
        productCategories: state.productCategories.map(c => 
          c.id === categoryId ? { ...c, products: [...c.products, product] } : c
        )
      })),
      updateProduct: (categoryId, productName, productData) => set((state) => ({
        productCategories: state.productCategories.map(c => 
          c.id === categoryId ? { 
            ...c, 
            products: c.products.map(p => p.name === productName ? { ...p, ...productData } : p) 
          } : c
        )
      })),
      deleteProduct: (categoryId, productName) => set((state) => ({
        productCategories: state.productCategories.map(c => 
          c.id === categoryId ? { 
            ...c, 
            products: c.products.filter(p => p.name !== productName) 
          } : c
        )
      })),`;
  code = code.replace(targetInitialState, replacementInitialState);
}

fs.writeFileSync('src/store/useAdminStore.ts', code);

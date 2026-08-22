const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetUseAdminStore = `  const { 
    doctors, addDoctor, updateDoctor, deleteDoctor,
    coupons, addCoupon, deleteCoupon,
    notifications, addNotification, deleteNotification,
    promotionsText, setPromotionsText,
    catalogUrl, setCatalogUrl
  } = useAdminStore();`;

const replacementUseAdminStore = `  const { 
    doctors, addDoctor, updateDoctor, deleteDoctor,
    coupons, addCoupon, deleteCoupon,
    notifications, addNotification, deleteNotification,
    promotionsText, setPromotionsText,
    catalogUrl, setCatalogUrl,
    productCategories, addProduct, updateProduct, deleteProduct
  } = useAdminStore();`;

if (code.includes(targetUseAdminStore)) {
    code = code.replace(targetUseAdminStore, replacementUseAdminStore);
} else {
    // maybe spaces are slightly different, so use a regex
    const regex = /const \{\s*doctors,[\s\S]*?catalogUrl, setCatalogUrl\s*\} = useAdminStore\(\);/;
    const match = code.match(regex);
    if (match) {
        let block = match[0].replace('catalogUrl, setCatalogUrl', 'catalogUrl, setCatalogUrl,\n    productCategories, addProduct, updateProduct, deleteProduct');
        code = code.replace(regex, block);
    }
}
fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

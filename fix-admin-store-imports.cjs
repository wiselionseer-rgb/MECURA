const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetUseAdminStore = `  const { 
    doctors, 
    addDoctor, 
    updateDoctor, 
    deleteDoctor, 
    coupons, 
    addCoupon, 
    updateCoupon, 
    deleteCoupon,
    promotionsText,
    setPromotionsText,
    catalogUrl,
    setCatalogUrl,
    notifications,
    addNotification,
    deleteNotification
  } = useAdminStore();`;

const replacementUseAdminStore = `  const { 
    doctors, 
    addDoctor, 
    updateDoctor, 
    deleteDoctor, 
    coupons, 
    addCoupon, 
    updateCoupon, 
    deleteCoupon,
    promotionsText,
    setPromotionsText,
    catalogUrl,
    setCatalogUrl,
    notifications,
    addNotification,
    deleteNotification,
    productCategories,
    addProduct,
    updateProduct,
    deleteProduct
  } = useAdminStore();`;
code = code.replace(targetUseAdminStore, replacementUseAdminStore);
fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);

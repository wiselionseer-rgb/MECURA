const fs = require('fs');

const adminPath = 'src/store/useAdminStore.ts';
let adminCode = fs.readFileSync(adminPath, 'utf8');
adminCode = adminCode.replace(/\/catalogo-inalada\.pdf/g, 'https://drive.google.com/file/d/1X5dDlzrVQ5bENVFd8He96OB-TT39gA8Z/preview');
adminCode = adminCode.replace(/\/catalogo-oral\.pdf/g, 'https://drive.google.com/file/d/1RkfK1c76aaiyLnSeVxSsFif8WAEi3aU_/preview');
fs.writeFileSync(adminPath, adminCode);

const pharmacyPath = 'src/screens/PharmacyScreen.tsx';
let pharmacyCode = fs.readFileSync(pharmacyPath, 'utf8');
pharmacyCode = pharmacyCode.replace(/\/catalogo-inalada\.pdf/g, 'https://drive.google.com/file/d/1X5dDlzrVQ5bENVFd8He96OB-TT39gA8Z/preview');
pharmacyCode = pharmacyCode.replace(/\/catalogo-oral\.pdf/g, 'https://drive.google.com/file/d/1RkfK1c76aaiyLnSeVxSsFif8WAEi3aU_/preview');
fs.writeFileSync(pharmacyPath, pharmacyCode);

console.log('Links updated');

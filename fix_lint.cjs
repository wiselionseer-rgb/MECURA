const fs = require('fs');

// Fix DoctorDashboardScreen.tsx
let docCode = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf-8');
docCode = docCode.replace(
  "          productData: item",
  "          productData: { ...item, image: '', details: [], description: item.description || '', brand: item.brand || '', origin: item.origin || '' }"
);
fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', docCode);

// Fix pdfGenerator.tsx
let pdfCode = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');
pdfCode = pdfCode.replace(
  "    image: { type: 'jpeg', quality: 1 },",
  "    image: { type: 'jpeg' as const, quality: 1 },"
);
fs.writeFileSync('src/utils/pdfGenerator.tsx', pdfCode);


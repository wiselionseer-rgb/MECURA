const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

if (!code.includes("import { cbdGuideData }")) {
  code = code.replace("import { useAdminStore } from '../store/useAdminStore';", "import { useAdminStore } from '../store/useAdminStore';\nimport { cbdGuideData } from '../data/cbdGuide';");
}

code = code.replace("const { productCategories } = useAdminStore();", "const { productCategories: storeProductCategories } = useAdminStore();\n  const productCategories = cbdGuideData; // Force using latest code data to include newly added meds");

fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/CBDGuideView.tsx', 'utf8');

if(!code.includes("import { cbdGuideData }")) {
    code = code.replace("import { useAdminStore } from '../store/useAdminStore';", "import { useAdminStore } from '../store/useAdminStore';\nimport { cbdGuideData } from '../data/cbdGuide';");
}

code = code.replace("const { productCategories } = useAdminStore();", "const { productCategories: storeCategories } = useAdminStore();\n  const productCategories = cbdGuideData;");

fs.writeFileSync('src/components/CBDGuideView.tsx', code);
console.log("Patched CBDGuideView");

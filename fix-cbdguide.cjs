const fs = require('fs');
let code = fs.readFileSync('src/components/CBDGuideView.tsx', 'utf-8');

if (!code.includes("import { useAdminStore } from '../store/useAdminStore';")) {
    code = `import { useAdminStore } from '../store/useAdminStore';\n` + code;
}

if (!code.includes("const { productCategories } = useAdminStore();")) {
    const targetComp = `export function CBDGuideView() {`;
    const replacementComp = `export function CBDGuideView() {
  const { productCategories } = useAdminStore();`;
    code = code.replace(targetComp, replacementComp);
}

// Replace references to cbdGuideData with productCategories (excluding the import)
code = code.replace(/\bcbdGuideData\b/g, (match, offset) => {
    // Check if it's the import statement
    const precedingText = code.substring(Math.max(0, offset - 30), offset);
    if (precedingText.includes('import {') || precedingText.includes('import  {')) {
        return match; // don't replace
    }
    return 'productCategories';
});

fs.writeFileSync('src/components/CBDGuideView.tsx', code);

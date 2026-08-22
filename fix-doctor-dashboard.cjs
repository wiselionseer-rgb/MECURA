const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf-8');

if (!code.includes("const { productCategories } = useAdminStore();")) {
    const targetState = `const { doctors, addDoctor, updateDoctor, deleteDoctor } = useAdminStore();`;
    const replacementState = `const { doctors, addDoctor, updateDoctor, deleteDoctor, productCategories } = useAdminStore();`;
    code = code.replace(targetState, replacementState);
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

fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code);

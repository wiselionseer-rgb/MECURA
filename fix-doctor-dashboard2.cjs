const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf-8');

if (!code.includes("import { useAdminStore }")) {
    code = `import { useAdminStore } from '../store/useAdminStore';\n` + code;
}

if (!code.includes("const { productCategories } = useAdminStore();")) {
    const targetComp = `export function DoctorDashboardScreen() {`;
    const replacementComp = `export function DoctorDashboardScreen() {
  const { productCategories } = useAdminStore();`;
    code = code.replace(targetComp, replacementComp);
}

fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code);

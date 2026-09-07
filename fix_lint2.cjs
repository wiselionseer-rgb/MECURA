const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetImport = `  X, Key, AlertTriangle
, Edit3, Check, LogOut, RefreshCw, BrainCircuit } from 'lucide-react';`;

const newImport = `  X, Key, AlertTriangle
, Edit3, Check, LogOut, RefreshCw } from 'lucide-react';`;

if(code.includes(targetImport)) {
  code = code.replace(targetImport, newImport);
  fs.writeFileSync(path, code);
  console.log("Success patching lint");
} else {
  console.log("Target import not found");
}

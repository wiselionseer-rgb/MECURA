const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetParse = `        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bObservações\\b|$)/is);
        const dosageMatch = block.match(/\\bModo de Uso\\b.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bObservações\\b|$)/is);
        const instructionsMatch = block.match(/\\bObservações\\b.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|$)/is);`;

const newParse = `        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bPosologia\\b|\\bPosologia\\/Uso\\b|\\bObservações\\b|\\bObservação Clínica\\b|$)/is);
        const dosageMatch = block.match(/(?:\\bModo de Uso\\b|\\bPosologia\\b|\\bPosologia\\/Uso\\b).*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bObservações\\b|\\bObservação Clínica\\b|$)/is);
        const instructionsMatch = block.match(/(?:\\bObservações\\b|\\bObservação Clínica\\b).*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bPosologia\\b|\\bPosologia\\/Uso\\b|$)/is);`;

if(code.includes(targetParse)) {
  code = code.replace(targetParse, newParse);
  fs.writeFileSync(path, code);
  console.log("Success updating parser2");
} else {
  console.log("Target parse not found2");
}

const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetParse = `    // If table parsing found nothing, try the list format with regex to handle inline fields
    if (medications.length === 0) {
      const blocks = text.split(/\\bMedicamento\\b/i);
      for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];
        
        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bObservações\\b|$)/is);
        const dosageMatch = block.match(/\\bModo de Uso\\b.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bObservações\\b|$)/is);
        const instructionsMatch = block.match(/\\bObservações\\b.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|$)/is);`;

const newParse = `    // If table parsing found nothing, try the list format with regex to handle inline fields
    if (medications.length === 0) {
      const blocks = text.split(/\\bMedicamento\\b/i);
      for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];
        
        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?(?:[:\\-]\\s*|\\s+)(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bObservações\\b|$)/is);
        const dosageMatch = block.match(/\\bModo de Uso\\b.*?(?:[:\\-]\\s*|\\s+)(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bObservações\\b|$)/is);
        const instructionsMatch = block.match(/\\bObservações\\b.*?(?:[:\\-]\\s*|\\s+)(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|$)/is);`;

if(code.includes(targetParse)) {
  code = code.replace(targetParse, newParse);
  fs.writeFileSync(path, code);
  console.log("Success updating parseMedications regex");
} else {
  console.log("Target parse not found");
}

const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetRegex = `        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bObservações\\b|$)/is);
        const dosageMatch = block.match(/\\bModo de Uso\\b.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bObservações\\b|$)/is);
        const instructionsMatch = block.match(/\\bObservações\\b.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|$)/is);`;

const newRegex = `        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bObservações\\b|$)/is);
        const dosageMatch = block.match(/\\bModo de Uso\\b.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bObservações\\b|$)/is);
        const instructionsMatch = block.match(/\\bObservações\\b.*?:\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|$)/is);`;

// I actually don't need to change the regex, just the splitting string which is \bMedicamento\b.
// Let's check how the block splits.

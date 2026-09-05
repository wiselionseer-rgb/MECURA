const fs = require('fs');

const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(`promotionsText.split('
')`, `promotionsText.split('\\n')`);

// Remove any trailing literal newline brackets
let ending = `
                      }
`;
while(code.endsWith('                      }')) {
   code = code.substring(0, code.length - '                      }'.length).trim();
}

// also check if there's any orphaned } at EOF
if(code.trim().endsWith('}')) {
    // maybe it's the export function ending, wait.
}

fs.writeFileSync(path, code);

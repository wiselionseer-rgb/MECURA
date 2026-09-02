const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf-8');

code = code.replace(
  "if (state.inQueue || state.consultationActive || state.isConsultationFinished) {",
  "if (state.patientId) {"
);

fs.writeFileSync('src/store/useStore.ts', code);

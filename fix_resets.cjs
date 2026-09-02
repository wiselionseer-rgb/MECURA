const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf-8');

code = code.replace(
  "resetConsultation: () => set({ ",
  "resetConsultation: () => { if (typeof window !== 'undefined') localStorage.removeItem('mecura_pagamento'); set({ "
);
code = code.replace(
  "resetConsultation: () => { if (typeof window !== 'undefined') localStorage.removeItem('mecura_pagamento'); set({ \n    consultationActive: false,",
  "resetConsultation: () => { if (typeof window !== 'undefined') localStorage.removeItem('mecura_pagamento'); return set({ \n    consultationActive: false,"
);

code = code.replace(
  "reset: () => set({",
  "reset: () => { if (typeof window !== 'undefined') { localStorage.removeItem('mecura_patientId'); localStorage.removeItem('mecura_pagamento'); } return set({"
);

fs.writeFileSync('src/store/useStore.ts', code);

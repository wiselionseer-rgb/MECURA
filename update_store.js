const fs = require('fs');

let code = fs.readFileSync('src/store/useStore.ts', 'utf-8');

// Replace initial state
code = code.replace(
  "patientId: null,",
  "patientId: typeof window !== 'undefined' ? localStorage.getItem('mecura_patientId') : null,"
);

code = code.replace(
  "pagamento_consulta: false,",
  "pagamento_consulta: typeof window !== 'undefined' ? localStorage.getItem('mecura_pagamento') === 'true' : false,"
);

// Replace setPatientId
code = code.replace(
  "setPatientId: (id) => set({ patientId: id }),",
  "setPatientId: (id) => { if (typeof window !== 'undefined') { if (id) localStorage.setItem('mecura_patientId', id); else localStorage.removeItem('mecura_patientId'); } set({ patientId: id }); },"
);

// Replace setPagamentoConsulta
code = code.replace(
  "setPagamentoConsulta: (status) => set({ pagamento_consulta: status }),",
  "setPagamentoConsulta: (status) => { if (typeof window !== 'undefined') { localStorage.setItem('mecura_pagamento', status.toString()); } set({ pagamento_consulta: status }); },"
);

// Update joinQueue
code = code.replace(
  "set({\n      patientId: currentUserId,",
  "if (typeof window !== 'undefined') { localStorage.setItem('mecura_patientId', currentUserId); localStorage.setItem('mecura_pagamento', 'true'); }\n    set({\n      patientId: currentUserId,"
);
code = code.replace(
  "set({ \n      patientId: currentUserId,",
  "if (typeof window !== 'undefined') { localStorage.setItem('mecura_patientId', currentUserId); localStorage.setItem('mecura_pagamento', 'true'); }\n    set({\n      patientId: currentUserId,"
);


fs.writeFileSync('src/store/useStore.ts', code);

const fs = require('fs');
const path = 'src/store/useStore.ts';
let code = fs.readFileSync(path, 'utf8');

const targetType = `  reset: () => void;`;
const newType = `  reset: () => void;
  clearTriage: () => void;`;

if(code.includes(targetType)) {
  code = code.replace(targetType, newType);
}

const targetImpl = `  reset: () => { if (typeof window !== 'undefined') { localStorage.removeItem('mecura_patientId'); localStorage.removeItem('mecura_pagamento'); } return set({`;
const newImpl = `  clearTriage: () => set({
    answers: { objectives: [] },
    onboardingStep: 1,
    hasCompletedOnboarding: false,
    consultationStatus: 'pending',
    isConsultationFinished: false,
    activeConsultationId: null,
    messages: []
  }),
  
  reset: () => { if (typeof window !== 'undefined') { localStorage.removeItem('mecura_patientId'); localStorage.removeItem('mecura_pagamento'); } return set({`;

if(code.includes(targetImpl)) {
  code = code.replace(targetImpl, newImpl);
}

fs.writeFileSync(path, code);
console.log("Success adding clearTriage");

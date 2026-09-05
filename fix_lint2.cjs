const fs = require('fs');

let adminPath = 'src/screens/AdminDashboardScreen.tsx';
let adminCode = fs.readFileSync(adminPath, 'utf8');

// Fix doctorId and patientId missing types
// find "type: 'consultation'" inside the array and update its properties
const badTypeString1 = `doctorId: 'doc_1',
      patientId: 'patient_2',`;
adminCode = adminCode.replace(badTypeString1, '');

fs.writeFileSync(adminPath, adminCode);

// Fix OnboardingScreen.tsx to include the other conditions in OBJECTIVES_MAIN
let onboardPath = 'src/screens/OnboardingScreen.tsx';
let onboardCode = fs.readFileSync(onboardPath, 'utf8');

const newObjectivesMain = `const OBJECTIVES_MAIN = [
  { id: 'ansiedade', title: 'Ansiedade, Estresse e Transtornos Mentais', desc: 'Ansiedade, Depressão, Estresse, Burnout, TDAH e distúrbios do humor.' },
  { id: 'dor', title: 'Dor Crônica e Inflamação', desc: 'Dor Crônica, Enxaqueca, Fibromialgia, Artrite/Artrose, Hérnia de Disco, Esclerose Múltipla, Asma e Glaucoma.' },
  { id: 'sono', title: 'Insônia e Distúrbios do Sono', desc: 'Insônia, Bruxismo, Síndrome das Pernas Inquietas e agitação noturna.' },
  { id: 'energia', title: 'Energia, Foco e Metabolismo', desc: 'Burnout, Obesidade, Melhora no Esporte, Foco, Disposição e controle metabólico.' },
  { id: 'mulher', title: 'Saúde da Mulher', desc: 'TPM, Menopausa, Endometriose, Equilíbrio hormonal e alívio de cólicas.' },
  { id: 'gastro', title: 'Gastrointestinal', desc: 'Doença de Crohn, Colite, Anorexia, Modulação da inflamação intestinal.' },
  { id: 'neuro', title: 'Doenças Neurodegenerativas', desc: 'Parkinson, Alzheimer, Demência e idosos.' },
  { id: 'epilepsia', title: 'Epilepsia e Convulsões Refratárias', desc: 'Controle de crises convulsivas e epilepsia.' },
  { id: 'tea', title: 'Transtorno do Espectro Autista (TEA)', desc: 'Autismo (TEA), regulação sensorial e comportamental.' },
  { id: 'dermato', title: 'Dermatologia', desc: 'Psoríase, Dermatite, controle da inflamação cutânea e alívio do prurido.' },
  { id: 'vicios', title: 'Redução de Vícios e Danos', desc: 'Controle de fissuras (craving) na retirada de medicamentos e vícios.' },
  { id: 'onco', title: 'Oncologia e Cuidados Paliativos', desc: 'Suporte no câncer, cuidados paliativos, dor oncológica e náuseas.' }
];`;

onboardCode = onboardCode.replace(/const OBJECTIVES_MAIN = \[[\s\S]*?\];/, newObjectivesMain);
onboardCode = onboardCode.replace(/const OBJECTIVES_OTHER = \[[\s\S]*?\];/, `const OBJECTIVES_OTHER = ['Outros'];`);

fs.writeFileSync(onboardPath, onboardCode);
console.log('Fixed Onboarding objectives');

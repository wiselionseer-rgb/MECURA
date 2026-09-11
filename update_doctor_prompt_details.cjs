const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetTriage = `        - Histórico Médico e Social COMPLETO: 
          Tratamento Atual (\${patientAnswers?.tratamento_atual ? 'Sim' : 'Não'}), Uso de Fármacos (\${patientAnswers?.remedios ? 'Sim' : 'Não'}), 
          Comorbidade Crônica (\${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}), Cirurgia (\${patientAnswers?.cirurgia ? 'Sim' : 'Não'}), 
          Alergias (\${patientAnswers?.alergia ? 'Sim' : 'Não'}), Problemas Digestivos (\${patientAnswers?.digestivo ? 'Sim' : 'Não'}), 
          Uso Prévio de Cannabis (\${patientAnswers?.cannabis ? 'Sim' : 'Não'}).`;

const newTriage = `        - Histórico Médico e Social COMPLETO: 
          Tratamento Atual (\${patientAnswers?.tratamento_atual ? 'Sim' + (patientAnswers?.tratamento_atual_details ? ': ' + patientAnswers.tratamento_atual_details : '') : 'Não'}), 
          Uso de Fármacos (\${patientAnswers?.remedios ? 'Sim' + (patientAnswers?.remedios_details ? ': ' + patientAnswers.remedios_details : '') : 'Não'}), 
          Comorbidade Crônica (\${patientAnswers?.doenca_cronica ? 'Sim' + (patientAnswers?.doenca_cronica_details ? ': ' + patientAnswers.doenca_cronica_details : '') : 'Não'}), 
          Cirurgia (\${patientAnswers?.cirurgia ? 'Sim' + (patientAnswers?.cirurgia_details ? ': ' + patientAnswers.cirurgia_details : '') : 'Não'}), 
          Alergias (\${patientAnswers?.alergia ? 'Sim' + (patientAnswers?.alergia_details ? ': ' + patientAnswers.alergia_details : '') : 'Não'}), 
          Problemas Digestivos (\${patientAnswers?.digestivo ? 'Sim' + (patientAnswers?.digestivo_details ? ': ' + patientAnswers.digestivo_details : '') : 'Não'}), 
          Uso Prévio de Cannabis (\${patientAnswers?.cannabis ? 'Sim' + (patientAnswers?.cannabis_details ? ': ' + patientAnswers.cannabis_details : '') : 'Não'}).`;

if(code.includes(targetTriage)) {
  code = code.replace(targetTriage, newTriage);
  fs.writeFileSync(path, code);
  console.log("Success updating doctor prompt triage with details");
} else {
  console.log("Target triage not found");
}

const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf-8');

code = code.replace(
  "const objectivesArray = patientAnswers?.objectives || ['Ansiedade'];\n    const objectives = patientAnswers?.objectives?.join(', ') || 'Ansiedade, estresse crônico e dores';",
  "const objectivesArray = (patientAnswers?.objectives && patientAnswers?.objectives?.length > 0) ? patientAnswers.objectives : ['Ansiedade', 'Estresse crônico', 'Dores'];\n    const objectives = objectivesArray.join(', ');"
);

fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code);

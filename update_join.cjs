const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf8');

code = code.replace(
  /await setDoc\(doc\(db, 'queue', currentUserId\), \{\n\s+\.\.\.newPatient,\n\s+joinedAt: new Date\(\)\.toISOString\(\),\n\s+status: 'waiting'\n\s+\}\);/,
  `await setDoc(doc(db, 'queue', currentUserId), {
        ...newPatient,
        joinedAt: new Date().toISOString(),
        status: 'waiting'
      });
      
      triggerAdminBackgroundPush(
        'Novo Paciente na Fila',
        \`\${newPatient.patientName} acabou de entrar na fila de espera.\`,
        '/doctor'
      );`
);

fs.writeFileSync('src/store/useStore.ts', code, 'utf8');

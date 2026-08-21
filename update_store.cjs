const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf8');

// Update startConsultation
code = code.replace(
  /if \(patient && patient\.status === 'waiting'\) \{\n\s+updates\.status = 'in-consultation';\n\s+\}/,
  `if (patient && patient.status === 'waiting') {
          updates.status = 'in-consultation';
          triggerBackgroundPush(
            patientId,
            'Sua vez chegou!',
            'O médico está te chamando no consultório agora. Clique para abrir.',
            '/chat'
          );
        }`
);

// Update endConsultation
code = code.replace(
  /await updateDoc\(doc\(db, 'queue', consultationId\), \{\n\s+status: 'finished'\n\s+\}\);/,
  `await updateDoc(doc(db, 'queue', consultationId), {
          status: 'finished'
        });
        
        triggerBackgroundPush(
          consultationId,
          'Consulta Finalizada',
          'Sua consulta foi concluída. Muito obrigado!',
          '/dashboard'
        );`
);

fs.writeFileSync('src/store/useStore.ts', code, 'utf8');

const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AppLayout.tsx', 'utf8');
code = code.replace(
  'const { userName, resetConsultation, subscribeToQueue } = useStore();',
  'const { userName, patientId, resetConsultation, subscribeToQueue } = useStore();'
);
fs.writeFileSync('src/components/layout/AppLayout.tsx', code, 'utf8');

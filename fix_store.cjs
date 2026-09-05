const fs = require('fs');

let storePath = 'src/store/useStore.ts';
let storeCode = fs.readFileSync(storePath, 'utf8');

const target = `      const history = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: new Date(data.date)
        };
      });
      set({ consultationHistory: history });`;

const replacement = `      const history = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: new Date(data.date),
          patientName: data.patientName || 'Paciente',
          messages: data.messages || []
        };
      }) as any[];
      set({ consultationHistory: history });`;

storeCode = storeCode.replace(target, replacement);

fs.writeFileSync(storePath, storeCode);
console.log('Fixed useStore');

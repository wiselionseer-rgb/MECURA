const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf-8');
const target = `      // Always try to write to Firestore, even if anonymous (using the generated ID)
      await setDoc(doc(db, 'queue', currentUserId), {
        ...newPatient,
        joinedAt: new Date().toISOString(),
        status: 'waiting'
      });`;
const replacement = `      // Always try to write to Firestore, even if anonymous (using the generated ID)
      await setDoc(doc(db, 'queue', currentUserId), {
        ...newPatient,
        joinedAt: new Date().toISOString(),
        status: 'waiting'
      });
      
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
         import('../utils/notifications').then(({ subscribeToBackgroundNotifications }) => {
            subscribeToBackgroundNotifications(currentUserId).catch(() => {});
         }).catch(() => {});
      }`;
code = code.replace(target, replacement);
fs.writeFileSync('src/store/useStore.ts', code);

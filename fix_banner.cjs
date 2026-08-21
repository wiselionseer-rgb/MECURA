const fs = require('fs');
let code = fs.readFileSync('src/components/EnableNotificationsBanner.tsx', 'utf8');
code = code.replace(
  'if (granted && userId) {',
  `
      const { auth } = await import('../firebase');
      const finalUserId = userId || auth.currentUser?.uid;
      if (granted && finalUserId) {
`
);
code = code.replace(
  'await subscribeToBackgroundNotifications(userId);',
  'await subscribeToBackgroundNotifications(finalUserId);'
);
code = code.replace(
  "await setDoc(doc(db, 'users', userId), { role: 'admin' }, { merge: true });",
  "await setDoc(doc(db, 'users', finalUserId), { role: 'admin' }, { merge: true });"
);
fs.writeFileSync('src/components/EnableNotificationsBanner.tsx', code, 'utf8');

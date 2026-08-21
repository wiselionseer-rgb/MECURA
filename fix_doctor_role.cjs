const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');
code = code.replace(
  'subscribeToBackgroundNotifications(adminId);',
  'subscribeToBackgroundNotifications(adminId).then(() => { setDoc(doc(db, "users", adminId), { role: "admin" }, { merge: true }); });'
);
fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');

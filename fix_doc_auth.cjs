const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        requestNotificationPermission().then(granted => {
          if (granted) {
            subscribeToBackgroundNotifications(user.uid).then(() => { 
              setDoc(doc(db, "users", user.uid), { role: "admin" }, { merge: true }); 
            });
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);
`;

// replace the old useEffect that has requestNotificationPermission
code = code.replace(/useEffect\(\(\) => \{\n    requestNotificationPermission\(\)[\s\S]*?\}\);/g, effectCode.trim());

fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');

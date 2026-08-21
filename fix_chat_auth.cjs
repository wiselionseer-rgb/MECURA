const fs = require('fs');
let code = fs.readFileSync('src/screens/ChatScreen.tsx', 'utf8');

code = code.replace(/useEffect\(\(\) => \{\n    requestNotificationPermission\(\)[\s\S]*?\}\);/g, `
  useEffect(() => {
    if (patientId) {
      requestNotificationPermission().then(granted => {
        if (granted) {
          subscribeToBackgroundNotifications(patientId);
        }
      });
    }
  }, [patientId]);
`.trim());

fs.writeFileSync('src/screens/ChatScreen.tsx', code, 'utf8');

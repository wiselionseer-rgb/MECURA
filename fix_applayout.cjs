const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AppLayout.tsx', 'utf-8');

const target = `  useEffect(() => {
    let activityTimeout: NodeJS.Timeout;`;

const replacement = `  // Ensure push notifications are subscribed if permission is already granted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const finalUserId = patientId || auth.currentUser?.uid;
      if (finalUserId) {
        import('../../utils/notifications').then(({ subscribeToBackgroundNotifications }) => {
          subscribeToBackgroundNotifications(finalUserId).catch(() => {});
        }).catch(() => {});
      }
    }
  }, [patientId, auth.currentUser?.uid]);

  useEffect(() => {
    let activityTimeout: NodeJS.Timeout;`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/layout/AppLayout.tsx', code);

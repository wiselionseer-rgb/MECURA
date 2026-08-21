const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const importTarget = `import { ErrorBoundary } from './components/ErrorBoundary';`;
const newImport = `import { ErrorBoundary } from './components/ErrorBoundary';
import { auth } from './firebase';
import { subscribeToBackgroundNotifications } from './utils/notifications';
import { onAuthStateChanged } from 'firebase/auth';`;

code = code.replace(importTarget, newImport);

const effectTarget = `  useEffect(() => {
    const unsubscribeExchange = subscribeToExchangeRate();`;
const newEffect = `  useEffect(() => {
    // Auto-subscribe to background notifications if already granted
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            await subscribeToBackgroundNotifications(user.uid);
          } catch (e) {
            console.error("Auto push subscription failed:", e);
          }
        }
      }
    });

    const unsubscribeExchange = subscribeToExchangeRate();`;

code = code.replace(effectTarget, newEffect);

const cleanupTarget = `      unsubscribeAppointments();
    };
  }, [subscribeToExchangeRate, subscribeToAppointments]);`;
const newCleanup = `      unsubscribeAppointments();
      unsubscribeAuth();
    };
  }, [subscribeToExchangeRate, subscribeToAppointments]);`;

code = code.replace(cleanupTarget, newCleanup);

fs.writeFileSync('src/App.tsx', code);

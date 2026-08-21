const fs = require('fs');
let code = fs.readFileSync('src/utils/notifications.ts', 'utf8');

// I need to clean up the bad replacement
const correctCode = `
export const subscribeToBackgroundNotifications = async (userId: string) => {
  try {
    const reg = await registerServiceWorker();
    if (!reg) return false;
    
    const response = await fetch('/api/vapid-public-key');
    const vapidPublicKey = await response.text();
    
    // Convert VAPID key to Uint8Array
    const padding = '='.repeat((4 - vapidPublicKey.length % 4) % 4);
    const base64 = (vapidPublicKey + padding).replace(/\\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: outputArray
    });
    
    // Save to Firestore user doc
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    await setDoc(doc(db, 'users', userId), {
      pushSubscription: JSON.parse(JSON.stringify(subscription))
    }, { merge: true });
    
    console.log('Background push notifications subscribed!');
    return true;
  } catch (error) {
    console.warn('Failed to subscribe to background push:', error);
    return false;
  }
};
`;

code = code.replace(/export const subscribeToBackgroundNotifications = async \(userId: string\) => \{[\s\S]*?return false;\n  \}\n\};/g, correctCode.trim());

fs.writeFileSync('src/utils/notifications.ts', code, 'utf8');

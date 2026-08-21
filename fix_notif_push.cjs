const fs = require('fs');
let n = fs.readFileSync('src/utils/notifications.ts', 'utf8');

if (!n.includes('subscribeToBackgroundNotifications')) {
  n = `import { db } from '../firebase';\nimport { doc, updateDoc } from 'firebase/firestore';\n` + n;
  
  const subLogic = `
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
    await updateDoc(doc(db, 'users', userId), {
      pushSubscription: JSON.parse(JSON.stringify(subscription))
    });
    console.log('Background push notifications subscribed!');
    return true;
  } catch (error) {
    console.warn('Failed to subscribe to background push:', error);
    return false;
  }
};

export const triggerBackgroundPush = async (subscription: any, title: string, body: string, url: string = '/dashboard') => {
  if (!subscription) return;
  try {
    await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, title, body, url })
    });
  } catch (error) {
    console.error('Failed to trigger background push', error);
  }
};
`;

  n = n + '\n' + subLogic;
  fs.writeFileSync('src/utils/notifications.ts', n, 'utf8');
  console.log('Client push logic added.');
}

const fs = require('fs');
let n = fs.readFileSync('src/utils/notifications.ts', 'utf8');

n = n.replace(/export const triggerBackgroundPush = async \(subscription: any, title: string, body: string, url: string = '\/dashboard'\) => \{[\s\S]*?body: JSON\.stringify\(\{ subscription, title, body, url \}\)[\s\S]*?\}\;/g, 
`export const triggerBackgroundPush = async (userId: string, title: string, body: string, url: string = '/dashboard') => {
  if (!userId) return;
  try {
    await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, url })
    });
  } catch (error) {
    console.error('Failed to trigger background push', error);
  }
};`);

fs.writeFileSync('src/utils/notifications.ts', n, 'utf8');
console.log('Trigger logic updated in notifications.');

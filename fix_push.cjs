const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /await webpush\.sendNotification\(subscription, JSON\.stringify\(\{ title, body, url \}\)\);/g,
  `await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }), { urgency: 'high', TTL: 86400 });`
);

code = code.replace(
  /webpush\.sendNotification\(userData\.pushSubscription, JSON\.stringify\(\{ title, body, url \}\)\)/g,
  `webpush.sendNotification(userData.pushSubscription, JSON.stringify({ title, body, url }), { urgency: 'high', TTL: 86400 })`
);

code = code.replace(
  /webpush\.sendNotification\(uData\.pushSubscription, JSON\.stringify\(\{ title, body, url \}\)\)/g,
  `webpush.sendNotification(uData.pushSubscription, JSON.stringify({ title, body, url }), { urgency: 'high', TTL: 86400 })`
);

fs.writeFileSync('server.ts', code);

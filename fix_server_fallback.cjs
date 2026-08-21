const fs = require('fs');
let srv = fs.readFileSync('server.ts', 'utf8');

srv = srv.replace(
  /if \(promises\.length === 0\) \{[\s\S]*?\}/g,
  `if (promises.length === 0) {
          const allUsersSnapshot = await getDocs(usersRef);
          allUsersSnapshot.forEach(doc => {
              const uData = doc.data();
              if (uData.pushSubscription) {
                 promises.push(webpush.sendNotification(uData.pushSubscription, JSON.stringify({ title, body, url })).catch(e => console.error('Admin push error', e)));
              }
          });
      }`
);

fs.writeFileSync('server.ts', srv, 'utf8');

const fs = require('fs');
let srv = fs.readFileSync('server.ts', 'utf8');

const adminPushEndpoint = `
  app.post('/api/send-admin-push', async (req, res) => {
    const { title, body, url } = req.body;
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const querySnapshot = await getDocs(q);
      
      const promises = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.pushSubscription) {
          promises.push(webpush.sendNotification(userData.pushSubscription, JSON.stringify({ title, body, url })).catch(e => console.error('Admin push error', e)));
        }
      });
      
      await Promise.all(promises);
      res.json({ success: true, count: promises.length });
    } catch (error) {
      console.error('Error sending admin push:', error);
      res.status(500).json({ error: 'Failed' });
    }
  });
`;

if (!srv.includes('/api/send-admin-push')) {
  srv = srv.replace("app.post('/api/webhook',", adminPushEndpoint + "\n  app.post('/api/webhook',");
  fs.writeFileSync('server.ts', srv, 'utf8');
  console.log('Admin push endpoint added.');
}

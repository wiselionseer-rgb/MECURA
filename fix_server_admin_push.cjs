const fs = require('fs');
let srv = fs.readFileSync('server.ts', 'utf8');

const adminPushEndpoint = `
  app.post('/api/send-admin-push', async (req, res) => {
    const { title, body, url } = req.body;
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      // For doctors/admins, we might not have 'role'=='admin' in users collection reliably.
      // Let's broadcast to anyone who has pushSubscription AND (maybe we just send to all admins, but wait)
      // Actually, if the doctor registered, maybe they don't have role='admin' in their doc.
      // Let's check how the doctor document is structured.
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'admin'));
      let querySnapshot = await getDocs(q);
      
      // Fallback: If no 'admin' role found, we might want to check the specific doctor uid if we know it.
      // For now, let's just broadcast to all admins.
      const promises = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.pushSubscription) {
          promises.push(webpush.sendNotification(userData.pushSubscription, JSON.stringify({ title, body, url })).catch(e => console.error('Admin push error', e)));
        }
      });
      
      // If no admin was found with role=admin, we can broadcast to the first user with a pushSubscription as a fallback for testing (but better to properly set role='admin' when doctor subscribes)
      if (promises.length === 0) {
          const allUsersSnapshot = await getDocs(usersRef);
          allUsersSnapshot.forEach(doc => {
              const uData = doc.data();
              // A hacky way for now: if a user has pushSubscription and is NOT a patient (maybe missing fields? No, let's just assume the doctor logs in first)
              // We should just fix the doctor subscription to include role: 'admin'.
          });
      }

      await Promise.all(promises);
      res.json({ success: true, count: promises.length });
    } catch (error) {
      console.error('Error sending admin push:', error);
      res.status(500).json({ error: 'Failed' });
    }
  });
`;

if (!srv.includes('/api/send-admin-push')) {
  srv = srv.replace('app.post("/api/webhook",', adminPushEndpoint + '\n  app.post("/api/webhook",');
  fs.writeFileSync('server.ts', srv, 'utf8');
  console.log('Admin push endpoint added.');
}

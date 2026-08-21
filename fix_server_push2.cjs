const fs = require('fs');
let srv = fs.readFileSync('server.ts', 'utf8');

if (!srv.includes("import { db }")) {
  srv = srv.replace('import dotenv from \'dotenv\';', 'import dotenv from \'dotenv\';\nimport { db } from "./src/firebase";\nimport { doc, getDoc } from "firebase/firestore";');
  
  const oldPush = `app.post('/api/send-push', async (req, res) => {
    const { subscription, title, body, url } = req.body;
    if (!subscription) return res.status(400).json({ error: 'No subscription' });
    try {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
      res.json({ success: true });
    } catch (error) {
      console.error('Error sending push:', error);
      res.status(500).json({ error: 'Failed' });
    }
  });`;

  const newPush = `app.post('/api/send-push', async (req, res) => {
    const { userId, title, body, url } = req.body;
    if (!userId) return res.status(400).json({ error: 'No userId' });
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return res.status(404).json({ error: 'User not found' });
      const userData = userDoc.data();
      const subscription = userData.pushSubscription;
      if (!subscription) return res.status(400).json({ error: 'User has no push subscription' });
      
      await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
      res.json({ success: true });
    } catch (error) {
      console.error('Error sending push:', error);
      res.status(500).json({ error: 'Failed' });
    }
  });`;

  srv = srv.replace(oldPush, newPush);
  fs.writeFileSync('server.ts', srv, 'utf8');
  console.log('Server push logic updated with userId lookup.');
}

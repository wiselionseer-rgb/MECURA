const fs = require('fs');
let srv = fs.readFileSync('server.ts', 'utf8');

if (!srv.includes('web-push')) {
  srv = srv.replace('import express from "express";', 'import express from "express";\nimport webpush from "web-push";');
  
  const pushLogic = `
  const vapidPublic = process.env.VAPID_PUBLIC_KEY || "BNhGkh4NPQdL5-v97cIGWleXsEuVlZiW6YGu3866y33lZuMB_INQ-nJh0Ff-DECy-uIO-E2X4KdDvEw2oo0--Aw";
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY || "qQnw0dxc2m0c1fFN444rwuE0mWbZrrYeiQcbTKeXy8M";
  webpush.setVapidDetails('mailto:lucasdanieltrader@gmail.com', vapidPublic, vapidPrivate);
  
  app.get('/api/vapid-public-key', (req, res) => {
    res.send(vapidPublic);
  });
  
  app.post('/api/send-push', async (req, res) => {
    const { subscription, title, body, url } = req.body;
    if (!subscription) return res.status(400).json({ error: 'No subscription' });
    try {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
      res.json({ success: true });
    } catch (error) {
      console.error('Error sending push:', error);
      res.status(500).json({ error: 'Failed' });
    }
  });
`;
  srv = srv.replace('// API Routes', '// API Routes\n' + pushLogic);
  fs.writeFileSync('server.ts', srv, 'utf8');
  console.log('Server push logic added.');
}

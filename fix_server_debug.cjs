const fs = require('fs');
let srv = fs.readFileSync('server.ts', 'utf8');

const debugEndpoint = `
  app.get('/api/debug-users', async (req, res) => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = [];
      snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
`;

if (!srv.includes('/api/debug-users')) {
  srv = srv.replace('app.post("/api/webhook",', debugEndpoint + '\n  app.post("/api/webhook",');
  fs.writeFileSync('server.ts', srv, 'utf8');
}

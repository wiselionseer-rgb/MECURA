fetch('http://localhost:3000/api/send-admin-push', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Test', body: 'Testing push', url: '/doctor' })
}).then(res => res.json()).then(console.log).catch(console.error);

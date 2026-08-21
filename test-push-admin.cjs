const fetch = require('node-fetch');
async function run() {
  const res = await fetch('http://localhost:3000/api/send-admin-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test Admin Push', body: 'This is a test' })
  });
  console.log(await res.json());
}
run();

const fs = require('fs');
let code = fs.readFileSync('src/utils/notifications.ts', 'utf-8');

code = code.replace(
  /await fetch\('\/api\/send-push', \{\n      method: 'POST',\n      headers: \{ 'Content-Type': 'application\/json' \},\n      body: JSON.stringify\(\{ userId, title, body, url \}\)\n    \}\);/,
  `const res = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, url })
    });
    const data = await res.json();
    console.log('Push response:', data);`
);

fs.writeFileSync('src/utils/notifications.ts', code);

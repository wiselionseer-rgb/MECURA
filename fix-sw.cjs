const fs = require('fs');
let code = fs.readFileSync('public/sw.js', 'utf-8');

const target = `self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Mecura', body: event.data ? event.data.text() : 'Nova mensagem' };
  }

  const title = data.title || 'Mecura - Notificação de Paciente';
  const options = {
    body: data.body || 'Você recebeu uma nova atualização no consultório.',
    icon: '/logo-192.png?v=6',
    badge: '/logo-192.png?v=6',
    vibrate: [300, 100, 300, 100, 400],
    tag: 'mecura-chat', // Constant tag so they group/replace
    renotify: true, // Forces sound/vibration even if replacing an existing notification
    requireInteraction: true,
    data: { url: data.url || '/chat' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});`;

const replacement = `self.addEventListener('push', (event) => {
  console.log('[SW] Push received!', event.data ? event.data.text() : 'no data');
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
    data = { title: 'Mecura', body: event.data ? event.data.text() : 'Nova mensagem' };
  }

  const title = data.title || 'Mecura - Nova Mensagem';
  const options = {
    body: data.body || 'Você recebeu uma atualização no consultório.',
    icon: '/logo-192.png?v=6',
    badge: '/logo-192.png?v=6',
    vibrate: [300, 100, 300, 100, 400],
    tag: 'mecura-chat-' + Date.now(), // Use unique tags for each push to guarantee it shows up
    requireInteraction: true,
    data: { url: data.url || '/chat' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      console.log('[SW] Notification shown successfully');
    }).catch(err => {
      console.error('[SW] Error showing notification:', err);
    })
  );
});`;

code = code.replace(target, replacement);
fs.writeFileSync('public/sw.js', code);

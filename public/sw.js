// Service Worker for Mecura PWA Push Notifications & Background Alerts
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming messages from the client to show system banner notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, url } = event.data;
    const options = {
      body: body || 'Nova notificação de atendimento.',
      icon: '/logo-192.png?v=6',
      badge: '/logo-192.png?v=6',
      vibrate: [300, 100, 300, 100, 400],
      tag: tag || 'mecura-alert',
      renotify: true,
      requireInteraction: true,
      data: { url: url || '/chat' }
    };
    event.waitUntil(
      self.registration.showNotification(title || 'Mecura - Novo Alerta', options)
    );
  }
});

// Handle Web Push API events
self.addEventListener('push', (event) => {
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
});

// Click action on system notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/chat';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

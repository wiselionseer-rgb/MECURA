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
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [300, 100, 300, 100, 400],
      tag: tag || 'mecura-alert-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      data: { url: url || '/doctor' }
    };

    event.waitUntil(
      self.registration.showNotification(title || 'Mecura - Novo Alerta', options)
    );
  }
});

// Handle Web Push API events
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Mecura', body: event.data ? event.data.text() : 'Nova mensagem' };
  }

  const title = data.title || 'Mecura - Notificação de Paciente';
  const options = {
    body: data.body || 'Você recebeu uma nova atualização no consultório.',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [300, 100, 300, 100, 400],
    tag: 'mecura-alert-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || '/doctor' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click action on system notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/doctor';

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

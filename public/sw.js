// Service Worker for Mecura PWA Push Notifications & Background Sync
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Mecura - Nova Notificação';
  const options = {
    body: data.body || 'Você recebeu uma nova atualização no sistema.',
    icon: 'https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=192&auto=format&fit=crop',
    badge: 'https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=96&auto=format&fit=crop',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'mecura-alert',
    renotify: true,
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

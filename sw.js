console.log("Service Worker Loaded...");

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let data = { title: 'VigiaEnchente', body: 'Alerta de enchente' };
  try {
    if (e.data) data = e.data.json();
  } catch (err) {
    console.error('Failed to parse push data', err);
  }
  console.log('Push Received', data);

  const title = data.title || 'VigiaEnchente';
  const options = {
    body: data.body || 'Alerta de enchente',
    tag: data.tag || 'vigia-alert',
    renotify: true,
    data: data // helpful for notificationclick
  };

  // keep SW alive until the notification is shown
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
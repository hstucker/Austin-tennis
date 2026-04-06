importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAP4pLIRiHIXGAR1AWVvRymd6yHnVmRV5Q",
  authDomain: "austin-tennis.firebaseapp.com",
  databaseURL: "https://austin-tennis-default-rtdb.firebaseio.com",
  projectId: "austin-tennis",
  storageBucket: "austin-tennis.firebasestorage.app",
  messagingSenderId: "652090047111",
  appId: "1:652090047111:web:b1795d9f47a70edbaa5622"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || "Austin's Tennis";
  const body = data.body || "Score update!";
  const options = {
    body: body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎾</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎾</text></svg>',
    vibrate: [200, 100, 200],
    tag: 'tennis-update',
    renotify: true
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('Austin-tennis') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// You would typically put your firebase config here if you want background messages to work,
// but for now, just having this file prevents the "Failed to register a ServiceWorker" error.

self.addEventListener("push", (event) => {
  const payload = event.data?.json();
  if (payload) {
    self.registration.showNotification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/favicon_final.png'
    });
  }
});

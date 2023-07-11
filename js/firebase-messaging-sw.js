importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js');
const firebaseConfig = {
  apiKey: "AIzaSyCRGiwGkiatM1kHnKWfd0tXceWHWJxiWRA",
    authDomain: "jaribean-3af6f.firebaseapp.com",
    projectId: "jaribean-3af6f",
    storageBucket: "jaribean-3af6f.appspot.com",
    messagingSenderId: "508384819940",
    appId: "1:508384819940:web:f14eda8ab95a047e19caf1",
    measurementId: "G-CQJ8KGXR9L"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    image: payload.data.image
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
  self.addEventListener('notificationclick', function(event) {
    const clickedNotification = event.notification;
    clickedNotification.close();
    event.waitUntil(
      clients.openWindow(payload.data.click_action)
    );
  });
});
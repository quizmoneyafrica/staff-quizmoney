// This is run in the background (not in React)

importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyA7-u72-FcmKB9-0Yx2Q1H08bK4rPYf0fQ",
  authDomain: "quiz-money-3f1a1.firebaseapp.com",
  projectId: "quiz-money-3f1a1",
  messagingSenderId: "991370528800",
  appId: "1:991370528800:web:c4ea3918afcf1293785445",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  // console.log(
  // 	"[firebase-messaging-sw.js] Received background message ",
  // 	payload
  // );
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icons/icon-192x192.png",
  });
});

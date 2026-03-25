// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxjD3Z6y1Eu9toUZ_aGE4nThKwntSjDxw",
  authDomain: "edu-ai-b8043.firebaseapp.com",
  projectId: "edu-ai-b8043",
  storageBucket: "edu-ai-b8043.firebasestorage.app",
  messagingSenderId: "1092931873260",
  appId: "1:1092931873260:web:8886d5588af10c3694f8c9",
  measurementId: "G-BVB6F6KJ6G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);

let messaging = null;

// Initialize Firebase Messaging only if supported and running in browser
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  import('firebase/messaging').then(({ getMessaging }) => {
    try {
      messaging = getMessaging(app);
    } catch (err) {
      console.warn('Firebase Messaging not supported in this environment.', err);
    }
  });
}

export const requestFCMToken = async () => {
  if (!messaging) return null;
  try {
    const { getToken } = await import('firebase/messaging');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Typically requires a vapidKey. Without it, the default senderID might suffice, but it is recommended.
      const token = await getToken(messaging);
      return token;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
  return null;
};

export { app, auth, analytics, messaging };

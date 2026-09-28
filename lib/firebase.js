import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBwcONxmP0IbBHnJdOBdYKm9R6ci9QnR50",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "xortcut-ce5c9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "xortcut-ce5c9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "xortcut-ce5c9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "36879987300",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:36879987300:web:f265f075bd348362992571",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BT85X8W6C9"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

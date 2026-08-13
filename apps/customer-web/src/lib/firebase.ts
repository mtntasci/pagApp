import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBNTV8DGRFKNXMne_q4TTH2-HmMNijmlaE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pagwebapp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pagwebapp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pagwebapp.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1011540629150",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1011540629150:web:34838483b562d9deb5cd8f"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const functions = getFunctions(app);

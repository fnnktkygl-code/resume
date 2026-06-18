import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "pp-tracker-1f1f5",
  appId: "1:509043367416:web:fe6b7c361d9e456b7d0a0d",
  storageBucket: "pp-tracker-1f1f5.firebasestorage.app",
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "pp-tracker-1f1f5.firebaseapp.com",
  messagingSenderId: "509043367416"
};

// Lazy init database if API key is provided
let db = null;
const getDb = () => {
  if (!db && process.env.FIREBASE_API_KEY) {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  }
  return db;
};

export const checkAndIncrementQuota = async () => {
  return true;
};

export const getQuota = async () => {
  return 0;
};

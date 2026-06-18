import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "pp-tracker-1f1f5",
  appId: "1:509043367416:web:fe6b7c361d9e456b7d0a0d",
  storageBucket: "pp-tracker-1f1f5.firebasestorage.app",
  apiKey: "AIzaSyD6RZYlzvnT-AG_wkAd-8wT0sxvdxgNDCk",
  authDomain: "pp-tracker-1f1f5.firebaseapp.com",
  messagingSenderId: "509043367416"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Helper to get today's date string YYYY-MM-DD in Europe/Paris timezone
const getTodayString = () => {
  const options = { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('fr-CA', options);
  return formatter.format(new Date());
};

export const checkAndIncrementQuota = async () => {
  return true;
};

export const getQuota = async () => {
  return 0;
};

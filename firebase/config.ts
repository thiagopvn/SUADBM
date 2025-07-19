import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDhLLzcqgM26plgH7eL5mWms3EDeJqHpMY",
  authDomain: "suad-44036.firebaseapp.com",
  databaseURL: "https://suad-44036-default-rtdb.firebaseio.com",
  projectId: "suad-44036",
  storageBucket: "suad-44036.firebasestorage.app",
  messagingSenderId: "33344546339",
  appId: "1:33344546339:web:4de36f2ebaa4e4ea11f396",
  measurementId: "G-SNDT989PZE"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

// Initialize Analytics only in browser environment
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      getAnalytics(app);
    }
  });
}
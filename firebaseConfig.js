import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLqtgQJJsejo9Ck00Z7yg8tRmgted__Ns",
  authDomain: "ujikom-36862.firebaseapp.com",
  projectId: "ujikom-36862",
  storageBucket: "ujikom-36862.firebasestorage.app",
  messagingSenderId: "302215216984",
  appId: "1:302215216984:android:6b1964a384610ba9366f2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
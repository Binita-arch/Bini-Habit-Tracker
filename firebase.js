// Import Firebase modules
import {getFirestore} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';

// Firebase configuration (Replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyA6KbAKHLCbZAl1Anm_Oorbl0c3L7kKZLo",
    authDomain: "b-habit-tracker.firebaseapp.com",
    projectId: "b-habit-tracker",
    storageBucket: "b-habit-tracker.firebasestorage.app",
    messagingSenderId: "761343524159",
    appId: "1:761343524159:web:cee9a5a1d5468b5235e78a",
    measurementId: "G-ZS8KWT7L2F"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export auth functions
export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };

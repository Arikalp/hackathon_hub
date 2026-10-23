import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.apiKey ||
    "AIzaSyAXDSnqaFdmoM8ipJ0DcWjKHD1k6Q1NqjA",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.authDomain ||
    "hackathonhub-314c2.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.projectId ||
    "hackathonhub-314c2",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.storageBucket ||
    "hackathonhub-314c2.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.messagingSenderId ||
    "808879464886",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.appId ||
    "1:808879464886:web:557909dd9789fe03cfa117",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.measurementId ||
    "G-7LDYZ8PS5E",
};

// Initialize Firebase safely for SSR/Client
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

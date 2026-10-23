// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXDSnqaFdmoM8ipJ0DcWjKHD1k6Q1NqjA",
  authDomain: "hackathonhub-314c2.firebaseapp.com",
  projectId: "hackathonhub-314c2",
  storageBucket: "hackathonhub-314c2.firebasestorage.app",
  messagingSenderId: "808879464886",
  appId: "1:808879464886:web:557909dd9789fe03cfa117",
  measurementId: "G-7LDYZ8PS5E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJOzNH9wO7D4tzErd15iNrDWNrbiKuVFQ",
  authDomain: "portfolio-df9a4.firebaseapp.com",
  projectId: "portfolio-df9a4",
  databaseURL: "https://portfolio-df9a4-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "portfolio-df9a4.appspot.com",
  messagingSenderId: "602365254236",
  appId: "1:602365254236:web:2062375c98ec1953dae499",
  measurementId: "G-W8H5PGXLE6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, db, storage, app };
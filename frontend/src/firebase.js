import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0hDz9ejZfpn6cumcoTH4uqpZlZQZm40s",
  authDomain: "venue-admin-dashboard.firebaseapp.com",
  projectId: "venue-admin-dashboard",
  storageBucket: "venue-admin-dashboard.firebasestorage.app",
  messagingSenderId: "520896049685",
  appId: "1:520896049685:web:13d1726010d26f37da941c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  serverTimestamp as firestoreServerTimestamp,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCG-k_jY6iuSHdTfIBdoHUHyLwTsCxiIkg",
  authDomain: "furniture-shop-c2655.firebaseapp.com",
  projectId: "furniture-shop-c2655",
  storageBucket: "furniture-shop-c2655.appspot.com",
  messagingSenderId: "328322677477",
  appId: "1:328322677477:web:09dc2b20d9dbe212a1b20c",
};

// ✅ Initialize Firebase app only once (important for Next.js hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Export core Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// ✅ Re-export Firestore’s server timestamp helper
export const serverTimestamp = firestoreServerTimestamp;

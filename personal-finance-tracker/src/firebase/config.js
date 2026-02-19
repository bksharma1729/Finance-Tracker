import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDA2kopn52iz0_FMi9gqikfidSuR-B8cMM",
  authDomain: "personal-finance-tracker-c61c1.firebaseapp.com",
  projectId: "personal-finance-tracker-c61c1",
  storageBucket: "personal-finance-tracker-c61c1.firebasestorage.app",
  messagingSenderId: "12666447616",
  appId: "1:12666447616:web:c3e2df08ff45cdb183f5e5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
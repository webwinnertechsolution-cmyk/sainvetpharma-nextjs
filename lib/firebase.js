// ================================================================
// FILE: lib/firebase.js  — SAME RAKHA, sirf link fix kiya
// ================================================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyAGhKMG3-UYtPapQrdULDUdYCGjNg1LLR0",
  authDomain:        "sainivatpharama.firebaseapp.com",
  projectId:         "sainivatpharama",
  storageBucket:     "sainivatpharama.firebasestorage.app",
  messagingSenderId: "996939437190",
  appId:             "1:996939437190:web:4a930ce1f7dd2c1ea66d07",
  measurementId:     "G-73BF5HH5CS"
};

const app = initializeApp(firebaseConfig);

export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkD8v0ds91Q8kNCCu7eS1R5MDDH5oc5ZM",
  authDomain: "sainivetpharma-e423a.firebaseapp.com",
  projectId: "sainivetpharma-e423a",
  storageBucket: "sainivetpharma-e423a.firebasestorage.app",
  messagingSenderId: "563318369425",
  appId: "1:563318369425:web:b9d586a93206ee7462a330",
  measurementId: "G-N7NFE4N7MH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

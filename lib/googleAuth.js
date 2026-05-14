import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Laravel API pe user save karo
    const response = await fetch(`${API_URL}/api/google/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firebase_uid: user.uid,
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // User ko localStorage mein save karo
      localStorage.setItem("google_user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    }

    return { success: false };

  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, error: error.message };
  }
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("google_user");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("google_user");
  return user ? JSON.parse(user) : null;
};
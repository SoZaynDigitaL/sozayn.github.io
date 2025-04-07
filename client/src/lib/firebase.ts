import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDb9UKfNLECdvk_yJmAXfIiN9KQDVIk7As",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "sozayn-7c013"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sozayn-7c013",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "sozayn-7c013"}.appspot.com`,
  messagingSenderId: "770594073921",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:770594073921:web:9712972be3b8bcb86445c0",
  measurementId: "G-MNFDVXPMEY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Auth for Google Sign-In
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Firebase authentication functions
export const signInWithGoogle = async () => {
  try {
    // Use popup for better user experience
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const redirectSignInWithGoogle = () => {
  signInWithRedirect(auth, googleProvider);
};

export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onUserAuthStateChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { app, auth, db, storage, analytics, googleProvider };
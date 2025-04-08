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

// Add additional Google OAuth scopes (optional)
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Firebase authentication functions
export const signInWithGoogle = async () => {
  try {
    // Log the current domain to help with debugging
    const domain = window.location.hostname;
    console.log("Attempting Google sign-in from domain:", domain);
    
    // Use popup for better user experience
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", result.user.displayName);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    
    // Check for auth/unauthorized-domain error
    if (error.code === 'auth/unauthorized-domain') {
      console.error("Domain not authorized in Firebase. Add this domain to your Firebase project's authorized domains list.");
      const domain = window.location.hostname;
      console.error(`Please add ${domain} to Firebase Console > Authentication > Settings > Authorized domains`);
      throw new Error(`Domain ${domain} not authorized. Please add it to Firebase Console > Authentication > Settings > Authorized domains.`);
    }
    
    // Handle other common Firebase auth errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Sign-in popup was closed before completing the sign-in.");
    }
    
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Multiple popup requests were triggered. Only one popup can be open at once.");
    }
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Sign-in popup was blocked by the browser. Please allow popups for this site.");
    }
    
    // Additional error types
    if (error.code === 'auth/internal-error') {
      console.error("Firebase internal error:", error);
      throw new Error("An internal error occurred during sign-in. Please try again later.");
    }
    
    if (error.code === 'auth/network-request-failed') {
      throw new Error("Network error occurred. Please check your internet connection and try again.");
    }
    
    // For other errors, throw the original error
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
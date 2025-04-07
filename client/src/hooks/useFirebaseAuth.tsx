import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onUserAuthStateChanged, signInWithGoogle, logoutFirebase } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface FirebaseAuthContextType {
  firebaseUser: User | null;
  firebaseLoading: boolean;
  firebaseError: Error | null;
  signInWithGooglePopup: () => Promise<void>;
  firebaseLogout: () => Promise<void>;
  showAuthGuidance: boolean;
  setShowAuthGuidance: (show: boolean) => void;
  currentDomain: string;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  firebaseUser: null,
  firebaseLoading: true,
  firebaseError: null,
  signInWithGooglePopup: async () => {},
  firebaseLogout: async () => {},
  showAuthGuidance: false,
  setShowAuthGuidance: () => {},
  currentDomain: ""
});

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);
  const [showAuthGuidance, setShowAuthGuidance] = useState(false);
  const [currentDomain, setCurrentDomain] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get current domain on component mount
  useEffect(() => {
    setCurrentDomain(window.location.hostname);
  }, []);

  useEffect(() => {
    // Set up Firebase Auth state listener
    const unsubscribe = onUserAuthStateChanged((user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const signInWithGooglePopup = async () => {
    try {
      setFirebaseLoading(true);
      const user = await signInWithGoogle();
      setFirebaseUser(user);
      
      // Get Firebase token for verification (if needed in the future)
      // const token = await user.getIdToken();
      
      // Now send the Firebase user data to our backend API
      console.log("Sending Firebase user data to backend API...");
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          displayName: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL,
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend Firebase auth error:", errorData);
        throw new Error(errorData.error || "Failed to authenticate with backend");
      }
      
      const userData = await response.json();
      console.log("Backend Firebase auth successful:", userData);
      
      // Store auth token if present in the response
      if (userData.authToken) {
        console.log("Storing auth token in localStorage:", userData.authToken);
        localStorage.setItem('authToken', userData.authToken);
      }
      
      toast({
        title: "Signed in with Google",
        description: `Welcome ${user.displayName || 'User'}!`,
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Google sign-in error:", error);
      setFirebaseError(error as Error);
      
      // Customize toast message based on error
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('not authorized')) {
        toast({
          title: "Domain Not Authorized",
          description: "This website domain is not authorized in Firebase. Please add it to your Firebase project settings.",
          variant: "destructive",
        });
        // Show the domain guidance dialog
        setShowAuthGuidance(true);
      } else if (errorMessage.includes('popup-closed') || errorMessage.includes('popup-blocked')) {
        toast({
          title: "Sign-in Interrupted",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign-in Failed",
          description: errorMessage || "Failed to sign in with Google.",
          variant: "destructive",
        });
      }
    } finally {
      setFirebaseLoading(false);
    }
  };

  const firebaseLogout = async () => {
    try {
      setFirebaseLoading(true);
      await logoutFirebase();
      setFirebaseUser(null);
      
      // Clear auth token
      localStorage.removeItem('authToken');
      
      // Call backend logout endpoint to clear session
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        console.log("Backend logout successful");
      } catch (logoutError) {
        console.error("Backend logout error:", logoutError);
        // Continue with local logout even if backend logout fails
      }
      
      toast({
        title: "Signed Out",
        description: "You have been signed out from Google.",
      });
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error("Sign out error:", error);
      setFirebaseError(error as Error);
      toast({
        title: "Sign-out Failed",
        description: (error as Error).message || "Failed to sign out.",
        variant: "destructive",
      });
    } finally {
      setFirebaseLoading(false);
    }
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        firebaseUser,
        firebaseLoading,
        firebaseError,
        signInWithGooglePopup,
        firebaseLogout,
        showAuthGuidance,
        setShowAuthGuidance,
        currentDomain
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
};
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onUserAuthStateChanged, signInWithGoogle, logoutFirebase } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface FirebaseAuthContextType {
  firebaseUser: User | null;
  firebaseLoading: boolean;
  firebaseError: Error | null;
  signInWithGooglePopup: () => Promise<void>;
  firebaseLogout: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  firebaseUser: null,
  firebaseLoading: true,
  firebaseError: null,
  signInWithGooglePopup: async () => {},
  firebaseLogout: async () => {},
});

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "Signed in with Google",
        description: `Welcome ${user.displayName || 'User'}!`,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setFirebaseError(error as Error);
      toast({
        title: "Sign-in Failed",
        description: (error as Error).message || "Failed to sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setFirebaseLoading(false);
    }
  };

  const firebaseLogout = async () => {
    try {
      setFirebaseLoading(true);
      await logoutFirebase();
      setFirebaseUser(null);
      toast({
        title: "Signed Out",
        description: "You have been signed out from Google.",
      });
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
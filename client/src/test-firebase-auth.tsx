import React from 'react';
import { signInWithGoogle } from './lib/firebase';

const TestFirebaseAuth: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      console.log("Initiating Google sign-in...");
      const user = await signInWithGoogle();
      console.log("Google sign-in successful, user:", user);
      
      // Send the Firebase user data to our backend
      console.log("Sending Firebase user data to backend...");
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
      
      // Store auth token if present
      if (userData.authToken) {
        console.log("Storing auth token in localStorage:", userData.authToken);
        localStorage.setItem('authToken', userData.authToken);
      }
      
      // Test the token verification endpoint
      const verifyResponse = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: userData.authToken }),
        credentials: 'include'
      });
      
      if (verifyResponse.ok) {
        const verifiedUser = await verifyResponse.json();
        console.log("Token verification successful:", verifiedUser);
      } else {
        console.error("Token verification failed:", await verifyResponse.text());
      }
      
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };
  
  return (
    <div style={{ margin: '50px', textAlign: 'center' }}>
      <h1>Test Firebase Authentication</h1>
      <button 
        onClick={handleGoogleLogin} 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#4285F4', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Sign in with Google
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Instructions:</h2>
        <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>Click the "Sign in with Google" button above</li>
          <li>Complete the Google sign-in process</li>
          <li>Check the browser console for logs showing the authentication flow</li>
          <li>A successful integration will show your user data from the backend</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => {
            localStorage.removeItem('authToken');
            console.log("Auth token cleared from localStorage");
          }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Clear Auth Token
        </button>
      </div>
    </div>
  );
};

export default TestFirebaseAuth;
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  businessName: string;
  businessType: string;
  role: string; // 'admin' or 'client'
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        console.log("Checking auth status...");
        
        // Check for token in localStorage
        const authToken = localStorage.getItem('authToken');
        const headers: HeadersInit = {};
        
        if (authToken) {
          console.log("Found auth token in localStorage:", authToken);
          headers['Authorization'] = `Bearer ${authToken}`;
          
          // Always try the token verification endpoint first for more reliable token-based auth
          console.log("Trying token verification endpoint directly");
          try {
            const verifyResponse = await fetch('/api/auth/verify-token', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token: authToken }),
              credentials: 'include'
            });
            
            if (verifyResponse.ok) {
              const userData = await verifyResponse.json();
              console.log("Token verification successful on first attempt:", userData);
              setUser(userData);
              setIsLoading(false);
              return;
            } else {
              console.log("Token verification failed, status:", verifyResponse.status);
            }
          } catch (verifyError) {
            console.error("Token verification endpoint error:", verifyError);
          }
        } else {
          console.log("No auth token found in localStorage");
        }
        
        // Fallback to regular /api/auth/me with session cookies
        console.log("Falling back to session-based auth check");
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers
        });
        
        console.log("Auth status response:", response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User authenticated via session:", userData);
          setUser(userData);
        } else {
          // If we have a token but both verification methods failed, clear it
          if (authToken) {
            console.log("Both auth methods failed with token, removing invalid token");
            localStorage.removeItem('authToken');
          }
          
          // Not authenticated
          console.log("User not authenticated");
          setUser(null);
        }
      } catch (error) {
        // Other errors
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Login attempt with username:', username);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login failed:', errorData);
        throw new Error(errorData.error || 'Invalid credentials');
      }
      
      const userData = await response.json();
      console.log('Login successful, user data:', userData);
      
      // Store auth token if present
      if (userData.authToken) {
        console.log('Storing auth token in localStorage');
        localStorage.setItem('authToken', userData.authToken);
      }
      
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('Logout successful');
        setUser(null);
      } else {
        console.error('Logout failed with status:', response.status);
        // Still clear user state even if server logout fails
        setUser(null);
      }
    } catch (error) {
      console.error('Logout failed', error);
      // Still clear user state even if server logout fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
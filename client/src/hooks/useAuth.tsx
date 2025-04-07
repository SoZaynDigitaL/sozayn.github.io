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
          console.log("Found auth token in localStorage, adding to request");
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        // Call /api/auth/me with potential token
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers
        });
        
        console.log("Auth status response:", response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User authenticated:", userData);
          setUser(userData);
        } else {
          // If authentication fails but we have a token, try again with a forceful approach
          if (authToken) {
            console.log("Regular auth check failed, trying direct API call with token");
            
            try {
              // Make a direct API call to get the user data with the token
              const userResponse = await fetch('/api/auth/verify-token', {
                method: 'POST',
                headers: { 
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: authToken })
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log("Token verification successful:", userData);
                setUser(userData);
                return;
              } else {
                console.log("Token verification failed, invalidating token");
                localStorage.removeItem('authToken');
              }
            } catch (tokenError) {
              console.error("Error with token verification:", tokenError);
              localStorage.removeItem('authToken');
            }
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
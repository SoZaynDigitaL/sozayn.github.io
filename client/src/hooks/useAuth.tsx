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
    let mounted = true;
    const checkAuthStatus = async () => {
      try {
        // Handle 401 errors gracefully by returning null instead of throwing
        const response = await apiRequest('GET', '/api/auth/me', undefined, { on401: "returnNull" });
        
        if (!mounted) return;
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Not authenticated
          setUser(null);
        }
      } catch (error) {
        // Other errors
        console.error("Auth check error:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuthStatus();
    
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Login attempt with username:', username);
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login failed:', errorData);
        throw new Error(errorData.error || 'Invalid credentials');
      }
      
      const userData = await response.json();
      console.log('Login successful, user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
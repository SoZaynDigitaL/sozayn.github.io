import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  businessName: string;
  businessType: string;
  role: string;
  subscriptionPlan: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
  token?: string;
}

// Token storage helper functions
const TOKEN_KEY = 'sozayn_auth_token';

const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: () => boolean;
  hasRequiredPlan: (requiredPlans: string[]) => boolean;
  updateSubscription: (plan: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
  isAdmin: () => false,
  hasRequiredPlan: () => false,
  updateSubscription: async () => {}
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
        // Check if we have a token in localStorage
        const token = getToken();
        
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Attach the token to the request
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        // Handle 401 errors gracefully by returning null instead of throwing
        const response = await apiRequest(
          'GET', 
          '/api/auth/me', 
          undefined, 
          { 
            on401: "returnNull",
            headers
          }
        );
        
        if (response.ok) {
          const userData = await response.json();
          setUser({
            ...userData,
            token
          });
        } else {
          // Token might be invalid, remove it
          removeToken();
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
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const userData = await response.json();
      
      // Check if we received a token from the server
      if (userData.token) {
        // Save the token to localStorage
        saveToken(userData.token);
        
        // Set the user data
        setUser(userData);
        
        // Log the success
        console.log("Login successful with token authentication");
      } else {
        console.error("No token received from server");
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      // Call the logout endpoint (this will destroy the session on the server)
      await apiRequest('POST', '/api/auth/logout');
      
      // Remove the token from localStorage
      removeToken();
      
      // Clear the user state
      setUser(null);
      
      console.log("Logged out successfully");
    } catch (error) {
      console.error('Logout failed', error);
      
      // Even if the server call fails, we should still remove the token and user data
      removeToken();
      setUser(null);
    }
  };

  // Check if user is an admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user has the required subscription plan
  const hasRequiredPlan = (requiredPlans: string[]) => {
    if (!user) return false;
    return requiredPlans.includes(user.subscriptionPlan);
  };

  // Update user subscription plan
  const updateSubscription = async (plan: string) => {
    try {
      if (!user) {
        throw new Error('User not logged in');
      }
      
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token missing');
      }
      
      // Include the token in the request
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      // Fetch updated user data
      const response = await apiRequest('GET', '/api/auth/me', undefined, { headers });
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }
      const userData = await response.json();
      
      // Update local user object with new plan
      setUser({
        ...userData,
        token,
        subscriptionPlan: plan
      });
      
      return userData;
    } catch (error) {
      console.error('Subscription update failed', error);
      throw new Error('Failed to update subscription');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      isAdmin,
      hasRequiredPlan,
      updateSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
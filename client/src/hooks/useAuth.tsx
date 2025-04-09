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
}

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
        // Handle 401 errors gracefully by returning null instead of throwing
        const response = await apiRequest('GET', '/api/auth/me', undefined, { on401: "returnNull" });
        
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
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error('Login failed');
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
      const response = await apiRequest('GET', `/api/subscription-success?plan=${plan}`);
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }
      const result = await response.json();
      
      if (result.success && user) {
        // Update local user object with new plan
        setUser({
          ...user,
          subscriptionPlan: plan
        });
      }
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
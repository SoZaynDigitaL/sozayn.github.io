import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Define combined user type with auth and profile data
interface User {
  id: string;
  email: string;
  username: string;
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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: () => boolean;
  hasRequiredPlan: (requiredPlans: string[]) => boolean;
  updateSubscription: (plan: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  isLoading: true,
  isAdmin: () => false,
  hasRequiredPlan: () => false,
  updateSubscription: async () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to transform Supabase user and profile data to our User type
const transformUserData = (
  supabaseUser: SupabaseUser | null, 
  profile: Database['public']['Tables']['profiles']['Row'] | null
): User | null => {
  if (!supabaseUser || !profile) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: profile.username,
    businessName: profile.business_name,
    businessType: profile.business_type,
    role: profile.role,
    subscriptionPlan: profile.subscription_plan,
    stripeCustomerId: profile.stripe_customer_id || undefined,
    stripeSubscriptionId: profile.stripe_subscription_id || undefined,
    subscriptionStatus: profile.subscription_status || undefined,
    subscriptionExpiresAt: profile.subscription_expires_at || undefined,
    createdAt: profile.created_at
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setUser(null);
          return;
        }
        
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // Transform and set user data
        setUser(transformUserData(session.user, profile));
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchUserData();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (!session?.user) return;
          
          // Get user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          // Transform and set user data
          setUser(transformUserData(session.user, profile));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  };
  
  const signup = async (email: string, password: string, userData: Partial<User>) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError || !authData.user) {
        throw authError || new Error('Failed to create user');
      }
      
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        username: userData.username || email,
        email: email,
        business_name: userData.businessName || '',
        business_type: userData.businessType || 'restaurant',
        role: userData.role || 'client',
        subscription_plan: userData.subscriptionPlan || 'free'
      });
      
      if (profileError) {
        // If profile creation fails, we should delete the auth user or mark it for cleanup
        throw profileError;
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
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
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setUser(prev => prev ? { ...prev, subscriptionPlan: plan } : null);
    } catch (error) {
      console.error('Subscription update failed:', error);
      throw new Error('Failed to update subscription');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup,
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
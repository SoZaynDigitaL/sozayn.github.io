import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Check if the required environment variables are defined
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error("Supabase credentials missing: Check environment variables");
}

// Create a single supabase client for the browser session
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || '', 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Authentication helper functions
export const signUp = async ({ email, password, metadata = {} }: { 
  email: string; 
  password: string; 
  metadata?: Record<string, any>;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    }
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async ({ email, password }: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }
  
  return session;
};

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
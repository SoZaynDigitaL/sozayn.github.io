import { ReactNode, useEffect } from 'react';
import { useLocation, Route } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType;
  adminOnly?: boolean;
  path: string;
}

export function ProtectedRoute({ component: Component, adminOnly = false, path }: ProtectedRouteProps) {
  const [location, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  
  // We don't need useRoute anymore - using Route component directly
  
  // Handle authentication and authorization
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to auth page
        navigate('/auth');
      } else if (adminOnly && user.role !== 'admin') {
        // Not an admin, redirect to a permitted page
        navigate('/dashboard');
      }
    }
  }, [isLoading, user, navigate, adminOnly]);

  // Use the Route component from wouter to handle the path matching
  return (
    <Route path={path}>
      {(params) => {
        // If still loading auth state, show a loading spinner
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
            </div>
          );
        }
        
        // If the user is authenticated (and admin if required), render the component
        if (user && (!adminOnly || user.role === 'admin')) {
          return <Component />;
        }
        
        // This shouldn't be reached due to the redirect in useEffect
        return null;
      }}
    </Route>
  );
}
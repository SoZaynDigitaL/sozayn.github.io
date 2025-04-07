import { ReactNode, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
  path: string;
}

export function ProtectedRoute({ component: Component, adminOnly = false, path }: ProtectedRouteProps) {
  const [match] = useRoute(path);
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

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

  // If we're still loading auth state, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  // If the user is authenticated (and is an admin if adminOnly is true), render the component
  if (match && user && (!adminOnly || user.role === 'admin')) {
    return <Component user={user} />;
  }

  // This should not be rendered due to the redirect in useEffect
  return null;
}
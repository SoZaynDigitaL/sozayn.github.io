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
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
          </div>
        )}
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        {() => {
          navigate('/auth');
          return null;
        }}
      </Route>
    );
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <Route path={path}>
        {() => {
          navigate('/dashboard');
          return null;
        }}
      </Route>
    );
  }

  return (
    <Route path={path}>
      {() => <Component />}
    </Route>
  );
}
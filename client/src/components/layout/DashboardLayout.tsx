import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import DashboardSidebar from './DashboardSidebar';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  
  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }
  
  // Get initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    return user.businessName.charAt(0);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-dark">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <header className="py-4 px-6 border-b border-border-color flex items-center justify-between bg-bg-card z-10">
          <h1 className="text-lg font-semibold">
            {location === '/dashboard' && 'Dashboard'}
            {location === '/dashboard/orders' && 'Orders'}
            {location === '/dashboard/integrations' && 'Delivery Integrations'}
            {location === '/dashboard/ecommerce' && 'E-Commerce'}
            {location === '/dashboard/pos' && 'POS Integration'}
            {location === '/dashboard/management' && 'Restaurant Management'}
            {location === '/dashboard/marketing' && 'Marketing'}
            {location === '/dashboard/loyalty' && 'Loyalty & Rewards'}
            {location === '/dashboard/settings' && 'Settings'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent-blue/20 text-accent-blue">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-bg-card border border-border-color">
                <div className="px-2 py-1.5 text-sm font-medium text-text-primary">
                  {user.businessName}
                </div>
                <div className="px-2 py-1.5 text-xs text-text-secondary">
                  {user.email}
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigate('/dashboard/settings')}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive"
                  onClick={() => logout()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-bg-dark">
          {children}
        </main>
      </div>
    </div>
  );
}

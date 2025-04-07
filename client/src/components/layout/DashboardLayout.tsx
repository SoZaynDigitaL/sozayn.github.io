import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import DashboardSidebar from './DashboardSidebar';
import ClientSidebar from './ClientSidebar';
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
  
  // Redirect to auth page if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  // Get initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    return user.businessName.charAt(0);
  };

  // Helper function to get the page title based on the current location
  const getPageTitle = () => {
    // Base dashboard routes
    if (location === '/dashboard') return 'Dashboard';
    if (location === '/dashboard/orders') return 'Orders';
    if (location === '/dashboard/clients') return 'Client Management';
    if (location === '/dashboard/delivery-partners') return 'Delivery Partners';
    if (location === '/dashboard/e-commerce') return 'E-Commerce';
    if (location === '/dashboard/pos-integration') return 'POS Integration';
    if (location === '/dashboard/management') return 'Restaurant Management';
    if (location === '/dashboard/settings') return 'Settings';
    
    // Marketing routes
    if (location === '/dashboard/marketing') return 'Marketing';
    if (location === '/dashboard/marketing/seo') return 'SEO Management';
    if (location === '/dashboard/marketing/email') return 'Email Campaigns';
    if (location === '/dashboard/marketing/automated') return 'Automated Marketing';
    
    // Social media routes
    if (location === '/dashboard/social-media') return 'Social Media Integration';
    
    // Loyalty routes
    if (location === '/dashboard/loyalty') return 'Loyalty & Rewards';
    
    // Default fallback
    return 'SoZayn Dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-dark">
      {user?.role === 'admin' ? <DashboardSidebar /> : <ClientSidebar />}
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <header className="py-4 px-6 border-b border-border-color flex items-center justify-between bg-bg-card sticky top-0 z-20">
          <h1 className="text-lg font-semibold">
            {getPageTitle()}
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
                <div className="px-2 py-1 text-xs">
                  <span className={`px-1.5 py-0.5 rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-accent-purple/20 text-accent-purple' 
                      : 'bg-accent-green/20 text-accent-green'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'Client'}
                  </span>
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
        
        <main className="flex-1 overflow-y-auto p-6 bg-bg-dark relative">
          {children}
        </main>
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import ClientSidebar from './ClientSidebar';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ClientDashboardLayoutProps {
  children: ReactNode;
}

export default function ClientDashboardLayout({ children }: ClientDashboardLayoutProps) {
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
    const businessName = user.businessName || '';
    return businessName.charAt(0);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#141b2d]">
      <ClientSidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <header className="py-4 px-6 border-b border-[#1e2a45] flex items-center justify-between bg-[#1f2940] z-10">
          <h1 className="text-lg font-semibold">
            {location === '/dashboard' && 'Dashboard'}
            {location === '/dashboard/orders' && 'Orders'}
            {location === '/dashboard/delivery-partners' && 'Delivery Partners'}
            {location === '/dashboard/ecommerce' && 'E-Commerce'}
            {location === '/dashboard/pos' && 'POS Integration'}
            {location === '/dashboard/management' && 'Management'}
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
                    <AvatarFallback className="bg-[#4361ee]/20 text-[#4361ee]">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1f2940] border border-[#2d3748]">
                <div className="px-2 py-1.5 text-sm font-medium text-white">
                  {user.businessName}
                </div>
                <div className="px-2 py-1.5 text-xs text-gray-400">
                  {user.email}
                </div>
                <div className="px-2 py-1 text-xs">
                  <span className="px-1.5 py-0.5 rounded-full bg-[#4361ee]/20 text-[#4361ee]">
                    Client
                  </span>
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer text-gray-300 hover:text-white"
                  onClick={() => navigate('/dashboard/settings')}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-400"
                  onClick={() => logout()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-[#141b2d]">
          {children}
        </main>
      </div>
    </div>
  );
}
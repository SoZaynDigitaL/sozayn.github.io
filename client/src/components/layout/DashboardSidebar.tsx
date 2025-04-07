import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Gift, 
  Settings, 
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardSidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  
  // Improved isActive function to handle nested routes
  const isActive = (path: string) => {
    // Exact match for dashboard home
    if (path === '/dashboard' && location === '/dashboard') {
      return true;
    }
    
    // Special case for marketing section
    if (path === '/dashboard/marketing') {
      return location === path || 
             location.startsWith('/dashboard/marketing/seo') || 
             location.startsWith('/dashboard/marketing/email') || 
             location.startsWith('/dashboard/marketing/automated');
    }
    
    // For all other paths, check both exact match and if the current location starts with path
    return location === path || (path !== '/dashboard' && location.startsWith(`${path}/`));
  };
  const isAdmin = user?.role === 'admin';
  
  // Base navigation items for all users
  const baseNavigationItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/orders', icon: Package, label: 'Orders' },
    { href: '/dashboard/management', icon: Menu, label: 'Management' },
    { href: '/dashboard/marketing', icon: BarChart3, label: 'Marketing' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];
  
  // Admin-only items
  const adminNavigationItems = [
    { href: '/dashboard/clients', icon: Users, label: 'Clients' },
    { href: '/dashboard/loyalty', icon: Gift, label: 'Loyalty & Rewards' },
  ];
  
  // Combine navigation items based on user role
  const navigationItems = isAdmin 
    ? [...baseNavigationItems, ...adminNavigationItems] 
    : baseNavigationItems;
  
  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href);
    
    return (
      <Link href={href}>
        <div 
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            active 
              ? "bg-accent-blue/10 text-accent-blue" 
              : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </div>
      </Link>
    );
  };
  
  const SidebarContent = () => (
    <>
      <div className="px-4 py-6">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          SoZayn
          <span className="block text-xs text-text-secondary mt-[-2px]">Welcome To Digital Era</span>
        </Link>
      </div>
      
      <div className="px-3 py-2 flex-1">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavItem 
              key={item.href} 
              href={item.href} 
              icon={item.icon} 
              label={item.label} 
            />
          ))}
        </nav>
      </div>
      
      <div className="px-4 py-6 border-t border-border-color">
        <div className="bg-bg-card rounded-lg p-4 shadow-lg border border-border-color">
          <h4 className="font-medium text-sm mb-2">Need help?</h4>
          <p className="text-text-secondary text-xs mb-3">
            Our support team is ready to assist you with any questions.
          </p>
          <Button className="w-full text-xs" size="sm">
            Contact Support
          </Button>
        </div>
      </div>
    </>
  );
  
  return (
    <>
      {/* Mobile trigger */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed z-50 top-4 left-4 md:hidden"
      >
        <Sheet>
          <SheetTrigger asChild>
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-bg-chart border-border-color p-0 w-60">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </Button>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col w-64 bg-bg-chart border-r border-border-color sticky top-0 h-screen">
        <SidebarContent />
      </div>
    </>
  );
}

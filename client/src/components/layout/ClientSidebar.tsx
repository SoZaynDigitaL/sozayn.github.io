import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Package, 
  Truck, 
  ShoppingBag,
  Terminal,
  BarChart3,
  Gift, 
  Settings, 
  Menu,
  SearchIcon,
  MessageSquare,
  Share2,
  Megaphone,
  Mail,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { CollapsibleMenuItem } from '@/components/ui/collapsible-menu';

interface SubMenuItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

export default function ClientSidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  
  // Improved isActive function to better handle all routing edge cases
  const isActive = (path: string) => {
    // Exact match for dashboard home
    if (path === '/dashboard' && location === '/dashboard') {
      return true;
    }
    
    // Special case for marketing parent menu
    if (path === '/dashboard/marketing') {
      return location === path || 
             location.startsWith('/dashboard/marketing/seo') || 
             location.startsWith('/dashboard/marketing/email') || 
             location.startsWith('/dashboard/marketing/automated');
    }
    
    // For all other paths, check both exact match and if the current location starts with path
    return location === path || (path !== '/dashboard' && location.startsWith(`${path}/`));
  };
  
  // Marketing submenu items
  const marketingSubItems: SubMenuItem[] = [
    { href: '/dashboard/marketing/seo', label: 'SEO', icon: SearchIcon },
    { href: '/dashboard/marketing/email', label: 'Email Campaigns', icon: Mail },
    { href: '/dashboard/marketing/automated', label: 'Automated Marketing', icon: Megaphone },
  ];
  
  // Navigation items for client dashboard based on the screenshot
  const navigationItems: NavigationItem[] = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/orders', icon: Package, label: 'Orders' },
    { href: '/dashboard/delivery-partners', icon: Truck, label: 'Delivery Partners' },
    { href: '/dashboard/e-commerce', icon: ShoppingBag, label: 'E-Commerce' },
    { href: '/dashboard/pos-integration', icon: Terminal, label: 'POS Integration' },
    { 
      href: '/dashboard/marketing', 
      icon: BarChart3, 
      label: 'Marketing',
      subItems: marketingSubItems
    },
    { href: '/dashboard/social-media', icon: Share2, label: 'Social Media Integration' },
    { href: '/dashboard/loyalty', icon: Gift, label: 'Loyalty & Rewards' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];
  
  const SidebarContent = () => (
    <>
      <div className="px-4 py-6">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          SoZayn
          <span className="block text-xs text-text-secondary mt-[-2px]">Welcome To Restaurant/Grocery Retailer</span>
        </Link>
      </div>
      
      <div className="px-3 py-2 flex-1">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <CollapsibleMenuItem 
              key={item.href} 
              href={item.href} 
              icon={item.icon} 
              label={item.label}
              subItems={item.subItems}
              isActive={isActive}
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
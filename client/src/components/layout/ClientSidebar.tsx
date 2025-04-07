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
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

export default function ClientSidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  
  const isActive = (path: string) => location === path;
  
  // Navigation items for client dashboard based on the screenshot
  const navigationItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/orders', icon: Package, label: 'Orders' },
    { href: '/dashboard/delivery-partners', icon: Truck, label: 'Delivery Partners' },
    { href: '/dashboard/e-commerce', icon: ShoppingBag, label: 'E-Commerce' },
    { href: '/dashboard/pos-integration', icon: Terminal, label: 'POS Integration' },
    { href: '/dashboard/management', icon: Menu, label: 'Management' },
    { href: '/dashboard/marketing', icon: BarChart3, label: 'Marketing' },
    { href: '/dashboard/loyalty', icon: Gift, label: 'Loyalty & Rewards' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];
  
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
          <span className="block text-xs text-text-secondary mt-[-2px]">Welcome To Restaurant/Grocery Retailer</span>
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
      <div className="hidden md:flex md:flex-col w-64 bg-bg-chart border-r border-border-color">
        <SidebarContent />
      </div>
    </>
  );
}
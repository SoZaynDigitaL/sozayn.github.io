import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Package, 
  Layers, 
  ExternalLink, 
  BarChart3, 
  Gift, 
  Settings, 
  Menu, 
  X,
  Link as LinkIcon,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function DashboardSidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  
  const isActive = (path: string) => location === path;
  
  const toggleGroup = (group: string) => {
    setExpandedGroup(prev => prev === group ? null : group);
  };
  
  // Define types for navigation items
  type NavItemType = {
    href: string;
    icon: any;
    label: string;
    group?: undefined;
    items?: undefined;
  };

  type NavGroupType = {
    group: string;
    icon: any;
    label: string;
    href?: undefined;
    items: { href: string; label: string; }[];
  };

  const navigationItems: (NavItemType | NavGroupType)[] = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/orders', icon: Package, label: 'Orders' },
    { href: '/dashboard/integrations', icon: ExternalLink, label: 'Delivery Partners' },
    { href: '/dashboard/pos', icon: Layers, label: 'POS Integration' },
    { href: '/dashboard/webhooks', icon: LinkIcon, label: 'Webhooks' },
    {
      group: 'ecommerce',
      icon: ShoppingCart,
      label: 'E-commerce',
      items: [
        { href: '/dashboard/ecommerce/shopify', label: 'Shopify' },
        { href: '/dashboard/ecommerce/woocommerce', label: 'WooCommerce' },
        { href: '/dashboard/ecommerce/magento', label: 'Magento' },
        { href: '/dashboard/ecommerce/bigcommerce', label: 'BigCommerce' },
        { href: '/dashboard/ecommerce/squarespace', label: 'Squarespace' },
        { href: '/dashboard/ecommerce/wix', label: 'Wix' }
      ]
    },
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
  
  const GroupNavItem = ({ 
    group, 
    icon: Icon, 
    label, 
    items 
  }: { 
    group: string; 
    icon: any; 
    label: string; 
    items: { href: string; label: string; }[] 
  }) => {
    const isExpanded = expandedGroup === group;
    const hasActiveChild = items.some(item => isActive(item.href));
    
    return (
      <div>
        <div 
          className={cn(
            "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer",
            (isExpanded || hasActiveChild)
              ? "bg-accent-blue/10 text-accent-blue" 
              : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
          )}
          onClick={() => toggleGroup(group)}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </div>
          <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-1 ml-9 space-y-1">
            {items.map((subItem) => (
              <Link key={subItem.href} href={subItem.href}>
                <div 
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors text-sm",
                    isActive(subItem.href)
                      ? "bg-accent-blue/5 text-accent-blue" 
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
                  )}
                >
                  {subItem.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
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
          {navigationItems.map((item) => 
            'group' in item && item.group ? (
              <GroupNavItem 
                key={item.group}
                group={item.group}
                icon={item.icon}
                label={item.label}
                items={item.items || []}
              />
            ) : (
              <NavItem 
                key={'href' in item && item.href ? item.href : 'item-' + Math.random()}
                href={'href' in item && item.href ? item.href : '#'}
                icon={item.icon}
                label={item.label}
              />
            )
          )}
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

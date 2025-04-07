import { useState } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  ShoppingBag,
  Cog,
  Menu,
  X,
  HelpCircle,
  Award,
  BarChart3,
} from 'lucide-react';

export default function ClientSidebar() {
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) setIsOpen(false);
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      name: 'Delivery Partners',
      href: '/dashboard/delivery-partners',
      icon: <Truck className="w-5 h-5" />,
    },
    {
      name: 'E-Commerce',
      href: '/dashboard/ecommerce',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      name: 'POS Integration',
      href: '/dashboard/pos',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: 'Management',
      href: '/dashboard/management',
      icon: <Cog className="w-5 h-5" />,
    },
    {
      name: 'Marketing',
      href: '/dashboard/marketing',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: 'Loyalty & Rewards',
      href: '/dashboard/loyalty',
      icon: <Award className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <Cog className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 rounded-full bg-bg-card"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 bg-[#141b2d] h-screen overflow-y-auto flex flex-col transition-all duration-200 z-40",
          isMobile
            ? isOpen
              ? "fixed inset-y-0 left-0 w-64"
              : "fixed inset-y-0 -left-full w-64"
            : "w-64"
        )}
      >
        {/* Logo & Title */}
        <div className="p-4 border-b border-[#1e2a45]">
          <div className="flex items-center">
            <div className="mr-2 font-bold text-white text-lg">SoZayn</div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Welcome to Restaurant/Grocery Retailer
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm h-10 px-3",
                    location === item.href
                      ? "bg-[#4361ee]/10 text-[#4361ee]"
                      : "text-gray-300 hover:text-white hover:bg-[#1e2a45]"
                  )}
                  onClick={() => {
                    navigate(item.href);
                    closeSidebar();
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Help Section */}
        <div className="p-4 mx-4 mb-4 bg-[#1e2a45] rounded-lg">
          <h3 className="text-sm font-medium text-white mb-1">Need help?</h3>
          <p className="text-xs text-gray-400 mb-3">
            Our support team is ready to assist you with any questions.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-[#4361ee] hover:bg-[#3a56dd] text-white border-0"
            onClick={() => navigate('/dashboard/support')}
          >
            Contact Support
          </Button>
        </div>

        {/* Footer - empty space to match the design */}
        <div className="p-2">
        </div>
      </aside>

      {/* Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
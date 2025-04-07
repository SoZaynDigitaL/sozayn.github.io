import { useState } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  LayoutDashboard,
  ShoppingCart,
  Book,
  BarChart2,
  Clock,
  Tag,
  Settings,
  Menu,
  X,
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
      name: 'Menu Management',
      href: '/dashboard/menu',
      icon: <Book className="w-5 h-5" />,
    },
    {
      name: 'Insights',
      href: '/dashboard/insights',
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      name: 'Delivery Times',
      href: '/dashboard/delivery',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      name: 'Promotions',
      href: '/dashboard/promotions',
      icon: <Tag className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />,
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
          "flex-shrink-0 bg-bg-card border-r border-border-color h-screen overflow-y-auto flex flex-col transition-all duration-200 z-40",
          isMobile
            ? isOpen
              ? "fixed inset-y-0 left-0 w-64"
              : "fixed inset-y-0 -left-full w-64"
            : "w-64"
        )}
      >
        {/* Logo & Title */}
        <div className="p-6 border-b border-border-color">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-accent-green mr-3 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold">SoZayn</h1>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Business Portal</h2>
            <span className="text-sm text-text-secondary">
              Manage Your Restaurant
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm h-11",
                    location === item.href
                      ? "bg-accent-green/10 text-accent-green"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-chart"
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

        {/* Subscription Status */}
        <div className="p-4 mx-4 mb-4 border border-accent-blue/20 bg-accent-blue/5 rounded-lg">
          <h3 className="text-sm font-medium text-accent-blue mb-1">Growth Plan</h3>
          <p className="text-xs text-text-secondary mb-3">
            Your subscription renews on April 23
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-bg-card"
            onClick={() => navigate('/dashboard/settings/billing')}
          >
            Manage Subscription
          </Button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-color text-center">
          <p className="text-xs text-text-secondary">
            SoZayn © {new Date().getFullYear()}
          </p>
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
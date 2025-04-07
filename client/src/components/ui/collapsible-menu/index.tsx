import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface SubMenuItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CollapsibleMenuItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
  isActive: (path: string) => boolean;
}

export function CollapsibleMenuItem({ 
  href, 
  label, 
  icon: Icon, 
  subItems, 
  isActive 
}: CollapsibleMenuItemProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    // Auto-open if a child item is active
    if (subItems) {
      return subItems.some(item => isActive(item.href));
    }
    return false;
  });
  
  const active = isActive(href);
  const hasActiveChild = subItems?.some(item => isActive(item.href));
  
  // If this is just a regular menu item with no children
  if (!subItems || subItems.length === 0) {
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
  }
  
  // If this is a parent menu item with children
  return (
    <div className="space-y-1">
      <div 
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors",
          (active || hasActiveChild) 
            ? "bg-accent-blue/10 text-accent-blue" 
            : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </div>
      
      {isOpen && (
        <div className="pl-10 space-y-1">
          {subItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  isActive(item.href) 
                    ? "bg-accent-blue/10 text-accent-blue" 
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
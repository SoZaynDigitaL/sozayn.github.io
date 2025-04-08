import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface IntegrationCardProps {
  provider: string;
  icon: string;
  color?: string;
  isActive?: boolean;
  onToggle?: (value: boolean) => void;
  className?: string;
  description?: string;
  onClick?: () => void;
}

export function IntegrationCard({
  provider,
  icon,
  color = "text-text-primary",
  isActive = false,
  onToggle,
  className,
  description,
  onClick
}: IntegrationCardProps) {
  // Get background color based on the provider name for the HyperZod style
  const getBgColor = (name: string) => {
    const colors: Record<string, string> = {
      'DoorDash': 'bg-red-500/10',
      'UberEats': 'bg-green-500/10',
      'Grubhub': 'bg-orange-500/10',
      'Postmates': 'bg-blue-500/10',
      'SkipDishes': 'bg-purple-500/10',
    };
    
    return colors[name] || 'bg-gray-500/10';
  };
  
  // Get text color based on the provider name for the HyperZod style
  const getTextColor = (name: string) => {
    const colors: Record<string, string> = {
      'DoorDash': 'text-red-500',
      'UberEats': 'text-green-500',
      'Grubhub': 'text-orange-500',
      'Postmates': 'text-blue-500',
      'SkipDishes': 'text-purple-500',
    };
    
    return colors[name] || 'text-gray-500';
  };
  
  return (
    <div 
      className={cn(
        "relative rounded-lg border border-gray-100 overflow-hidden cursor-pointer transition-all hover:shadow-md",
        isActive ? "bg-white" : "bg-gray-50",
        className
      )}
      onClick={onClick}
    >
      {/* X mark in the corner - HyperZod style */}
      <div 
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 z-10"
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          if (onToggle) {
            onToggle(false);
          }
        }}
      >
        <X className="h-3.5 w-3.5 text-gray-400" />
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon circle with provider initials - HyperZod style */}
            <div className={`w-10 h-10 ${getBgColor(provider)} rounded-full flex items-center justify-center`}>
              <span className={`${getTextColor(provider)} font-bold text-sm`}>{icon}</span>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">{provider}</h3>
              {description && (
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          
          {/* Toggle switch - HyperZod style */}
          {onToggle && (
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={(e) => {
                  // Prevent triggering card's onClick when toggling the switch
                  if (onClick) {
                    const event = window.event;
                    if (event) {
                      event.stopPropagation();
                    }
                  }
                  onToggle(e);
                }}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

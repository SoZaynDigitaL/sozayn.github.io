import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

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
  return (
    <Card 
      className={cn("bg-bg-card border-border-color relative", className)}
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 p-1.5 rounded-full border border-border-color flex items-center justify-center cursor-pointer hover:bg-bg-chart"
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          // Info button functionality could be added here
        }}
      >
        <Info className="h-4 w-4 text-text-secondary" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <span className={`${color} font-bold text-sm`}>{icon}</span>
            </div>
            <div>
              <h3 className="font-medium">{provider}</h3>
              {description && (
                <p className="text-xs text-text-secondary">{description}</p>
              )}
            </div>
          </div>
          {onToggle && (
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
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

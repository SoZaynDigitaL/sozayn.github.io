import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  change?: number;
  progress?: number;
  progressColor?: string;
  className?: string;
  isNegative?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  progress,
  progressColor = 'bg-accent-blue',
  className,
  isNegative
}: StatsCardProps) {
  const isPositive = isNegative ? false : (change && change > 0);
  const progressWidth = progress ? `${progress}%` : '0%';
  
  return (
    <Card className={cn("bg-bg-chart border-border-color", className)}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-text-secondary mb-1">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
          {icon && (
            <div className="mt-0.5">
              {icon}
            </div>
          )}
        </div>
        
        {change && (
          <p className={cn(
            "text-xs flex items-center mt-1",
            isPositive ? "text-accent-green" : "text-red-500"
          )}>
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {isPositive ? '+' : ''}{change}%
          </p>
        )}
        
        {progress !== undefined && (
          <div className="h-2 w-full bg-bg-dark rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${progressColor}`} 
              style={{ width: progressWidth }}
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsRowProps {
  children: ReactNode;
  className?: string;
}

export function StatsRow({ children, className }: StatsRowProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
}

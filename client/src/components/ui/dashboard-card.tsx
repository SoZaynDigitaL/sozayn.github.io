import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
}

export function DashboardCard({
  title,
  description,
  children,
  className,
  footer,
  headerAction
}: DashboardCardProps) {
  return (
    <Card className={cn("bg-bg-card border-border-color shadow-lg", className)}>
      {(title || description) && (
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription className="text-text-secondary">{description}</CardDescription>}
            </div>
            {headerAction && (
              <div>
                {headerAction}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="pt-0 border-t border-border-color">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

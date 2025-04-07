import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  description,
  children,
  headerAction,
  className,
}: DashboardCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {children}
      </CardContent>
    </Card>
  );
}
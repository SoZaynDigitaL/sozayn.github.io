import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ 
  title, 
  description, 
  headerAction, 
  children, 
  className = "" 
}: DashboardCardProps) {
  return (
    <Card className={`bg-bg-card border-border-color overflow-hidden ${className}`}>
      <CardHeader className="px-6 py-5 flex flex-row items-center justify-between bg-bg-chart/50 border-b border-border-color">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <p className="text-xs text-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
        {headerAction && (
          <div className="flex items-center">{headerAction}</div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
}
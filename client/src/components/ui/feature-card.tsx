import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "bg-bg-card border border-border-color rounded-xl p-6 shadow-card card-hover-effect transition-all duration-300",
      className
    )}>
      <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-text-secondary">
        {description}
      </p>
    </div>
  );
}

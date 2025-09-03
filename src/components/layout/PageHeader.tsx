import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  };
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  children,
  className,
}) => {
  return (
    <div className={cn('pb-4 md:pb-6 mb-4 md:mb-6 border-b', className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {action && (
          <Button onClick={action.onClick} className="shrink-0" disabled={action.disabled}>
            {action.icon}
            {action.label}
          </Button>
        )}
        
        {children}
      </div>
    </div>
  );
};
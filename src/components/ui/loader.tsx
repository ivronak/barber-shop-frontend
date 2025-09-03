import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

/**
 * Displays a centered spinning icon, useful for page-level loading states.
 */
export const Loader: React.FC<LoaderProps> = ({ size = 32, className, ...props }) => {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      aria-label="Loading"
      role="status"
      {...props}
    >
      <Loader2
        className="animate-spin text-primary"
        style={{ width: size, height: size }}
      />
    </div>
  );
}; 
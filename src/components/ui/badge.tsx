import React from 'react';
import { cn } from './button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'notFollowing' | 'mutual' | 'fan';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    default: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground',
    notFollowing: 'bg-status-notFollowing/15 text-status-notFollowing border border-status-notFollowing/30 dark:bg-status-notFollowing/25',
    mutual: 'bg-status-mutual/15 text-status-mutual border border-status-mutual/30 dark:bg-status-mutual/25',
    fan: 'bg-status-fan/15 text-status-fan border border-status-fan/30 dark:bg-status-fan/25',
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}

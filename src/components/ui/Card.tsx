import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
  <article className={cn('ui-card', className)} {...props} />
);

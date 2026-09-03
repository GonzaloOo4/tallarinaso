import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const ColorableName = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('colorable-name', className)} {...props} />
);

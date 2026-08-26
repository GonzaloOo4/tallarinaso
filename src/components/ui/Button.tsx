import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'quiet';
};

export const Button = ({ className, variant = 'solid', ...props }: ButtonProps) => (
  <button className={cn('ui-button', `ui-button-${variant}`, className)} {...props} />
);

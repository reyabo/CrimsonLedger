import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        neutral: 'border-ink-3 bg-ink-2 text-bone',
        crimson: 'border-crimson/60 bg-crimson/20 text-crimson-bright',
        warn: 'border-warn/60 bg-warn/15 text-warn',
        danger: 'border-danger/60 bg-danger/15 text-danger',
        outline: 'border-ink-3 bg-transparent text-bone-muted',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

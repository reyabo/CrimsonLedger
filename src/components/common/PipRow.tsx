'use client';

import * as React from 'react';
import { Pip, type PipVariant } from './Pip';
import type { PipState } from '@/domain/types';
import { cn } from '@/lib/cn';

interface PipRowProps {
  states: PipState[];
  variant?: PipVariant;
  size?: 'sm' | 'md' | 'lg';
  ariaLabelFor?: (index: number, state: PipState) => string;
  onCycle?: (index: number) => void;
  className?: string;
}

/** Responsive flex row of Pips; wraps on narrow viewports. */
export function PipRow({
  states,
  variant,
  size = 'md',
  ariaLabelFor,
  onCycle,
  className,
}: PipRowProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} role="group">
      {states.map((s, i) => (
        <Pip
          key={i}
          state={s}
          size={size}
          variant={variant}
          ariaLabel={ariaLabelFor?.(i, s)}
          onCycle={onCycle ? () => onCycle(i) : undefined}
        />
      ))}
    </div>
  );
}

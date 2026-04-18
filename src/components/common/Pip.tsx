'use client';

import * as React from 'react';
import type { PipState } from '@/domain/types';
import { cn } from '@/lib/cn';
import { haptic } from '@/hooks/useHotkeys';

export type PipVariant = 'health' | 'willpower' | 'hunger' | 'humanity' | 'stain' | 'generic';

type PipSize = 'sm' | 'md' | 'lg';

type FillState = PipState | 'filled';

interface PipProps {
  state: FillState;
  size?: PipSize;
  variant?: PipVariant;
  ariaLabel?: string;
  onCycle?: () => void;
  title?: string;
}

const sizeClasses: Record<PipSize, string> = {
  sm: 'h-4 w-4 text-[10px]',
  md: 'h-6 w-6 text-xs',
  lg: 'h-8 w-8 text-sm',
};

const variantFill: Record<PipVariant, string> = {
  health: 'bg-crimson/80',
  willpower: 'bg-crimson/80',
  hunger: 'bg-crimson-bright',
  humanity: 'bg-bone/90',
  stain: 'bg-crimson-bright',
  generic: 'bg-bone/80',
};

/**
 * Accessible clickable pip box used for damage, hunger, humanity, and custom
 * trackers. Empty pips show a hollow outline; filled pips use their variant
 * color. Damage pips also render a slash (superficial) or cross (aggravated)
 * glyph for clarity at a glance.
 */
export function Pip({
  state,
  size = 'md',
  variant = 'generic',
  ariaLabel,
  onCycle,
  title,
}: PipProps) {
  const isInteractive = Boolean(onCycle);
  const base = 'relative flex items-center justify-center rounded-[3px] border transition-colors';
  const border = state === 'empty' ? 'border-ink-3' : 'border-bone/30';
  const fill =
    state === 'empty'
      ? 'bg-ink-0'
      : state === 'filled'
        ? variantFill[variant]
        : state === 'aggravated'
          ? 'bg-crimson/50'
          : 'bg-ink-2';

  const content = (
    <span aria-hidden className="font-mono leading-none text-bone">
      {state === 'superficial' ? '/' : state === 'aggravated' ? '×' : ''}
    </span>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        title={title}
        className={cn(
          base,
          border,
          fill,
          sizeClasses[size],
          'cursor-pointer select-none hover:border-bone/60 active:scale-[0.94]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson',
        )}
        onClick={() => {
          haptic(6);
          onCycle?.();
        }}
      >
        {content}
      </button>
    );
  }
  return (
    <span
      className={cn(base, border, fill, sizeClasses[size])}
      aria-label={ariaLabel}
      title={title}
    >
      {content}
    </span>
  );
}

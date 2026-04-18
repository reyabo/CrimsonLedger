'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BOUNDS, hungerSeverity } from '@/domain/rules';
import { LABELS } from '@/domain/labels';
import { useLedgerStore } from '@/store/ledgerStore';
import type { Profile } from '@/domain/types';
import { cn } from '@/lib/cn';

/** Sticky bottom bar on the profile page with the most-used action: Hunger. */
export function QuickBar({ profile }: { profile: Profile }) {
  const adjust = useLedgerStore((s) => s.adjustThirst);
  const severity = hungerSeverity(profile.thirst);
  const tone =
    severity === 'critical'
      ? 'border-danger/70 bg-danger/10'
      : severity === 'high'
        ? 'border-warn/60 bg-warn/10'
        : 'border-ink-3 bg-ink-1/95';

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 backdrop-blur sm:hidden',
        tone,
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-widest text-bone-muted">{LABELS.thirst}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="subtle"
            size="icon"
            aria-label="Decrease hunger"
            onClick={() => adjust(profile.id, -1)}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <span className="w-10 text-center text-2xl font-semibold tabular-nums">
            {profile.thirst}
          </span>
          <span className="text-xs text-bone-muted">/ {BOUNDS.hungerMax}</span>
          <Button
            variant="primary"
            size="icon"
            aria-label="Increase hunger"
            onClick={() => adjust(profile.id, +1)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

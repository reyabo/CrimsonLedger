'use client';

import * as React from 'react';
import { Minus, Plus, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LABELS } from '@/domain/labels';
import type { DamageTrack } from '@/domain/types';

interface Props {
  track: DamageTrack;
  onAdjust: (kind: 'superficial' | 'aggravated', delta: number) => void;
  onClear: () => void;
  onChangeMax: (max: number) => void;
}

/** Plain +/- controls for users who prefer explicit buttons over pip-tapping. */
export function DamageAltPanel({ track, onAdjust, onClear, onChangeMax }: Props) {
  return (
    <div className="mt-3 rounded-md border border-ink-3 bg-ink-0/50 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Row
          label={LABELS.superficial}
          value={track.superficial}
          onMinus={() => onAdjust('superficial', -1)}
          onPlus={() => onAdjust('superficial', +1)}
        />
        <Row
          label={LABELS.aggravated}
          value={track.aggravated}
          onMinus={() => onAdjust('aggravated', -1)}
          onPlus={() => onAdjust('aggravated', +1)}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="track-max" className="mb-0">
            Max
          </Label>
          <input
            id="track-max"
            type="number"
            min={1}
            max={20}
            value={track.max}
            onChange={(e) => onChangeMax(Number(e.target.value))}
            className="h-8 w-16 rounded-md border border-ink-3 bg-ink-1 px-2 text-sm tabular-nums text-bone focus:outline-none focus:ring-2 focus:ring-crimson"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <Eraser className="h-4 w-4" /> Clear all
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-ink-3 bg-ink-2 px-3 py-2">
      <span className="text-sm text-bone">{label}</span>
      <div className="flex items-center gap-2">
        <Button variant="subtle" size="iconSm" aria-label={`Decrease ${label}`} onClick={onMinus}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-6 text-center tabular-nums">{value}</span>
        <Button variant="subtle" size="iconSm" aria-label={`Increase ${label}`} onClick={onPlus}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

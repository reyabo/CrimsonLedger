'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Pip } from '@/components/common/Pip';
import { Button } from '@/components/ui/button';
import { DangerBadge } from '@/components/common/DangerBadge';
import { SectionCard } from '@/components/common/SectionCard';
import { LABELS } from '@/domain/labels';
import { BOUNDS, atDegenerationRisk, humanitySeverity } from '@/domain/rules';
import { useLedgerStore } from '@/store/ledgerStore';
import type { Profile } from '@/domain/types';

/**
 * Humanity is rendered as a 10-box track: filled Humanity dots fill from the
 * left, and Stains overlay the right side with a crimson marker. V5-accurate.
 */
export function HumanityTrack({ profile }: { profile: Profile }) {
  const adjustHumanity = useLedgerStore((s) => s.adjustHumanity);
  const adjustStains = useLedgerStore((s) => s.adjustStains);

  const severity = humanitySeverity(profile.morality);
  const tone = severity === 'critical' ? 'danger' : 'normal';
  const degeneration = atDegenerationRisk(profile.morality, profile.marks);

  const pips: Array<'humanity' | 'empty' | 'stain'> = Array.from(
    { length: BOUNDS.humanityMax },
    (_, i) => {
      if (i < profile.morality) return 'humanity';
      if (i >= BOUNDS.humanityMax - profile.marks) return 'stain';
      return 'empty';
    },
  );

  return (
    <SectionCard
      title={LABELS.morality}
      subtitle={`${profile.morality} / ${BOUNDS.humanityMax}  ·  ${LABELS.marks}: ${profile.marks}`}
      tone={tone}
      actions={degeneration ? <DangerBadge kind="degeneration" /> : null}
    >
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={LABELS.morality}>
        {pips.map((kind, i) => (
          <Pip
            key={i}
            state={kind === 'empty' ? 'empty' : 'filled'}
            variant={kind === 'stain' ? 'stain' : 'humanity'}
            size="md"
            ariaLabel={
              kind === 'humanity'
                ? `${LABELS.morality} ${i + 1}`
                : kind === 'stain'
                  ? `${LABELS.marks} ${BOUNDS.humanityMax - i}`
                  : 'empty'
            }
          />
        ))}
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-md border border-ink-3 bg-ink-2 px-3 py-2">
          <span className="text-bone">{LABELS.morality}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              size="iconSm"
              aria-label="Decrease Humanity"
              onClick={() => adjustHumanity(profile.id, -1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center tabular-nums">{profile.morality}</span>
            <Button
              variant="subtle"
              size="iconSm"
              aria-label="Increase Humanity"
              onClick={() => adjustHumanity(profile.id, +1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md border border-ink-3 bg-ink-2 px-3 py-2">
          <span className="text-bone">{LABELS.marks}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              size="iconSm"
              aria-label="Decrease Stains"
              onClick={() => adjustStains(profile.id, -1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center tabular-nums">{profile.marks}</span>
            <Button
              variant="subtle"
              size="iconSm"
              aria-label="Increase Stains"
              onClick={() => adjustStains(profile.id, +1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

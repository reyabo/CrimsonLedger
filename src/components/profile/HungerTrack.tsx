'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pip } from '@/components/common/Pip';
import { SectionCard } from '@/components/common/SectionCard';
import { LABELS } from '@/domain/labels';
import { BOUNDS, hungerSeverity } from '@/domain/rules';
import { cn } from '@/lib/cn';
import { useLedgerStore } from '@/store/ledgerStore';
import type { Profile } from '@/domain/types';

export function HungerTrack({ profile }: { profile: Profile }) {
  const adjust = useLedgerStore((s) => s.adjustThirst);
  const setValue = useLedgerStore((s) => s.setThirst);

  const severity = hungerSeverity(profile.thirst);
  const tone = severity === 'critical' ? 'danger' : severity === 'high' ? 'warn' : 'normal';

  return (
    <SectionCard
      title={LABELS.thirst}
      subtitle={`${profile.thirst} / ${BOUNDS.hungerMax}`}
      tone={tone}
      actions={
        <>
          <Button
            variant="subtle"
            size="iconSm"
            aria-label="Decrease hunger"
            onClick={() => adjust(profile.id, -1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="subtle"
            size="iconSm"
            aria-label="Increase hunger"
            onClick={() => adjust(profile.id, +1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div
        className={cn(
          'flex gap-2',
          severity === 'critical' && 'animate-pulseCrimson rounded-md',
        )}
      >
        {Array.from({ length: BOUNDS.hungerMax }).map((_, i) => (
          <Pip
            key={i}
            state={i < profile.thirst ? 'filled' : 'empty'}
            size="lg"
            variant="hunger"
            ariaLabel={`Hunger pip ${i + 1}`}
            onCycle={() =>
              setValue(profile.id, i + 1 === profile.thirst ? profile.thirst - 1 : i + 1)
            }
          />
        ))}
      </div>
    </SectionCard>
  );
}

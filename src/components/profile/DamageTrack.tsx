'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PipRow } from '@/components/common/PipRow';
import { DangerBadge } from '@/components/common/DangerBadge';
import { SectionCard } from '@/components/common/SectionCard';
import { DamageAltPanel } from './DamageAltPanel';
import { LABELS } from '@/domain/labels';
import { isImpaired, isTorpor, pipStatesFor, totalDamage } from '@/domain/rules';
import { useLedgerStore } from '@/store/ledgerStore';
import type { Profile } from '@/domain/types';

interface DamageTrackProps {
  profile: Profile;
  kind: 'health' | 'willpower';
}

export function DamageTrack({ profile, kind }: DamageTrackProps) {
  const track = profile[kind];
  const cyclePip = useLedgerStore((s) => s.cycleTrackPip);
  const adjustTrack = useLedgerStore((s) => s.adjustTrack);
  const clearTrack = useLedgerStore((s) => s.clearTrack);
  const setTrackMax = useLedgerStore((s) => s.setTrackMax);

  const [showAlt, setShowAlt] = React.useState(false);

  const impaired = isImpaired(track);
  const torpor = kind === 'health' && isTorpor(track);
  const tone = torpor ? 'danger' : impaired ? 'warn' : 'normal';

  const states = pipStatesFor(track);
  const filled = totalDamage(track);

  return (
    <SectionCard
      title={kind === 'health' ? LABELS.health : LABELS.willpower}
      subtitle={`${filled} / ${track.max} filled`}
      tone={tone}
      actions={
        <>
          {torpor ? <DangerBadge kind="torpor" /> : impaired ? <DangerBadge kind="impaired" /> : null}
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={showAlt ? 'Hide +/- panel' : 'Show +/- panel'}
            onClick={() => setShowAlt((v) => !v)}
          >
            {showAlt ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </>
      }
    >
      <PipRow
        states={states}
        variant={kind === 'health' ? 'health' : 'willpower'}
        size="lg"
        ariaLabelFor={(i, s) => `${kind} pip ${i + 1} ${s}`}
        onCycle={(i) => cyclePip(profile.id, kind, i)}
      />

      {showAlt ? (
        <DamageAltPanel
          track={track}
          onAdjust={(dmg, delta) => adjustTrack(profile.id, kind, dmg, delta)}
          onClear={() => clearTrack(profile.id, kind)}
          onChangeMax={(max) => setTrackMax(profile.id, kind, max)}
        />
      ) : null}
    </SectionCard>
  );
}

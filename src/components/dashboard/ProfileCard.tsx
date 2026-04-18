'use client';

import * as React from 'react';
import Link from 'next/link';
import { Pip } from '@/components/common/Pip';
import { Badge } from '@/components/ui/badge';
import { LABELS } from '@/domain/labels';
import { BOUNDS, hungerSeverity, isImpaired, isTorpor, pipStatesFor, totalDamage } from '@/domain/rules';
import type { Profile } from '@/domain/types';
import { cn } from '@/lib/cn';

export function ProfileCard({ profile }: { profile: Profile }) {
  const hs = hungerSeverity(profile.thirst);
  const healthImpaired = isImpaired(profile.health);
  const healthTorpor = isTorpor(profile.health);
  const wpImpaired = isImpaired(profile.willpower);

  const edge =
    healthTorpor || hs === 'critical'
      ? 'border-danger/70 shadow-glow'
      : healthImpaired || wpImpaired || hs === 'high'
        ? 'border-warn/60'
        : 'border-ink-3 hover:border-crimson/60';

  const healthStates = pipStatesFor(profile.health).slice(0, 10);

  return (
    <Link
      href={`/profile?id=${profile.id}`}
      className={cn(
        'group block rounded-lg border bg-ink-1 p-4 transition-colors',
        edge,
        profile.archived && 'opacity-60',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-serif text-lg text-bone">{profile.name}</p>
          {profile.chronicle ? (
            <p className="truncate text-[10px] uppercase tracking-wider text-bone-muted">
              {profile.chronicle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {profile.archived ? <Badge variant="outline">Archived</Badge> : null}
          {healthTorpor ? (
            <Badge variant="danger">Torpor</Badge>
          ) : healthImpaired ? (
            <Badge variant="warn">Impaired</Badge>
          ) : null}
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-bone-muted">
        <span className="w-16 shrink-0">{LABELS.thirst}</span>
        <div className="flex gap-1">
          {Array.from({ length: BOUNDS.hungerMax }, (_, i) => (
            <Pip
              key={i}
              state={i < profile.thirst ? 'filled' : 'empty'}
              size="sm"
              variant="hunger"
            />
          ))}
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-bone-muted">
        <span className="w-16 shrink-0">{LABELS.health}</span>
        <div className="flex flex-wrap gap-1">
          {healthStates.map((s, i) => (
            <Pip key={i} state={s} size="sm" variant="health" />
          ))}
          <span className="ml-1 tabular-nums">
            {totalDamage(profile.health)} / {profile.health.max}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-bone-muted">
        <span className="w-16 shrink-0">{LABELS.morality}</span>
        <span className="tabular-nums">
          {profile.morality} / {BOUNDS.humanityMax}{' '}
          {profile.marks > 0 ? (
            <span className="text-crimson-bright">+{profile.marks} {LABELS.marks.toLowerCase()}</span>
          ) : null}
        </span>
      </div>
    </Link>
  );
}

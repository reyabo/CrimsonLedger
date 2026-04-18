'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard } from '@/components/common/SectionCard';
import { LABELS } from '@/domain/labels';
import { useLedgerStore } from '@/store/ledgerStore';
import type { Profile } from '@/domain/types';
import { cn } from '@/lib/cn';

export function ConditionsList({ profile }: { profile: Profile }) {
  const addCondition = useLedgerStore((s) => s.addCondition);
  const removeCondition = useLedgerStore((s) => s.removeCondition);
  const recent = useLedgerStore((s) => s.recentConditionLabels);

  const [draft, setDraft] = React.useState('');

  const suggestions = React.useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return [];
    const existing = new Set(profile.conditions.map((c) => c.label.toLowerCase()));
    return recent
      .filter((l) => l.toLowerCase().includes(q) && !existing.has(l.toLowerCase()))
      .slice(0, 5);
  }, [draft, recent, profile.conditions]);

  function commit(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    addCondition(profile.id, trimmed);
    setDraft('');
  }

  return (
    <SectionCard
      title={LABELS.conditions}
      subtitle={profile.conditions.length === 0 ? 'No active conditions' : undefined}
    >
      {profile.conditions.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {profile.conditions.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.note ?? 'Remove'}
              onClick={() => removeCondition(profile.id, c.id)}
              className={cn(
                'group inline-flex items-center gap-1 rounded-full border border-crimson/50 bg-crimson/15 px-3 py-1 text-xs text-bone',
                'hover:bg-crimson/30',
              )}
            >
              {c.label}
              <X className="h-3 w-3 opacity-60 group-hover:opacity-100" aria-hidden />
              <span className="sr-only">Remove</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add condition (e.g. Beast hungers)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(draft);
            }
          }}
        />
        <Button variant="subtle" size="icon" aria-label="Add condition" onClick={() => commit(draft)}>
          <Plus className="h-4 w-4" />
        </Button>
        {suggestions.length > 0 ? (
          <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-md border border-ink-3 bg-ink-1 p-1 text-sm shadow-xl">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="block w-full rounded-sm px-3 py-2 text-left hover:bg-ink-2"
                  onClick={() => commit(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SectionCard>
  );
}

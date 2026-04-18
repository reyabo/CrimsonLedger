'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { SectionCard } from '@/components/common/SectionCard';
import { useLedgerStore } from '@/store/ledgerStore';
import type { Profile } from '@/domain/types';

export function ShortNotes({ profile }: { profile: Profile }) {
  const setShortNotes = useLedgerStore((s) => s.setShortNotes);

  // Local draft avoids writing on every keystroke; commit onBlur + debounce.
  const [draft, setDraft] = React.useState(profile.shortNotes);

  React.useEffect(() => {
    setDraft(profile.shortNotes);
  }, [profile.id, profile.shortNotes]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      if (draft !== profile.shortNotes) setShortNotes(profile.id, draft);
    }, 400);
    return () => window.clearTimeout(t);
  }, [draft, profile.id, profile.shortNotes, setShortNotes]);

  return (
    <SectionCard title="Session Notes" subtitle="Short scratchpad — not a journal">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Who owes whom, where you parked the car, …"
        rows={3}
        maxLength={4000}
      />
    </SectionCard>
  );
}

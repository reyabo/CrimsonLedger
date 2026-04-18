'use client';

import * as React from 'react';
import { useHydrate } from '@/hooks/useHydrate';
import {
  selectActiveProfiles,
  selectArchivedProfiles,
  useLedgerStore,
} from '@/store/ledgerStore';
import { ProfileGrid } from '@/components/dashboard/ProfileGrid';
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard';
import { NewProfileDialog } from '@/components/dashboard/NewProfileDialog';

export default function DashboardPage() {
  const ready = useHydrate();
  const active = useLedgerStore(selectActiveProfiles);
  const archived = useLedgerStore(selectArchivedProfiles);

  if (!ready) {
    return (
      <div className="mt-20 text-center text-sm text-bone-dim" aria-busy>
        Loading…
      </div>
    );
  }

  if (active.length === 0 && archived.length === 0) {
    return <EmptyDashboard />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-bone">Characters</h1>
        <NewProfileDialog label="New" size="md" />
      </div>
      <ProfileGrid profiles={active} />
      {archived.length > 0 ? <ProfileGrid profiles={archived} label="Archived" /> : null}
    </div>
  );
}

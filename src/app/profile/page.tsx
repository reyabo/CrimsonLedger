'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHydrate } from '@/hooks/useHydrate';
import { selectProfile, useLedgerStore } from '@/store/ledgerStore';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { HungerTrack } from '@/components/profile/HungerTrack';
import { HumanityTrack } from '@/components/profile/HumanityTrack';
import { DamageTrack } from '@/components/profile/DamageTrack';
import { ConditionsList } from '@/components/profile/ConditionsList';
import { CustomTrackers } from '@/components/profile/CustomTrackers';
import { ShortNotes } from '@/components/profile/ShortNotes';
import { QuickBar } from '@/components/layout/QuickBar';
import { useHotkeys } from '@/hooks/useHotkeys';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <React.Suspense fallback={<Loading />}>
      <ProfilePageInner />
    </React.Suspense>
  );
}

function Loading() {
  return (
    <div className="mt-20 text-center text-sm text-bone-dim" aria-busy>
      Loading…
    </div>
  );
}

function ProfilePageInner() {
  const ready = useHydrate();
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id');
  const profile = useLedgerStore(selectProfile(id));
  const setActive = useLedgerStore((s) => s.setActive);
  const adjustThirst = useLedgerStore((s) => s.adjustThirst);
  const undo = useLedgerStore((s) => s.undo);

  React.useEffect(() => {
    if (id) setActive(id);
    return () => setActive(null);
  }, [id, setActive]);

  useHotkeys(
    React.useCallback(
      (e: KeyboardEvent) => {
        if (!profile) return;
        if (e.key === 'h') adjustThirst(profile.id, +1);
        else if (e.key === 'H') adjustThirst(profile.id, -1);
        else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          undo();
        }
      },
      [profile, adjustThirst, undo],
    ),
  );

  if (!ready) return <Loading />;

  if (!profile) {
    return (
      <div className="mx-auto mt-20 flex max-w-md flex-col items-center gap-3 text-center">
        <p className="text-bone">No such profile on this device.</p>
        <Button asChild variant="outline">
          <Link href="/">Back to dashboard</Link>
        </Button>
        <button type="button" className="hidden" onClick={() => router.push('/')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-28 sm:pb-6">
      <ProfileHeader profile={profile} />
      <div className="grid gap-4 lg:grid-cols-2">
        <HungerTrack profile={profile} />
        <HumanityTrack profile={profile} />
        <DamageTrack profile={profile} kind="health" />
        <DamageTrack profile={profile} kind="willpower" />
        <ConditionsList profile={profile} />
        <CustomTrackers profile={profile} />
        <div className="lg:col-span-2">
          <ShortNotes profile={profile} />
        </div>
      </div>
      <QuickBar profile={profile} />
    </div>
  );
}

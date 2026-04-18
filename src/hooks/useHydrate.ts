'use client';

import { useEffect, useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';

/** Ensures the store has been hydrated from IndexedDB before rendering app UI. */
export function useHydrate(): boolean {
  const hydrated = useLedgerStore((s) => s._hydrated);
  const hydrate = useLedgerStore((s) => s.hydrate);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void hydrate();
  }, [hydrate]);

  return mounted && hydrated;
}

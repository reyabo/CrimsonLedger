'use client';

import { useEffect, useState } from 'react';
import { useLedgerStore, UNDO_TTL_MS_EXPORT } from '@/store/ledgerStore';

/**
 * Reports whether an undoable snapshot is currently valid.
 * Re-evaluates on a tick so the snackbar auto-dismisses.
 */
export function useUndoAvailable(): { available: boolean; label: string } {
  const snapshot = useLedgerStore((s) => s.lastSnapshot);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!snapshot) return;
    const remaining = UNDO_TTL_MS_EXPORT - (Date.now() - snapshot.at);
    if (remaining <= 0) {
      tick((n) => n + 1);
      return;
    }
    const t = window.setTimeout(() => tick((n) => n + 1), remaining + 50);
    return () => window.clearTimeout(t);
  }, [snapshot]);

  if (!snapshot) return { available: false, label: '' };
  const age = Date.now() - snapshot.at;
  return { available: age <= UNDO_TTL_MS_EXPORT, label: snapshot.label };
}

'use client';

import * as React from 'react';
import { Undo2 } from 'lucide-react';
import { useLedgerStore } from '@/store/ledgerStore';
import { useUndoAvailable } from '@/hooks/useUndo';

/** Floating undo toast anchored above the bottom bar. */
export function UndoSnackbar() {
  const { available, label } = useUndoAvailable();
  const undo = useLedgerStore((s) => s.undo);
  if (!available) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-ink-3 bg-ink-1/95 px-4 py-2 text-sm text-bone shadow-lg">
        <span className="text-bone-muted">{label}</span>
        <button
          type="button"
          onClick={undo}
          className="flex items-center gap-1 rounded-full bg-crimson px-3 py-1 text-xs font-medium text-bone hover:bg-crimson-bright"
        >
          <Undo2 className="h-3 w-3" />
          Undo
        </button>
      </div>
    </div>
  );
}

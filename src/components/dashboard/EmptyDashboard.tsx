import * as React from 'react';
import { NewProfileDialog } from './NewProfileDialog';

export function EmptyDashboard() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-dashed border-ink-3 bg-ink-1 p-10 text-center">
      <h2 className="font-serif text-2xl text-bone">No blood in the ledger yet</h2>
      <p className="text-sm text-bone-muted">
        Add a character to start tracking Hunger, Humanity, Health, Willpower, Stains, and anything
        else that moves during play.
      </p>
      <NewProfileDialog label="Add your first character" size="lg" />
    </div>
  );
}

// Domain types for Crimson Ledger.
//
// Internals use system-neutral names (thirst, morality, marks) so the engine
// stays reusable; UI labels live in `labels.ts` and render game terms.

export type ID = string;

export type DamageTrack = {
  /** Maximum number of boxes. */
  max: number;
  /** Filled superficial boxes. */
  superficial: number;
  /** Filled aggravated boxes. Aggravated displace superficial at max. */
  aggravated: number;
};

export type Condition = {
  id: ID;
  label: string;
  note?: string;
};

export type CustomTrackerDisplay = 'counter' | 'pips' | 'checklist';

export type CustomTracker = {
  id: ID;
  label: string;
  currentValue: number;
  maxValue?: number;
  displayType: CustomTrackerDisplay;
  /** For `checklist` display: labels for each checkbox, 1:1 with maxValue. */
  items?: string[];
};

export type Profile = {
  id: ID;
  name: string;
  chronicle?: string;

  /** UI: Hunger (0–5). */
  thirst: number;
  /** UI: Humanity (0–10). */
  morality: number;
  /** UI: Stains (0–10). */
  marks: number;

  /** UI: Health. */
  health: DamageTrack;
  /** UI: Willpower. */
  willpower: DamageTrack;

  conditions: Condition[];
  customTrackers: CustomTracker[];
  shortNotes: string;

  archived: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Snapshot = {
  /** Profile id that was mutated; used to scope undo invalidation. */
  profileId: ID | null;
  /** The whole profile record before the mutation. */
  profile: Profile | null;
  /** ISO-ish epoch ms the snapshot was taken. */
  at: number;
  /** Human-readable label for the snapshot source, e.g. "Edit Hunger". */
  label: string;
};

export type LedgerState = {
  profiles: Record<ID, Profile>;
  /** Ordered list of profile ids; controls dashboard ordering. */
  order: ID[];
  /** Recently used condition labels, for quick-add autocomplete. */
  recentConditionLabels: string[];
  activeId: ID | null;
  lastSnapshot: Snapshot | null;
  /** Internal hydration flag. */
  _hydrated: boolean;
};

/** JSON export envelope. Versioned so future formats can migrate. */
export type ExportEnvelope = {
  version: 1;
  exportedAt: number;
  profiles: Profile[];
};

export type PipState = 'empty' | 'superficial' | 'aggravated';

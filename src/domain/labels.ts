// Single source of truth for UI-facing labels.
// Internal keys stay generic; this map translates them to V5 game terms.

export const LABELS = {
  thirst: 'Hunger',
  morality: 'Humanity',
  marks: 'Stains',
  health: 'Health',
  willpower: 'Willpower',
  superficial: 'Superficial',
  aggravated: 'Aggravated',
  conditions: 'Conditions',
  customTrackers: 'Custom Trackers',
  shortNotes: 'Session Notes',
} as const;

export type LabelKey = keyof typeof LABELS;

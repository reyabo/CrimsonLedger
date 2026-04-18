import { newId } from '@/lib/id';
import type { Profile } from './types';

/** Factory for a sensible starting profile. */
export function createDefaultProfile(partial: Partial<Profile> = {}): Profile {
  const now = Date.now();
  return {
    id: partial.id ?? newId(),
    name: partial.name ?? 'Unnamed',
    chronicle: partial.chronicle,
    thirst: partial.thirst ?? 1,
    morality: partial.morality ?? 7,
    marks: partial.marks ?? 0,
    health: partial.health ?? { max: 7, superficial: 0, aggravated: 0 },
    willpower: partial.willpower ?? { max: 5, superficial: 0, aggravated: 0 },
    conditions: partial.conditions ?? [],
    customTrackers: partial.customTrackers ?? [],
    shortNotes: partial.shortNotes ?? '',
    archived: partial.archived ?? false,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}

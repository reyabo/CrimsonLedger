'use client';

import { create } from 'zustand';
import { createDefaultProfile } from '@/domain/defaults';
import { newId } from '@/lib/id';
import {
  adjustDamage,
  clampTrack,
  clearDamage,
  cycleAt,
  clamp,
  BOUNDS,
} from '@/domain/rules';
import type {
  Condition,
  CustomTracker,
  CustomTrackerDisplay,
  DamageTrack,
  ID,
  LedgerState,
  Profile,
  Snapshot,
} from '@/domain/types';
import { loadState, saveState, rememberLastOpened } from './persistence';

const UNDO_TTL_MS = 15_000;
const MAX_RECENT_CONDITIONS = 20;

type ProfilePatch = (p: Profile) => Profile;

export type LedgerActions = {
  /** Hydrate from IndexedDB once on client start. */
  hydrate: () => Promise<void>;

  // Profile lifecycle
  createProfile: (init?: Partial<Profile>) => ID;
  renameProfile: (id: ID, name: string, chronicle?: string) => void;
  duplicateProfile: (id: ID) => ID | null;
  archiveProfile: (id: ID, archived: boolean) => void;
  deleteProfile: (id: ID) => void;
  setActive: (id: ID | null) => void;

  // Tracker mutations
  setThirst: (id: ID, value: number) => void;
  adjustThirst: (id: ID, delta: number) => void;
  setHumanity: (id: ID, morality: number, marks: number) => void;
  adjustHumanity: (id: ID, delta: number) => void;
  adjustStains: (id: ID, delta: number) => void;

  setTrackMax: (id: ID, kind: 'health' | 'willpower', max: number) => void;
  cycleTrackPip: (id: ID, kind: 'health' | 'willpower', index: number) => void;
  adjustTrack: (
    id: ID,
    kind: 'health' | 'willpower',
    dmg: 'superficial' | 'aggravated',
    delta: number,
  ) => void;
  clearTrack: (id: ID, kind: 'health' | 'willpower') => void;

  // Conditions
  addCondition: (id: ID, label: string, note?: string) => void;
  removeCondition: (id: ID, conditionId: ID) => void;

  // Custom trackers
  addCustomTracker: (id: ID, tracker: Omit<CustomTracker, 'id'>) => void;
  updateCustomTracker: (id: ID, tracker: CustomTracker) => void;
  removeCustomTracker: (id: ID, trackerId: ID) => void;
  adjustCustomTracker: (id: ID, trackerId: ID, delta: number) => void;
  toggleChecklistItem: (id: ID, trackerId: ID, itemIndex: number) => void;

  // Notes
  setShortNotes: (id: ID, notes: string) => void;

  // Undo
  undo: () => void;
  clearSnapshot: () => void;

  // Import / export
  importReplace: (profiles: Profile[]) => void;
  importMerge: (profiles: Profile[]) => void;
};

export type LedgerStore = LedgerState & LedgerActions;

const initialState: LedgerState = {
  profiles: {},
  order: [],
  recentConditionLabels: [],
  activeId: null,
  lastSnapshot: null,
  _hydrated: false,
};

/**
 * Update a single profile immutably, taking a snapshot beforehand so the
 * last mutation can be undone.
 */
function applyProfile(
  state: LedgerStore,
  id: ID,
  label: string,
  patch: ProfilePatch,
): Partial<LedgerStore> {
  const prev = state.profiles[id];
  if (!prev) return {};
  const next = patch(prev);
  if (next === prev) return {};
  const snapshot: Snapshot = {
    profileId: id,
    profile: prev,
    at: Date.now(),
    label,
  };
  return {
    profiles: { ...state.profiles, [id]: { ...next, updatedAt: Date.now() } },
    lastSnapshot: snapshot,
  };
}

let unhydratedPromise: Promise<void> | null = null;

function persist(get: () => LedgerStore) {
  const s = get();
  void saveState({
    profiles: s.profiles,
    order: s.order,
    recentConditionLabels: s.recentConditionLabels,
    activeId: s.activeId,
  });
}

function pushRecent(list: string[], label: string): string[] {
  const trimmed = label.trim();
  if (!trimmed) return list;
  const deduped = [trimmed, ...list.filter((l) => l.toLowerCase() !== trimmed.toLowerCase())];
  return deduped.slice(0, MAX_RECENT_CONDITIONS);
}

export const useLedgerStore = create<LedgerStore>((set, get) => ({
  ...initialState,

  hydrate: async () => {
    if (get()._hydrated) return;
    if (unhydratedPromise) return unhydratedPromise;
    unhydratedPromise = (async () => {
      const loaded = await loadState();
      set(() => ({
        profiles: loaded?.profiles ?? {},
        order: loaded?.order ?? [],
        recentConditionLabels: loaded?.recentConditionLabels ?? [],
        activeId: loaded?.activeId ?? null,
        _hydrated: true,
      }));
    })();
    return unhydratedPromise;
  },

  createProfile: (init) => {
    const profile = createDefaultProfile(init);
    set((s) => ({
      profiles: { ...s.profiles, [profile.id]: profile },
      order: [...s.order, profile.id],
      lastSnapshot: null, // creation is not undoable in v1
    }));
    persist(get);
    return profile.id;
  },

  renameProfile: (id, name, chronicle) => {
    set((s) => applyProfile(s, id, 'Edit profile', (p) => ({ ...p, name, chronicle })));
    persist(get);
  },

  duplicateProfile: (id) => {
    const src = get().profiles[id];
    if (!src) return null;
    const copy: Profile = {
      ...src,
      id: newId(),
      name: `${src.name} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archived: false,
    };
    set((s) => ({
      profiles: { ...s.profiles, [copy.id]: copy },
      order: [...s.order, copy.id],
      lastSnapshot: null,
    }));
    persist(get);
    return copy.id;
  },

  archiveProfile: (id, archived) => {
    set((s) => applyProfile(s, id, archived ? 'Archive' : 'Unarchive', (p) => ({ ...p, archived })));
    persist(get);
  },

  deleteProfile: (id) => {
    const snapshot: Snapshot = {
      profileId: id,
      profile: get().profiles[id] ?? null,
      at: Date.now(),
      label: 'Delete profile',
    };
    set((s) => {
      if (!s.profiles[id]) return {};
      const { [id]: _removed, ...rest } = s.profiles;
      return {
        profiles: rest,
        order: s.order.filter((x) => x !== id),
        activeId: s.activeId === id ? null : s.activeId,
        lastSnapshot: snapshot,
      };
    });
    persist(get);
  },

  setActive: (id) => {
    set(() => ({ activeId: id, lastSnapshot: null }));
    rememberLastOpened(id);
    persist(get);
  },

  setThirst: (id, value) =>
    set((s) =>
      applyProfile(s, id, 'Edit Hunger', (p) => ({
        ...p,
        thirst: clamp(value, 0, BOUNDS.hungerMax),
      })),
    ) ?? persist(get),
  adjustThirst: (id, delta) => {
    set((s) =>
      applyProfile(s, id, 'Edit Hunger', (p) => ({
        ...p,
        thirst: clamp(p.thirst + delta, 0, BOUNDS.hungerMax),
      })),
    );
    persist(get);
  },

  setHumanity: (id, morality, marks) => {
    set((s) =>
      applyProfile(s, id, 'Edit Humanity', (p) => ({
        ...p,
        morality: clamp(morality, 0, BOUNDS.humanityMax),
        marks: clamp(marks, 0, BOUNDS.stainsMax),
      })),
    );
    persist(get);
  },
  adjustHumanity: (id, delta) => {
    set((s) =>
      applyProfile(s, id, 'Edit Humanity', (p) => ({
        ...p,
        morality: clamp(p.morality + delta, 0, BOUNDS.humanityMax),
      })),
    );
    persist(get);
  },
  adjustStains: (id, delta) => {
    set((s) =>
      applyProfile(s, id, 'Edit Stains', (p) => ({
        ...p,
        marks: clamp(p.marks + delta, 0, BOUNDS.stainsMax),
      })),
    );
    persist(get);
  },

  setTrackMax: (id, kind, max) => {
    set((s) =>
      applyProfile(s, id, `Edit ${kind} max`, (p) => {
        const next: DamageTrack = clampTrack({ ...p[kind], max });
        return { ...p, [kind]: next };
      }),
    );
    persist(get);
  },
  cycleTrackPip: (id, kind, index) => {
    set((s) =>
      applyProfile(s, id, `Edit ${kind}`, (p) => ({
        ...p,
        [kind]: cycleAt(p[kind], index),
      })),
    );
    persist(get);
  },
  adjustTrack: (id, kind, dmg, delta) => {
    set((s) =>
      applyProfile(s, id, `Edit ${kind}`, (p) => ({
        ...p,
        [kind]: adjustDamage(p[kind], dmg, delta),
      })),
    );
    persist(get);
  },
  clearTrack: (id, kind) => {
    set((s) =>
      applyProfile(s, id, `Clear ${kind}`, (p) => ({
        ...p,
        [kind]: clearDamage(p[kind]),
      })),
    );
    persist(get);
  },

  addCondition: (id, label, note) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const condition: Condition = { id: newId(), label: trimmed, note };
    set((s) => {
      const partial = applyProfile(s, id, 'Add condition', (p) => ({
        ...p,
        conditions: [...p.conditions, condition],
      }));
      return {
        ...partial,
        recentConditionLabels: pushRecent(s.recentConditionLabels, trimmed),
      };
    });
    persist(get);
  },
  removeCondition: (id, conditionId) => {
    set((s) =>
      applyProfile(s, id, 'Remove condition', (p) => ({
        ...p,
        conditions: p.conditions.filter((c) => c.id !== conditionId),
      })),
    );
    persist(get);
  },

  addCustomTracker: (id, tracker) => {
    const t: CustomTracker = { ...tracker, id: newId() };
    set((s) =>
      applyProfile(s, id, 'Add tracker', (p) => ({
        ...p,
        customTrackers: [...p.customTrackers, t],
      })),
    );
    persist(get);
  },
  updateCustomTracker: (id, tracker) => {
    set((s) =>
      applyProfile(s, id, 'Edit tracker', (p) => ({
        ...p,
        customTrackers: p.customTrackers.map((t) => (t.id === tracker.id ? tracker : t)),
      })),
    );
    persist(get);
  },
  removeCustomTracker: (id, trackerId) => {
    set((s) =>
      applyProfile(s, id, 'Remove tracker', (p) => ({
        ...p,
        customTrackers: p.customTrackers.filter((t) => t.id !== trackerId),
      })),
    );
    persist(get);
  },
  adjustCustomTracker: (id, trackerId, delta) => {
    set((s) =>
      applyProfile(s, id, 'Edit tracker', (p) => ({
        ...p,
        customTrackers: p.customTrackers.map((t) => {
          if (t.id !== trackerId) return t;
          const upper = t.maxValue ?? 999;
          return { ...t, currentValue: clamp(t.currentValue + delta, 0, upper) };
        }),
      })),
    );
    persist(get);
  },
  toggleChecklistItem: (id, trackerId, itemIndex) => {
    set((s) =>
      applyProfile(s, id, 'Edit tracker', (p) => ({
        ...p,
        customTrackers: p.customTrackers.map((t) => {
          if (t.id !== trackerId) return t;
          const max = t.maxValue ?? 0;
          if (itemIndex < 0 || itemIndex >= max) return t;
          // currentValue stores number of checked items; we use a bitmask-free
          // convention: the first N items (by index) are "checked". Toggling at
          // index i sets currentValue to i+1 if it was unchecked, else i.
          const isChecked = itemIndex < t.currentValue;
          const next = isChecked ? itemIndex : itemIndex + 1;
          return { ...t, currentValue: clamp(next, 0, max) };
        }),
      })),
    );
    persist(get);
  },

  setShortNotes: (id, notes) => {
    set((s) =>
      applyProfile(s, id, 'Edit notes', (p) => ({ ...p, shortNotes: notes.slice(0, 4000) })),
    );
    persist(get);
  },

  undo: () => {
    const snap = get().lastSnapshot;
    if (!snap) return;
    const age = Date.now() - snap.at;
    if (age > UNDO_TTL_MS) {
      set(() => ({ lastSnapshot: null }));
      return;
    }
    set((s) => {
      if (snap.profile === null && snap.profileId) {
        // undo of delete: re-insert
        const order = s.order.includes(snap.profileId) ? s.order : [...s.order, snap.profileId];
        return {
          profiles: { ...s.profiles /* nothing to restore */ },
          order,
          lastSnapshot: null,
        };
      }
      if (!snap.profileId || !snap.profile) return { lastSnapshot: null };
      const order = s.order.includes(snap.profileId) ? s.order : [...s.order, snap.profileId];
      return {
        profiles: { ...s.profiles, [snap.profileId]: snap.profile },
        order,
        lastSnapshot: null,
      };
    });
    persist(get);
  },
  clearSnapshot: () => set(() => ({ lastSnapshot: null })),

  importReplace: (profiles) => {
    const map: Record<ID, Profile> = {};
    const order: ID[] = [];
    for (const p of profiles) {
      map[p.id] = p;
      order.push(p.id);
    }
    set(() => ({
      profiles: map,
      order,
      activeId: null,
      lastSnapshot: null,
    }));
    persist(get);
  },

  importMerge: (profiles) => {
    set((s) => {
      const map = { ...s.profiles };
      const order = [...s.order];
      for (const p of profiles) {
        const id = newId();
        map[id] = { ...p, id, createdAt: Date.now(), updatedAt: Date.now() };
        order.push(id);
      }
      return { profiles: map, order, lastSnapshot: null };
    });
    persist(get);
  },
}));

/** Test-only reset helper. Do not call from app code. */
export function __resetStoreForTests(): void {
  useLedgerStore.setState({ ...initialState, _hydrated: true });
}

export const UNDO_TTL_MS_EXPORT = UNDO_TTL_MS;

// Utility selectors -----------------------------------------------------------

export const selectProfiles = (s: LedgerStore): Profile[] =>
  s.order.map((id) => s.profiles[id]).filter(Boolean) as Profile[];

export const selectActiveProfiles = (s: LedgerStore): Profile[] =>
  selectProfiles(s).filter((p) => !p.archived);

export const selectArchivedProfiles = (s: LedgerStore): Profile[] =>
  selectProfiles(s).filter((p) => p.archived);

export const selectProfile =
  (id: ID | null | undefined) =>
  (s: LedgerStore): Profile | undefined =>
    id ? s.profiles[id] : undefined;

// Type re-exports for callers that want display types, etc.
export type { CustomTrackerDisplay };

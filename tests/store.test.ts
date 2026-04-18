import { afterEach, describe, expect, it } from 'vitest';
import { __resetStoreForTests, useLedgerStore } from '@/store/ledgerStore';

function createOne(name = 'Rook') {
  return useLedgerStore.getState().createProfile({ name });
}

describe('ledger store', () => {
  afterEach(() => {
    __resetStoreForTests();
  });

  it('creates and lists profiles in order', () => {
    const a = createOne('A');
    const b = createOne('B');
    const s = useLedgerStore.getState();
    expect(s.order).toEqual([a, b]);
    expect(s.profiles[a]!.name).toBe('A');
    expect(s.profiles[b]!.name).toBe('B');
  });

  it('duplicate creates a new id and appends', () => {
    const a = createOne('A');
    const copyId = useLedgerStore.getState().duplicateProfile(a);
    expect(copyId).toBeTruthy();
    expect(copyId).not.toBe(a);
    expect(useLedgerStore.getState().order).toContain(copyId);
    expect(useLedgerStore.getState().profiles[copyId!]!.name).toBe('A (copy)');
  });

  it('archive/unarchive toggles flag and is undoable', () => {
    const a = createOne();
    useLedgerStore.getState().archiveProfile(a, true);
    expect(useLedgerStore.getState().profiles[a]!.archived).toBe(true);
    useLedgerStore.getState().undo();
    expect(useLedgerStore.getState().profiles[a]!.archived).toBe(false);
  });

  it('delete is undoable within TTL', () => {
    const a = createOne('A');
    useLedgerStore.getState().deleteProfile(a);
    expect(useLedgerStore.getState().profiles[a]).toBeUndefined();
    useLedgerStore.getState().undo();
    expect(useLedgerStore.getState().profiles[a]).toBeDefined();
  });

  it('hunger clamps between 0 and 5', () => {
    const a = createOne();
    const s = useLedgerStore.getState();
    for (let i = 0; i < 10; i++) s.adjustThirst(a, +1);
    expect(useLedgerStore.getState().profiles[a]!.thirst).toBe(5);
    for (let i = 0; i < 10; i++) useLedgerStore.getState().adjustThirst(a, -1);
    expect(useLedgerStore.getState().profiles[a]!.thirst).toBe(0);
  });

  it('cycleTrackPip fills superficial then promotes to aggravated', () => {
    const a = createOne();
    const s = useLedgerStore.getState();
    s.cycleTrackPip(a, 'health', 0);
    expect(useLedgerStore.getState().profiles[a]!.health.superficial).toBe(1);
    useLedgerStore.getState().cycleTrackPip(a, 'health', 0);
    expect(useLedgerStore.getState().profiles[a]!.health.aggravated).toBe(1);
  });

  it('addCondition populates recent list and can be undone', () => {
    const a = createOne();
    useLedgerStore.getState().addCondition(a, 'Bleeding');
    expect(useLedgerStore.getState().recentConditionLabels[0]).toBe('Bleeding');
    expect(useLedgerStore.getState().profiles[a]!.conditions).toHaveLength(1);
    useLedgerStore.getState().undo();
    expect(useLedgerStore.getState().profiles[a]!.conditions).toHaveLength(0);
  });

  it('custom tracker add/adjust/remove', () => {
    const a = createOne();
    const s = useLedgerStore.getState();
    s.addCustomTracker(a, {
      label: 'Boons',
      currentValue: 0,
      displayType: 'counter',
    });
    const t = useLedgerStore.getState().profiles[a]!.customTrackers[0]!;
    useLedgerStore.getState().adjustCustomTracker(a, t.id, +3);
    expect(useLedgerStore.getState().profiles[a]!.customTrackers[0]!.currentValue).toBe(3);
    useLedgerStore.getState().removeCustomTracker(a, t.id);
    expect(useLedgerStore.getState().profiles[a]!.customTrackers).toHaveLength(0);
  });

  it('import replace / merge', () => {
    const a = createOne('A');
    const srcProfile = { ...useLedgerStore.getState().profiles[a]! };
    __resetStoreForTests();
    useLedgerStore.getState().importReplace([srcProfile]);
    expect(Object.keys(useLedgerStore.getState().profiles)).toHaveLength(1);
    useLedgerStore.getState().importMerge([srcProfile]);
    expect(Object.keys(useLedgerStore.getState().profiles)).toHaveLength(2);
  });
});

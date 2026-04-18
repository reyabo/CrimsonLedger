import { describe, expect, it } from 'vitest';
import {
  BOUNDS,
  adjustDamage,
  atDegenerationRisk,
  clamp,
  clampTrack,
  clearDamage,
  cycleAt,
  hungerSeverity,
  humanitySeverity,
  isImpaired,
  isTorpor,
  pipStatesFor,
  totalDamage,
} from '@/domain/rules';
import type { DamageTrack } from '@/domain/types';

const track = (max: number, s = 0, a = 0): DamageTrack => ({ max, superficial: s, aggravated: a });

describe('clamp', () => {
  it('returns min for NaN', () => {
    expect(clamp(Number.NaN, 1, 5)).toBe(1);
  });
  it('truncates fractions', () => {
    expect(clamp(3.9, 0, 10)).toBe(3);
  });
  it('enforces bounds', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(20, 0, 10)).toBe(10);
  });
});

describe('clampTrack', () => {
  it('caps max and redistributes overflow', () => {
    const t = clampTrack({ max: 99, superficial: 50, aggravated: 50 });
    expect(t.max).toBe(BOUNDS.damageMaxMax);
    expect(t.aggravated + t.superficial).toBeLessThanOrEqual(t.max);
  });
  it('keeps aggravated ahead of superficial when overfilled', () => {
    const t = clampTrack({ max: 5, superficial: 10, aggravated: 5 });
    expect(t.aggravated).toBe(5);
    expect(t.superficial).toBe(0);
  });
});

describe('pip states', () => {
  it('fills aggravated first, then superficial', () => {
    expect(pipStatesFor(track(5, 2, 2))).toEqual([
      'aggravated',
      'aggravated',
      'superficial',
      'superficial',
      'empty',
    ]);
  });
});

describe('cycleAt', () => {
  it('empty -> superficial', () => {
    const t = cycleAt(track(5), 0);
    expect(t.superficial).toBe(1);
    expect(t.aggravated).toBe(0);
  });
  it('superficial -> aggravated (promotes one box)', () => {
    // index 0 is superficial; tapping promotes to aggravated
    const t = cycleAt(track(5, 2, 0), 0);
    expect(t.superficial).toBe(1);
    expect(t.aggravated).toBe(1);
  });
  it('tapping an empty pip adds a superficial', () => {
    const t = cycleAt(track(5, 2, 0), 2);
    expect(t.superficial).toBe(3);
    expect(t.aggravated).toBe(0);
  });
  it('aggravated -> empty (removes one aggravated)', () => {
    const t = cycleAt(track(5, 1, 2), 0);
    expect(t.aggravated).toBe(1);
    expect(t.superficial).toBe(1);
  });
  it('no-op when empty and full', () => {
    const full = track(3, 0, 3);
    const res = cycleAt(full, 0);
    // aggravated becomes 2
    expect(res.aggravated).toBe(2);
  });
});

describe('severity and flags', () => {
  it('hunger tiers', () => {
    expect(hungerSeverity(0)).toBe('normal');
    expect(hungerSeverity(4)).toBe('high');
    expect(hungerSeverity(5)).toBe('critical');
  });
  it('humanity tiers', () => {
    expect(humanitySeverity(7)).toBe('normal');
    expect(humanitySeverity(3)).toBe('low');
    expect(humanitySeverity(2)).toBe('critical');
  });
  it('impaired when full', () => {
    expect(isImpaired(track(5, 3, 2))).toBe(true);
    expect(isImpaired(track(5, 3, 1))).toBe(false);
  });
  it('torpor when all aggravated', () => {
    expect(isTorpor(track(5, 0, 5))).toBe(true);
    expect(isTorpor(track(5, 4, 1))).toBe(false);
  });
  it('degeneration risk', () => {
    expect(atDegenerationRisk(7, 4)).toBe(true);
    expect(atDegenerationRisk(7, 3)).toBe(false);
  });
});

describe('adjust/clear', () => {
  it('clears all damage', () => {
    expect(clearDamage(track(5, 3, 2))).toEqual({ max: 5, superficial: 0, aggravated: 0 });
  });
  it('adjusts superficial and respects cap', () => {
    const t = adjustDamage(track(3, 2, 0), 'superficial', 5);
    expect(totalDamage(t)).toBe(3);
  });
});

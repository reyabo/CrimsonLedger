import type { DamageTrack, PipState } from './types';

export const BOUNDS = {
  hungerMax: 5,
  humanityMax: 10,
  stainsMax: 10,
  damageMinMax: 1,
  damageMaxMax: 20,
} as const;

export function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export function clampTrack(track: DamageTrack): DamageTrack {
  const max = clamp(track.max, BOUNDS.damageMinMax, BOUNDS.damageMaxMax);
  const aggravated = clamp(track.aggravated, 0, max);
  const superficial = clamp(track.superficial, 0, max - aggravated);
  return { max, superficial, aggravated };
}

/** Total filled boxes (superficial + aggravated). */
export function totalDamage(track: DamageTrack): number {
  return track.superficial + track.aggravated;
}

/** A damage track is "impaired" when all boxes are filled. */
export function isImpaired(track: DamageTrack): boolean {
  return totalDamage(track) >= track.max;
}

/** A health track is at "torpor"/incapacitated when every box is aggravated. */
export function isTorpor(track: DamageTrack): boolean {
  return track.aggravated >= track.max && track.max > 0;
}

/** Hunger severity tier, for styling. */
export function hungerSeverity(hunger: number): 'normal' | 'high' | 'critical' {
  if (hunger >= BOUNDS.hungerMax) return 'critical';
  if (hunger >= 4) return 'high';
  return 'normal';
}

/** Humanity severity tier, for styling. */
export function humanitySeverity(humanity: number): 'normal' | 'low' | 'critical' {
  if (humanity <= 2) return 'critical';
  if (humanity <= 4) return 'low';
  return 'normal';
}

/** Stains + Humanity > 10 signals degeneration risk. */
export function atDegenerationRisk(humanity: number, stains: number): boolean {
  return humanity + stains > BOUNDS.humanityMax;
}

/**
 * Compute pip states for a damage track, rendered left-to-right.
 * Convention: aggravated fill from the left end of the "damaged" region,
 * superficial follow, then empty boxes. This matches V5 sheets.
 */
export function pipStatesFor(track: DamageTrack): PipState[] {
  const { max, superficial, aggravated } = clampTrack(track);
  const states: PipState[] = [];
  for (let i = 0; i < max; i++) {
    if (i < aggravated) states.push('aggravated');
    else if (i < aggravated + superficial) states.push('superficial');
    else states.push('empty');
  }
  return states;
}

/**
 * Apply a tap at index `i` using the cycle: empty → superficial → aggravated → empty.
 * We convert the tap into a +/- adjustment of the superficial/aggravated counts so
 * the resulting track remains a valid (aggregated, left-aligned) track.
 */
export function cycleAt(track: DamageTrack, index: number): DamageTrack {
  const states = pipStatesFor(track);
  const current = states[index];
  if (current === undefined) return track;

  let { superficial, aggravated } = track;
  if (current === 'empty') {
    // add one superficial
    if (superficial + aggravated < track.max) superficial += 1;
  } else if (current === 'superficial') {
    // convert one superficial into aggravated
    if (superficial > 0) {
      superficial -= 1;
      aggravated += 1;
    }
  } else {
    // aggravated → empty (remove that aggravated box)
    if (aggravated > 0) aggravated -= 1;
  }
  return clampTrack({ max: track.max, superficial, aggravated });
}

export function adjustDamage(
  track: DamageTrack,
  kind: 'superficial' | 'aggravated',
  delta: number,
): DamageTrack {
  const next = { ...track };
  if (kind === 'superficial') next.superficial += delta;
  else next.aggravated += delta;
  return clampTrack(next);
}

export function clearDamage(track: DamageTrack): DamageTrack {
  return { ...track, superficial: 0, aggravated: 0 };
}

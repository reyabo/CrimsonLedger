import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type { LedgerState } from '@/domain/types';

const STORE_KEY = 'crimson-ledger:v1';
const LS_LAST_OPENED = 'crimson-ledger:last-opened';

type Persisted = Pick<LedgerState, 'profiles' | 'order' | 'recentConditionLabels' | 'activeId'>;

export async function loadState(): Promise<Persisted | null> {
  try {
    const raw = (await idbGet(STORE_KEY)) as Persisted | undefined;
    return raw ?? null;
  } catch {
    return null;
  }
}

export async function saveState(state: Persisted): Promise<void> {
  try {
    await idbSet(STORE_KEY, state);
  } catch {
    // Swallow: storage may be full or blocked; UI continues in-memory.
  }
}

export async function clearState(): Promise<void> {
  try {
    await idbDel(STORE_KEY);
  } catch {
    // no-op
  }
}

export function rememberLastOpened(id: string | null): void {
  try {
    if (typeof window === 'undefined') return;
    if (id) window.localStorage.setItem(LS_LAST_OPENED, id);
    else window.localStorage.removeItem(LS_LAST_OPENED);
  } catch {
    // ignore private mode / storage denied
  }
}

export function readLastOpened(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(LS_LAST_OPENED);
  } catch {
    return null;
  }
}

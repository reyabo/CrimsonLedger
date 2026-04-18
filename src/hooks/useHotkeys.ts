'use client';

import { useEffect } from 'react';

type Handler = (e: KeyboardEvent) => void;

/**
 * Lightweight keyboard binding. Ignores keypresses inside editable elements so
 * typing in inputs doesn't trigger shortcuts.
 */
export function useHotkeys(handler: Handler, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      }
      handler(e);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handler, enabled]);
}

/** Fires a tiny vibration if the device supports it. */
export function haptic(ms = 8): void {
  if (typeof navigator === 'undefined') return;
  try {
    navigator.vibrate?.(ms);
  } catch {
    // ignore
  }
}

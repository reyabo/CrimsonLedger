# Crimson Ledger

A lightweight tracker for **Vampire: The Masquerade**-style sessions, focused on rapidly changing character stats like Hunger, Humanity, Health, Willpower, Stains, and other temporary in-game values. Crimson Ledger is deliberately **not** a full character sheet — it exists for the numbers that move at the table.

- Dark, gothic, mobile-first UI
- Offline-first, installable as a PWA
- Local storage only (your data never leaves your device in v1)
- TypeScript, React, Next.js, Tailwind, zustand
- GPL-3.0 licensed

No copyrighted art, logos, or branded assets are used. Game terms appear as labels only; the underlying engine uses neutral names so it can be adapted to other systems.

## Features (v1)

- **Multiple profiles** — create, edit, duplicate, archive, delete
- **Pip tracks** — V5-style tap-to-cycle for Health and Willpower (empty → superficial → aggravated → empty) with a `+/-` alt panel
- **Hunger**, **Humanity** (with **Stains** overlaid on the same 10-dot track)
- **Conditions** as chips, with autocomplete from recent labels
- **Custom trackers** — counter, pips, or checklist; for blood surges, stored vitae, boons, house-rule anything
- **Session notes** — short scratchpad, not a journal
- **Single-step undo** for the last change (15 s window)
- **JSON import / export** — per profile or the whole ledger
- **Critical-state warnings** — Impaired, Torpor, Degeneration risk
- **Offline PWA** — installable, works with no network at the table
- **Keyboard shortcuts** on desktop (`h`/`Shift+H` for Hunger, `Ctrl/Cmd+Z` for Undo)

## Quickstart

Requires Node 18+ and npm.

```bash
npm install
npm run dev         # http://localhost:3000
npm run typecheck
npm test
npm run build       # static export to ./out
```

## Project layout

```
src/
  app/            # Next.js App Router entry points (dashboard, profile)
  components/     # UI primitives + feature components
  domain/         # Types, rules, labels, zod schemas
  hooks/          # useHydrate, useUndo, useHotkeys
  lib/            # Small utilities: id, cn, io (import/export)
  store/          # zustand store, IndexedDB persistence, selectors
tests/            # Vitest unit tests
public/           # manifest, icons, service worker
```

## Architecture at a glance

- **State** — single `useLedgerStore` zustand store. Every mutation snapshots the profile it touched so the last action can be undone. Snapshots expire after 15 s.
- **Persistence** — IndexedDB via `idb-keyval`; hydrated once on client mount. A tiny `localStorage` key remembers the last-opened profile.
- **Rendering** — fully client-side (`output: 'export'`), no server. The profile page reads the active id from `?id=...` so it works with a static export.
- **PWA** — `manifest.webmanifest` + a minimal cache-first service worker registered only in production builds.
- **Engine/UI separation** — internal fields are generic (`thirst`, `morality`, `marks`); the UI layer translates them through `src/domain/labels.ts`. Swap in a different label map to rebrand for another system.

## Data model (generic engine, V5 labels)

```ts
type Profile = {
  id: string;
  name: string;
  chronicle?: string;
  thirst: number;     // Hunger, 0–5
  morality: number;   // Humanity, 0–10
  marks: number;      // Stains, 0–10
  health: { max: number; superficial: number; aggravated: number };
  willpower: { max: number; superficial: number; aggravated: number };
  conditions: { id: string; label: string; note?: string }[];
  customTrackers: {
    id: string; label: string; currentValue: number;
    maxValue?: number; displayType: 'counter' | 'pips' | 'checklist';
    items?: string[];
  }[];
  shortNotes: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
};
```

JSON export envelope:

```json
{ "version": 1, "exportedAt": 1710000000000, "profiles": [/* Profile[] */] }
```

Imports are validated with `zod`; malformed files are rejected before touching state.

## Roadmap

- **v1.1** – Multi-step undo/redo with a timeline view
- **v1.2** – Custom presets for CofD, Werewolf, and homebrew label sets
- **v1.3** – Opt-in cloud sync (end-to-end encrypted)
- **v1.4** – Hunger-dice roller module
- **v1.5** – i18n (`fr`, `es`, `pt-BR`, `de`)
- **v1.6** – Storyteller overview + encrypted share links
- **v1.7** – Accessibility audit, reduced-motion polish, haptic patterns

## License

Crimson Ledger is released under the **GNU General Public License v3.0** (see [`LICENSE`](./LICENSE)).

Why GPL-3.0:

- Strong copyleft keeps downstream forks open
- Well understood and compatible with most FOSS ecosystems
- Fan-tool friendly: you can run, fork, and adapt it for your table

No trademarked names, logos, or art from White Wolf / Renegade Game Studios / Paradox Interactive are included. Game terms (Hunger, Humanity, Stains) are used as descriptive labels in the UI; the underlying code refers to neutral concepts (`thirst`, `morality`, `marks`) so the app can be relabeled.

## Contributing

Issues and pull requests are welcome. Please:

1. Open an issue describing the change before large work.
2. Keep PRs focused and run `npm run typecheck && npm test` before submitting.
3. Match the existing code style — no new tools or dependencies without discussion.

## Disclaimer

This is a fan-made, unofficial tool. It is not affiliated with, endorsed by, or sponsored by the publishers of Vampire: The Masquerade.

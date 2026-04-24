# Crimson Ledger

A lightweight **native Android** tracker for **Vampire: The Masquerade**–style sessions, focused on the values that move at the table: Hunger, Humanity, Stains, Health, Willpower, conditions, and user-defined trackers. Crimson Ledger is deliberately **not** a full character sheet — it exists for the numbers that change during play.

- Dark, gothic, mobile-first Material 3 UI
- Offline-only, Room-backed local storage
- Kotlin 2.0 + Jetpack Compose
- GPL-3.0 licensed

No copyrighted art, logos, or branded assets are used. V5 game terms appear as UI labels only; the underlying engine uses neutral names (`thirst`, `morality`, `marks`) so it can be relabeled for other systems.

## Features (v1)

- **Multiple profiles** — create, rename, duplicate, archive, delete
- **Pip tracks** — V5-style tap-to-cycle for Health and Willpower (empty → superficial → aggravated → empty) with a `+/-` alt panel
- **Hunger**, **Humanity** (with **Stains** overlaid on the same 10-dot track)
- **Conditions** as chips with autocomplete from recent labels
- **Custom trackers** — counter, pips, or checklist
- **Session notes** — short scratchpad, not a journal
- **Single-step undo** for structural changes (15 s window)
- **JSON import / export** — SAF-based, per profile or whole ledger
- **Critical-state warnings** — Impaired, Torpor, Degeneration risk

## Build & run

All build and setup instructions live in [`android/README.md`](./android/README.md). In short: open the `android/` folder as a Gradle project in Android Studio Ladybug (JDK 17), let it sync, and run the `app` configuration.

CLI:

```bash
cd android
./gradlew :app:assembleDebug
./gradlew :app:installDebug
./gradlew :app:testDebugUnitTest
```

## Layout

```
android/                    # Gradle project root
  app/
    src/main/kotlin/io/crimsonledger/
      domain/               # Model, Rules, Labels, Defaults — pure Kotlin
      data/                 # Room entity, DAO, repository, JSON IO
      ui/                   # ViewModel, navigation, undo, Compose screens + components
    src/test/kotlin/        # JVM unit tests (rules + JSON roundtrip)
    src/main/res/           # themes, colors, adaptive icon, backup rules
  gradle/                   # version catalog + wrapper
.github/workflows/          # Android CI
LICENSE
```

## Web PWA (archived)

This project briefly shipped an offline-first Next.js PWA alongside the native Android build. The web code is preserved on the `web-archive` branch; `main` is Android-only. If you ever need to bring the PWA back, branch from `web-archive` and cherry-pick the relevant commits.

## Roadmap

- **v1.1** – Multi-step undo/redo with a timeline view
- **v1.2** – Custom presets for CofD, Werewolf, and homebrew label sets
- **v1.3** – Hunger-dice roller module
- **v1.4** – i18n (`fr`, `es`, `pt-BR`, `de`)
- **v1.5** – Storyteller overview + encrypted share links
- **v1.6** – Accessibility audit, reduced-motion polish, haptic patterns

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
2. Keep PRs focused and run `./gradlew :app:testDebugUnitTest :app:assembleDebug` before submitting.
3. Match the existing code style — no new tools or dependencies without discussion.

## Disclaimer

This is a fan-made, unofficial tool. It is not affiliated with, endorsed by, or sponsored by the publishers of Vampire: The Masquerade.

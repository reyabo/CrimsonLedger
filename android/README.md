# Crimson Ledger — Android

Native **Kotlin / Jetpack Compose** port of the web app. It lives on a
long-lived `android` branch of the main `CrimsonLedger` repo so the web build
on `main` stays untouched and cross-merges remain conflict-free — all Android
code is self-contained under this folder.

## Feature parity with v1 web

- Multiple profiles (create, rename, duplicate, archive/unarchive, delete)
- Hunger (0–5)
- Humanity (0–10) with Stains overlaid from the right of the same track
- Health / Willpower damage tracks (tap-to-cycle + collapsible +/- panel, configurable max)
- Conditions as chips with recent-label autocomplete
- Custom trackers (counter, pips, checklist)
- Short notes scratchpad, debounced write-back
- Single-step snackbar undo with 15 s TTL
- JSON import/export (Storage Access Framework) with replace / merge modes
- Dark-first Material 3 theme (ink/bone/crimson palette)

## Stack

| Layer | Choice |
|---|---|
| Language | Kotlin 2.0.21 |
| Build | Android Gradle Plugin 8.7.3, Gradle 8.11.1 |
| UI | Jetpack Compose (BOM 2024.12.01), Material 3, Navigation Compose |
| State | AndroidX ViewModel + `StateFlow` |
| Persistence | Room 2.6.1 (single `profiles` table; nested lists as JSON columns) |
| Serialization | kotlinx.serialization 1.7.3 |
| Min / Target SDK | 26 / 35 |

## Build & run

The sandbox that generated this scaffold does **not** have the Android SDK, so
you'll build locally:

1. Install Android Studio Ladybug (AGP 8.7 requires JDK 17).
2. Open the `android/` folder as the Gradle project root.
3. Let it sync — it will resolve the SDK and emulator images.
4. Run the `app` configuration (debug build uses `applicationIdSuffix = .debug`).

From the CLI once the SDK is set up:

```bash
cd android
./gradlew :app:assembleDebug
./gradlew :app:installDebug   # needs a connected device/emulator
./gradlew :app:testDebugUnitTest
```

Unit tests cover rules (`RulesTest`) and the JSON import/export envelope
(`LedgerJsonTest`). They don't require an emulator — they run on the host JVM.

## Layout

```
android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── kotlin/io/crimsonledger/
│       │   ├── CrimsonLedgerApp.kt         # Application; owns the repository
│       │   ├── MainActivity.kt             # Compose host, SAF import/export wiring
│       │   ├── domain/                     # Pure Kotlin — mirrors web /src/domain
│       │   │   ├── Model.kt                # Profile, DamageTrack, Condition, …
│       │   │   ├── Rules.kt                # clamp, cycleAt, adjustDamage, severity
│       │   │   ├── Labels.kt               # V5 UI strings
│       │   │   └── Defaults.kt
│       │   ├── data/                       # Room entity/DAO + repository + JSON IO
│       │   ├── ui/
│       │   │   ├── LedgerViewModel.kt      # single VM with snapshot-based undo
│       │   │   ├── LedgerNav.kt            # nav graph
│       │   │   ├── UndoHost.kt             # snackbar + action wiring
│       │   │   ├── theme/                  # Color + Theme
│       │   │   ├── components/             # Pip, PipRow, HungerTrack, HumanityTrack, …
│       │   │   └── screens/                # DashboardScreen, ProfileScreen
│       │   └── ui/…
│       └── res/                            # themes, colors, adaptive icon, backup rules
├── build.gradle.kts                        # plugin aliases
├── settings.gradle.kts                     # repo + :app module
├── gradle/libs.versions.toml               # version catalog
├── gradle.properties                       # JVM args, AndroidX, config cache
└── gradle/wrapper/                         # gradle-wrapper.jar + .properties
```

## Design notes

- The engine (everything under `domain/`) is pure Kotlin — no Android types.
  It mirrors `src/domain/*` from the web app so rule changes only need to land
  in both places.
- V5 terminology (`Hunger`, `Humanity`, `Stains`) lives in `Labels.kt`. The
  storage layer uses the generic names (`thirst`, `morality`, `marks`) so the
  engine stays reusable if we add other preset systems later.
- The single `profiles` Room table serialises `conditions` and
  `customTrackers` as JSON columns via `LedgerConverters`. We always read a
  profile whole, so normalising those lists would buy nothing and cost us
  transactional rewrites.
- Undo keeps one snapshot of the last mutated profile (or a "was absent"
  marker for creates). The snackbar restores it within 15 s; after that it's
  dropped.
- Import is SAF-based and surfaces a `Replace all` / `Merge` dialog matching
  the web envelope (`{ version: 1, exportedAt, profiles }`).
- Export uses `CreateDocument`/`OpenDocument` so it plays nicely with
  scoped storage; no runtime storage permission is needed.

## Why a branch, not a fork

- One license, one issue tracker, one changelog.
- Shared domain logic reference between web TS and Kotlin — PRs can update
  both sides together.
- The entire Android project is under `android/` so merges from `main` (web
  changes) never touch Android files.

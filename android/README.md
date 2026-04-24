# Crimson Ledger — Android

Native **Kotlin / Jetpack Compose** session tracker. This is the whole
project — `main` is Android-only.

## Feature summary

- Multiple profiles (create, rename, duplicate, archive/unarchive, delete)
- Hunger (0–5)
- Humanity (0–10) with Stains overlaid from the right of the same track
- Health / Willpower damage tracks (tap-to-cycle + collapsible +/- panel, configurable max)
- Conditions as chips with recent-label autocomplete
- Custom trackers (counter, pips, checklist)
- Short notes scratchpad, debounced write-back
- Single-step snackbar undo with 15 s TTL on structural changes
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
│       │   ├── domain/                     # Pure Kotlin rules engine
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
│       └── res/                            # themes, colors, adaptive icon, backup rules
├── build.gradle.kts                        # plugin aliases
├── settings.gradle.kts                     # repo + :app module
├── gradle/libs.versions.toml               # version catalog
├── gradle.properties                       # JVM args, AndroidX, config cache
└── gradle/wrapper/                         # gradle-wrapper.jar + .properties
```

## Design notes

- The engine (everything under `domain/`) is pure Kotlin — no Android
  types. That keeps rules trivially testable on the JVM and reusable if
  you ever wire up a different UI layer.
- V5 terminology (`Hunger`, `Humanity`, `Stains`) lives in `Labels.kt`.
  The storage layer uses the generic names (`thirst`, `morality`,
  `marks`), so the engine stays preset-agnostic.
- The single `profiles` Room table serialises `conditions` and
  `customTrackers` as JSON columns via `LedgerConverters`. We always read
  a profile whole, so normalising those lists would buy nothing and cost
  us transactional rewrites.
- Undo keeps one snapshot of the last mutated profile (or a
  "was absent" marker for creates) only for structural changes —
  create, rename, duplicate, archive/unarchive, delete, condition
  add/remove, custom tracker add/remove, clear damage. Rapid in-play
  changes (pip cycles, hunger/humanity/stain nudges, tracker value
  updates, notes) are intentionally not snackbar-worthy.
- Import is SAF-based and surfaces a `Replace all` / `Merge` dialog.
- Export uses `CreateDocument` so it plays nicely with scoped storage;
  no runtime storage permission is needed.

## CI

`.github/workflows/android.yml` runs `./gradlew :app:testDebugUnitTest
:app:assembleDebug` on pushes to `main` and on PRs, whenever `android/`
or the workflow file itself changes. On failure the workflow distills
Kotlin `e:` lines and the Gradle `FAILURE` block into the step summary
and — for push events — posts them as a PR comment. Successful runs
upload the debug APK as an artifact.

## History

Early commits show the repo briefly hosted an offline-first Next.js PWA
alongside the native build. The web code is preserved on the
`web-archive` branch; `main` is Android-only.

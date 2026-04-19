package io.crimsonledger.domain

/**
 * Pure functions operating on the domain model. No Android / Compose types here.
 */

object Bounds {
    const val HUNGER_MAX = 5
    const val HUMANITY_MAX = 10
    const val TRACK_MIN = 1
    const val TRACK_MAX = 20
}

fun clamp(value: Int, min: Int, max: Int): Int =
    if (value < min) min else if (value > max) max else value

/**
 * Aggravated displaces superficial at the cap. Mirrors the web rule.
 */
fun clampTrack(track: DamageTrack): DamageTrack {
    val max = clamp(track.max, Bounds.TRACK_MIN, Bounds.TRACK_MAX)
    val aggravated = clamp(track.aggravated, 0, max)
    val superficial = clamp(track.superficial, 0, max - aggravated)
    return DamageTrack(max = max, superficial = superficial, aggravated = aggravated)
}

/**
 * Produces a left-to-right pip list. Aggravated first, then superficial, then empty —
 * matches web ordering so the leftmost filled pip is always the "worst".
 */
fun pipStatesFor(track: DamageTrack): List<PipState> {
    val t = clampTrack(track)
    return buildList(t.max) {
        repeat(t.aggravated) { add(PipState.AGGRAVATED) }
        repeat(t.superficial) { add(PipState.SUPERFICIAL) }
        repeat(t.max - t.aggravated - t.superficial) { add(PipState.EMPTY) }
    }
}

/**
 * Tap-to-cycle semantics:
 *  - empty     → superficial (added)
 *  - superficial → aggravated (one sup becomes agg)
 *  - aggravated  → empty (one agg removed)
 * Operates by position in [pipStatesFor].
 */
fun cycleAt(track: DamageTrack, index: Int): DamageTrack {
    val states = pipStatesFor(track)
    if (index !in states.indices) return track
    val state = states[index]
    val next = when (state) {
        PipState.EMPTY -> track.copy(superficial = track.superficial + 1)
        PipState.SUPERFICIAL -> track.copy(
            superficial = track.superficial - 1,
            aggravated = track.aggravated + 1,
        )
        PipState.AGGRAVATED -> track.copy(aggravated = track.aggravated - 1)
    }
    return clampTrack(next)
}

enum class DamageKind { SUPERFICIAL, AGGRAVATED }

fun adjustDamage(track: DamageTrack, kind: DamageKind, delta: Int): DamageTrack {
    val next = when (kind) {
        DamageKind.SUPERFICIAL -> track.copy(superficial = track.superficial + delta)
        DamageKind.AGGRAVATED -> track.copy(aggravated = track.aggravated + delta)
    }
    return clampTrack(next)
}

fun clearDamage(track: DamageTrack): DamageTrack =
    track.copy(superficial = 0, aggravated = 0)

fun isImpaired(track: DamageTrack): Boolean {
    val t = clampTrack(track)
    return t.superficial + t.aggravated >= t.max
}

fun isTorpor(track: DamageTrack): Boolean {
    val t = clampTrack(track)
    return t.aggravated >= t.max
}

fun hungerSeverity(thirst: Int): Severity = when {
    thirst >= Bounds.HUNGER_MAX -> Severity.DANGER
    thirst >= 4 -> Severity.WARN
    else -> Severity.NONE
}

fun humanitySeverity(morality: Int): Severity = when {
    morality <= 2 -> Severity.DANGER
    morality <= 4 -> Severity.WARN
    else -> Severity.NONE
}

fun atDegenerationRisk(morality: Int, marks: Int): Boolean =
    (morality + marks) > Bounds.HUMANITY_MAX

package io.crimsonledger.domain

/**
 * Single source of truth for V5-flavoured UI labels. Keep this the only
 * translation surface between generic engine names and the player-facing
 * language (so swapping presets or adding i18n later is cheap).
 */
object Labels {
    const val HUNGER = "Hunger"
    const val HUMANITY = "Humanity"
    const val STAINS = "Stains"
    const val HEALTH = "Health"
    const val WILLPOWER = "Willpower"
    const val CONDITIONS = "Conditions"
    const val CUSTOM = "Custom trackers"
    const val NOTES = "Short notes"
    const val SUPERFICIAL = "Superficial"
    const val AGGRAVATED = "Aggravated"
    const val IMPAIRED = "Impaired"
    const val TORPOR = "Torpor"
    const val DEGENERATION_RISK = "Degeneration risk"
}

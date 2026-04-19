package io.crimsonledger.domain

import kotlinx.serialization.Serializable

/**
 * Internal field names are generic (thirst/morality/marks) so the engine
 * is reusable for non-V5 presets; UI labels are applied in [Labels].
 */

enum class CustomTrackerDisplay { COUNTER, PIPS, CHECKLIST }

@Serializable
data class DamageTrack(
    val max: Int,
    val superficial: Int,
    val aggravated: Int,
)

@Serializable
data class Condition(
    val id: String,
    val label: String,
    val note: String? = null,
)

@Serializable
data class CustomTracker(
    val id: String,
    val label: String,
    val currentValue: Int,
    val maxValue: Int? = null,
    val displayType: CustomTrackerDisplay,
)

@Serializable
data class Profile(
    val id: String,
    val name: String,
    val chronicle: String? = null,
    val thirst: Int,          // UI: Hunger (0–5)
    val morality: Int,        // UI: Humanity (0–10)
    val marks: Int,           // UI: Stains (0–10)
    val health: DamageTrack,
    val willpower: DamageTrack,
    val conditions: List<Condition>,
    val customTrackers: List<CustomTracker>,
    val shortNotes: String,
    val archived: Boolean,
    val createdAt: Long,
    val updatedAt: Long,
)

@Serializable
data class ExportEnvelope(
    val version: Int = 1,
    val exportedAt: Long,
    val profiles: List<Profile>,
)

enum class PipState { EMPTY, SUPERFICIAL, AGGRAVATED }

enum class Severity { NONE, WARN, DANGER }

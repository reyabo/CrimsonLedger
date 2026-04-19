package io.crimsonledger.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import io.crimsonledger.domain.Condition
import io.crimsonledger.domain.CustomTracker
import io.crimsonledger.domain.DamageTrack
import io.crimsonledger.domain.Profile

/**
 * Single-table model: the whole profile is serialised into JSON columns for
 * conditions and custom trackers — the UI always reads a Profile whole, so
 * normalising wouldn't buy us anything and would cost us transactional rewrites.
 */
@Entity(tableName = "profiles")
@TypeConverters(LedgerConverters::class)
data class ProfileEntity(
    @PrimaryKey val id: String,
    val name: String,
    val chronicle: String?,
    val thirst: Int,
    val morality: Int,
    val marks: Int,
    val healthMax: Int,
    val healthSuperficial: Int,
    val healthAggravated: Int,
    val willpowerMax: Int,
    val willpowerSuperficial: Int,
    val willpowerAggravated: Int,
    val conditionsJson: String,
    val customTrackersJson: String,
    val shortNotes: String,
    val archived: Boolean,
    val createdAt: Long,
    val updatedAt: Long,
    val sortOrder: Int,
)

fun ProfileEntity.toDomain(
    conditions: List<Condition>,
    customTrackers: List<CustomTracker>,
): Profile = Profile(
    id = id,
    name = name,
    chronicle = chronicle,
    thirst = thirst,
    morality = morality,
    marks = marks,
    health = DamageTrack(healthMax, healthSuperficial, healthAggravated),
    willpower = DamageTrack(willpowerMax, willpowerSuperficial, willpowerAggravated),
    conditions = conditions,
    customTrackers = customTrackers,
    shortNotes = shortNotes,
    archived = archived,
    createdAt = createdAt,
    updatedAt = updatedAt,
)

fun Profile.toEntity(conditionsJson: String, customTrackersJson: String, sortOrder: Int): ProfileEntity =
    ProfileEntity(
        id = id,
        name = name,
        chronicle = chronicle,
        thirst = thirst,
        morality = morality,
        marks = marks,
        healthMax = health.max,
        healthSuperficial = health.superficial,
        healthAggravated = health.aggravated,
        willpowerMax = willpower.max,
        willpowerSuperficial = willpower.superficial,
        willpowerAggravated = willpower.aggravated,
        conditionsJson = conditionsJson,
        customTrackersJson = customTrackersJson,
        shortNotes = shortNotes,
        archived = archived,
        createdAt = createdAt,
        updatedAt = updatedAt,
        sortOrder = sortOrder,
    )

package io.crimsonledger.domain

fun createDefaultProfile(
    id: String,
    name: String,
    chronicle: String? = null,
    now: Long = System.currentTimeMillis(),
): Profile = Profile(
    id = id,
    name = name,
    chronicle = chronicle,
    thirst = 1,
    morality = 7,
    marks = 0,
    health = DamageTrack(max = 6, superficial = 0, aggravated = 0),
    willpower = DamageTrack(max = 5, superficial = 0, aggravated = 0),
    conditions = emptyList(),
    customTrackers = emptyList(),
    shortNotes = "",
    archived = false,
    createdAt = now,
    updatedAt = now,
)

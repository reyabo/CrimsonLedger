package io.crimsonledger.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import io.crimsonledger.data.LedgerJson
import io.crimsonledger.data.LedgerRepository
import io.crimsonledger.domain.Condition
import io.crimsonledger.domain.CustomTracker
import io.crimsonledger.domain.CustomTrackerDisplay
import io.crimsonledger.domain.DamageKind
import io.crimsonledger.domain.Profile
import io.crimsonledger.domain.adjustDamage
import io.crimsonledger.domain.clamp
import io.crimsonledger.domain.clampTrack
import io.crimsonledger.domain.clearDamage
import io.crimsonledger.domain.createDefaultProfile
import io.crimsonledger.domain.cycleAt
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * A tiny snapshot lets us restore the last mutated profile on undo.
 * TTL keeps the snackbar honest — after [UNDO_TTL_MS] the snapshot is dropped.
 */
data class UndoSnapshot(
    val profile: Profile,
    val wasPresent: Boolean,
    val takenAt: Long,
) {
    fun isFresh(nowMs: Long = System.currentTimeMillis()): Boolean =
        nowMs - takenAt < UNDO_TTL_MS
}

private const val UNDO_TTL_MS = 15_000L

class LedgerViewModel(private val repo: LedgerRepository) : ViewModel() {

    val profiles: StateFlow<List<Profile>> = repo.observeProfiles()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    private val _undo = MutableStateFlow<UndoSnapshot?>(null)
    val undo: StateFlow<UndoSnapshot?> = _undo

    private val _recentConditions = MutableStateFlow<List<String>>(emptyList())
    val recentConditions: StateFlow<List<String>> = _recentConditions

    fun profileFlow(id: String) = repo.observeProfile(id)

    // --- Structural changes (snackbar-undoable) ------------------------------

    fun createProfile(name: String, chronicle: String? = null) {
        val profile = createDefaultProfile(
            id = UUID.randomUUID().toString(),
            name = name.trim().ifBlank { "New character" },
            chronicle = chronicle?.trim()?.takeIf { it.isNotEmpty() },
        )
        viewModelScope.launch {
            snapshot(profile, wasPresent = false)
            repo.upsert(profile)
        }
    }

    fun rename(id: String, name: String, chronicle: String?) = mutate(id, snapshot = true) {
        it.copy(name = name.trim().ifBlank { it.name }, chronicle = chronicle?.trim()?.takeIf { c -> c.isNotEmpty() })
    }

    fun setArchived(id: String, archived: Boolean) = mutate(id, snapshot = true) { it.copy(archived = archived) }

    fun duplicate(id: String) {
        viewModelScope.launch {
            val src = repo.findProfile(id) ?: return@launch
            val now = System.currentTimeMillis()
            val copy = src.copy(
                id = UUID.randomUUID().toString(),
                name = "${src.name} (copy)",
                createdAt = now,
                updatedAt = now,
            )
            snapshot(copy, wasPresent = false)
            repo.upsert(copy)
        }
    }

    fun delete(id: String) {
        viewModelScope.launch {
            val existing = repo.findProfile(id) ?: return@launch
            snapshot(existing, wasPresent = true)
            repo.delete(id)
        }
    }

    // --- Fast in-session changes (no snackbar) -------------------------------

    fun setHunger(id: String, thirst: Int) = mutate(id, snapshot = false) {
        it.copy(thirst = clamp(thirst, 0, 5))
    }

    fun setHumanity(id: String, morality: Int) = mutate(id, snapshot = false) {
        it.copy(morality = clamp(morality, 0, 10))
    }

    fun setStains(id: String, marks: Int) = mutate(id, snapshot = false) {
        it.copy(marks = clamp(marks, 0, 10))
    }

    fun setHealthMax(id: String, max: Int) = mutate(id, snapshot = false) { p ->
        p.copy(health = clampTrack(p.health.copy(max = max)))
    }

    fun setWillpowerMax(id: String, max: Int) = mutate(id, snapshot = false) { p ->
        p.copy(willpower = clampTrack(p.willpower.copy(max = max)))
    }

    fun cycleHealth(id: String, index: Int) = mutate(id, snapshot = false) {
        it.copy(health = cycleAt(it.health, index))
    }

    fun cycleWillpower(id: String, index: Int) = mutate(id, snapshot = false) {
        it.copy(willpower = cycleAt(it.willpower, index))
    }

    fun adjustHealth(id: String, kind: DamageKind, delta: Int) = mutate(id, snapshot = false) {
        it.copy(health = adjustDamage(it.health, kind, delta))
    }

    fun adjustWillpower(id: String, kind: DamageKind, delta: Int) = mutate(id, snapshot = false) {
        it.copy(willpower = adjustDamage(it.willpower, kind, delta))
    }

    // "Clear damage" is a destructive sweep — treat as structural.
    fun clearHealth(id: String) = mutate(id, snapshot = true) { it.copy(health = clearDamage(it.health)) }
    fun clearWillpower(id: String) = mutate(id, snapshot = true) { it.copy(willpower = clearDamage(it.willpower)) }

    fun setShortNotes(id: String, notes: String) = mutate(id, snapshot = false) { it.copy(shortNotes = notes) }

    // --- Conditions ---------------------------------------------------------

    fun addCondition(id: String, label: String, note: String? = null) {
        val cleaned = label.trim()
        if (cleaned.isEmpty()) return
        mutate(id, snapshot = true) { p ->
            val condition = Condition(UUID.randomUUID().toString(), cleaned, note?.trim()?.takeIf { it.isNotEmpty() })
            p.copy(conditions = p.conditions + condition)
        }
        val current = _recentConditions.value
        _recentConditions.value = (listOf(cleaned) + current.filterNot { it.equals(cleaned, ignoreCase = true) }).take(12)
    }

    fun removeCondition(profileId: String, conditionId: String) = mutate(profileId, snapshot = true) { p ->
        p.copy(conditions = p.conditions.filterNot { it.id == conditionId })
    }

    // --- Custom trackers ----------------------------------------------------

    /** Value updates during play — no snackbar. */
    fun updateCustomTrackerValue(profileId: String, tracker: CustomTracker) =
        mutate(profileId, snapshot = false) { p ->
            val idx = p.customTrackers.indexOfFirst { it.id == tracker.id }
            if (idx < 0) p
            else p.copy(customTrackers = p.customTrackers.toMutableList().also { it[idx] = tracker })
        }

    fun addCustomTracker(profileId: String, label: String, display: CustomTrackerDisplay, max: Int?) {
        val cleaned = label.trim()
        if (cleaned.isEmpty()) return
        mutate(profileId, snapshot = true) { p ->
            p.copy(customTrackers = p.customTrackers + CustomTracker(
                id = UUID.randomUUID().toString(),
                label = cleaned,
                currentValue = 0,
                maxValue = max,
                displayType = display,
            ))
        }
    }

    fun removeCustomTracker(profileId: String, trackerId: String) = mutate(profileId, snapshot = true) { p ->
        p.copy(customTrackers = p.customTrackers.filterNot { it.id == trackerId })
    }

    // --- Import / Export ----------------------------------------------------

    fun exportAll(): String = LedgerJson.encode(profiles.value)

    fun exportProfile(id: String): String? =
        profiles.value.firstOrNull { it.id == id }?.let { LedgerJson.encode(listOf(it)) }

    fun importJson(raw: String, mode: ImportMode) {
        viewModelScope.launch {
            val envelope = LedgerJson.decode(raw)
            when (mode) {
                ImportMode.REPLACE -> repo.replaceAll(envelope.profiles)
                ImportMode.MERGE -> {
                    val now = System.currentTimeMillis()
                    val reidentified = envelope.profiles.map { it.copy(id = UUID.randomUUID().toString(), updatedAt = now) }
                    repo.merge(reidentified)
                }
            }
            // No snapshot for imports — the previous world is too large to restore cleanly.
            _undo.value = null
        }
    }

    // --- Undo ---------------------------------------------------------------

    fun performUndo() {
        val snap = _undo.value ?: return
        if (!snap.isFresh()) { _undo.value = null; return }
        viewModelScope.launch {
            if (snap.wasPresent) repo.upsert(snap.profile) else repo.delete(snap.profile.id)
            _undo.value = null
        }
    }

    fun dismissUndo() { _undo.value = null }

    // --- Internals ----------------------------------------------------------

    private fun mutate(id: String, snapshot: Boolean, transform: (Profile) -> Profile) {
        viewModelScope.launch {
            val current = repo.findProfile(id) ?: return@launch
            if (snapshot) takeSnapshot(current, wasPresent = true)
            val next = transform(current).copy(updatedAt = System.currentTimeMillis())
            repo.upsert(next)
        }
    }

    private fun snapshot(profile: Profile, wasPresent: Boolean) = takeSnapshot(profile, wasPresent)

    private fun takeSnapshot(profile: Profile, wasPresent: Boolean) {
        _undo.value = UndoSnapshot(profile = profile, wasPresent = wasPresent, takenAt = System.currentTimeMillis())
    }

    class Factory(private val repo: LedgerRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T = LedgerViewModel(repo) as T
    }
}

enum class ImportMode { REPLACE, MERGE }

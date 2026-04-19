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
import io.crimsonledger.domain.DamageTrack
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

    fun updateProfile(updated: Profile, snapshotBefore: Profile? = null) {
        viewModelScope.launch {
            val original = snapshotBefore ?: repo.findProfile(updated.id)
            original?.let { snapshot(it, wasPresent = true) }
            repo.upsert(updated.copy(updatedAt = System.currentTimeMillis()))
        }
    }

    fun rename(id: String, name: String, chronicle: String?) = mutate(id) {
        it.copy(name = name.trim().ifBlank { it.name }, chronicle = chronicle?.trim()?.takeIf { c -> c.isNotEmpty() })
    }

    fun setArchived(id: String, archived: Boolean) = mutate(id) { it.copy(archived = archived) }

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

    fun setHunger(id: String, thirst: Int) = mutate(id) { it.copy(thirst = clamp(thirst, 0, 5)) }

    fun setHumanity(id: String, morality: Int) = mutate(id) { it.copy(morality = clamp(morality, 0, 10)) }

    fun setStains(id: String, marks: Int) = mutate(id) { it.copy(marks = clamp(marks, 0, 10)) }

    fun setHealthMax(id: String, max: Int) = mutate(id) { p ->
        p.copy(health = clampTrack(p.health.copy(max = max)))
    }

    fun setWillpowerMax(id: String, max: Int) = mutate(id) { p ->
        p.copy(willpower = clampTrack(p.willpower.copy(max = max)))
    }

    fun cycleHealth(id: String, index: Int) = mutate(id) { it.copy(health = cycleAt(it.health, index)) }

    fun cycleWillpower(id: String, index: Int) = mutate(id) { it.copy(willpower = cycleAt(it.willpower, index)) }

    fun adjustHealth(id: String, kind: DamageKind, delta: Int) = mutate(id) {
        it.copy(health = adjustDamage(it.health, kind, delta))
    }

    fun adjustWillpower(id: String, kind: DamageKind, delta: Int) = mutate(id) {
        it.copy(willpower = adjustDamage(it.willpower, kind, delta))
    }

    fun clearHealth(id: String) = mutate(id) { it.copy(health = clearDamage(it.health)) }
    fun clearWillpower(id: String) = mutate(id) { it.copy(willpower = clearDamage(it.willpower)) }

    fun addCondition(id: String, label: String, note: String? = null) {
        val cleaned = label.trim()
        if (cleaned.isEmpty()) return
        mutate(id) { p ->
            val condition = Condition(UUID.randomUUID().toString(), cleaned, note?.trim()?.takeIf { it.isNotEmpty() })
            p.copy(conditions = p.conditions + condition)
        }
        val current = _recentConditions.value
        _recentConditions.value = (listOf(cleaned) + current.filterNot { it.equals(cleaned, ignoreCase = true) }).take(12)
    }

    fun removeCondition(profileId: String, conditionId: String) = mutate(profileId) { p ->
        p.copy(conditions = p.conditions.filterNot { it.id == conditionId })
    }

    fun upsertCustomTracker(profileId: String, tracker: CustomTracker) = mutate(profileId) { p ->
        val existing = p.customTrackers.indexOfFirst { it.id == tracker.id }
        val list = if (existing >= 0) p.customTrackers.toMutableList().also { it[existing] = tracker }
        else p.customTrackers + tracker
        p.copy(customTrackers = list)
    }

    fun addCustomTracker(profileId: String, label: String, display: CustomTrackerDisplay, max: Int?) {
        val cleaned = label.trim()
        if (cleaned.isEmpty()) return
        upsertCustomTracker(profileId, CustomTracker(
            id = UUID.randomUUID().toString(),
            label = cleaned,
            currentValue = 0,
            maxValue = max,
            displayType = display,
        ))
    }

    fun removeCustomTracker(profileId: String, trackerId: String) = mutate(profileId) { p ->
        p.copy(customTrackers = p.customTrackers.filterNot { it.id == trackerId })
    }

    fun setShortNotes(id: String, notes: String) = mutate(id) { it.copy(shortNotes = notes) }

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
            _undo.value = null
        }
    }

    fun performUndo() {
        val snap = _undo.value ?: return
        if (!snap.isFresh()) { _undo.value = null; return }
        viewModelScope.launch {
            if (snap.wasPresent) repo.upsert(snap.profile) else repo.delete(snap.profile.id)
            _undo.value = null
        }
    }

    fun dismissUndo() { _undo.value = null }

    private fun mutate(id: String, transform: (Profile) -> Profile) {
        viewModelScope.launch {
            val current = repo.findProfile(id) ?: return@launch
            snapshot(current, wasPresent = true)
            val next = transform(current).copy(updatedAt = System.currentTimeMillis())
            repo.upsert(next)
        }
    }

    private fun snapshot(profile: Profile, wasPresent: Boolean) {
        _undo.value = UndoSnapshot(profile = profile, wasPresent = wasPresent, takenAt = System.currentTimeMillis())
    }

    class Factory(private val repo: LedgerRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T = LedgerViewModel(repo) as T
    }
}

enum class ImportMode { REPLACE, MERGE }

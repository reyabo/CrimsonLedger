package io.crimsonledger.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.crimsonledger.domain.DamageKind
import io.crimsonledger.domain.Labels
import io.crimsonledger.ui.LedgerViewModel
import io.crimsonledger.ui.components.ConditionsList
import io.crimsonledger.ui.components.CustomTrackers
import io.crimsonledger.ui.components.DamageTrackRow
import io.crimsonledger.ui.components.HumanityTrack
import io.crimsonledger.ui.components.HungerTrack
import io.crimsonledger.ui.components.PipVariant
import io.crimsonledger.ui.components.ShortNotes

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    profileId: String,
    viewModel: LedgerViewModel,
    onBack: () -> Unit,
    onExport: (String) -> Unit,
) {
    val profile by viewModel.profileFlow(profileId).collectAsState(initial = null)
    val recent by viewModel.recentConditions.collectAsState()
    val p = profile
    var overflow by remember { mutableStateOf(false) }
    var renameOpen by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(p?.name ?: "")
                        p?.chronicle?.let {
                            Text(it, style = androidx.compose.material3.MaterialTheme.typography.bodyMedium)
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { overflow = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More")
                    }
                    DropdownMenu(expanded = overflow, onDismissRequest = { overflow = false }) {
                        DropdownMenuItem(text = { Text("Rename") }, onClick = { overflow = false; renameOpen = true })
                        DropdownMenuItem(text = { Text("Duplicate") }, onClick = {
                            overflow = false; viewModel.duplicate(profileId)
                        })
                        DropdownMenuItem(
                            text = { Text(if (p?.archived == true) "Unarchive" else "Archive") },
                            onClick = {
                                overflow = false
                                p?.let { viewModel.setArchived(it.id, !it.archived) }
                            },
                        )
                        DropdownMenuItem(text = { Text("Export JSON") }, onClick = {
                            overflow = false; onExport(profileId)
                        })
                        DropdownMenuItem(text = { Text("Delete") }, onClick = {
                            overflow = false
                            viewModel.delete(profileId)
                            onBack()
                        })
                    }
                },
            )
        },
    ) { padding ->
        if (p == null) {
            Column(modifier = Modifier.fillMaxSize().padding(padding), verticalArrangement = Arrangement.Center) {}
            return@Scaffold
        }
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            HungerTrack(thirst = p.thirst, onChange = { viewModel.setHunger(profileId, it) })
            HorizontalDivider()
            HumanityTrack(
                morality = p.morality,
                marks = p.marks,
                onMoralityChange = { viewModel.setHumanity(profileId, it) },
                onMarksChange = { viewModel.setStains(profileId, it) },
            )
            HorizontalDivider()
            DamageTrackRow(
                title = Labels.HEALTH,
                variant = PipVariant.HEALTH,
                track = p.health,
                showTorporBadge = true,
                onCycle = { viewModel.cycleHealth(profileId, it) },
                onAdjust = { kind: DamageKind, delta -> viewModel.adjustHealth(profileId, kind, delta) },
                onClear = { viewModel.clearHealth(profileId) },
                onMaxChange = { viewModel.setHealthMax(profileId, it) },
            )
            HorizontalDivider()
            DamageTrackRow(
                title = Labels.WILLPOWER,
                variant = PipVariant.WILLPOWER,
                track = p.willpower,
                onCycle = { viewModel.cycleWillpower(profileId, it) },
                onAdjust = { kind: DamageKind, delta -> viewModel.adjustWillpower(profileId, kind, delta) },
                onClear = { viewModel.clearWillpower(profileId) },
                onMaxChange = { viewModel.setWillpowerMax(profileId, it) },
            )
            HorizontalDivider()
            ConditionsList(
                conditions = p.conditions,
                suggestions = recent,
                onAdd = { viewModel.addCondition(profileId, it) },
                onRemove = { viewModel.removeCondition(profileId, it.id) },
            )
            HorizontalDivider()
            CustomTrackers(
                trackers = p.customTrackers,
                onAdd = { label, display, max -> viewModel.addCustomTracker(profileId, label, display, max) },
                onUpdate = { viewModel.updateCustomTrackerValue(profileId, it) },
                onRemove = { viewModel.removeCustomTracker(profileId, it.id) },
            )
            HorizontalDivider()
            ShortNotes(value = p.shortNotes, onCommit = { viewModel.setShortNotes(profileId, it) })
            Spacer(Modifier.height(48.dp))
        }
    }

    if (renameOpen && p != null) RenameDialog(
        initialName = p.name,
        initialChronicle = p.chronicle.orEmpty(),
        onDismiss = { renameOpen = false },
        onConfirm = { name, chronicle ->
            viewModel.rename(profileId, name, chronicle.ifBlank { null })
            renameOpen = false
        },
    )
}

@Composable
private fun RenameDialog(
    initialName: String,
    initialChronicle: String,
    onDismiss: () -> Unit,
    onConfirm: (String, String) -> Unit,
) {
    var name by remember { mutableStateOf(initialName) }
    var chronicle by remember { mutableStateOf(initialChronicle) }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(enabled = name.isNotBlank(), onClick = { onConfirm(name, chronicle) }) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
        title = { Text("Rename") },
        text = {
            Column {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    singleLine = true,
                    label = { Text("Name") },
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = chronicle,
                    onValueChange = { chronicle = it },
                    singleLine = true,
                    label = { Text("Chronicle") },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
    )
}

package io.crimsonledger.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.crimsonledger.domain.CustomTracker
import io.crimsonledger.domain.CustomTrackerDisplay
import io.crimsonledger.domain.Labels
import io.crimsonledger.domain.PipState
import kotlin.math.max
import kotlin.math.min

@Composable
fun CustomTrackers(
    trackers: List<CustomTracker>,
    onAdd: (String, CustomTrackerDisplay, Int?) -> Unit,
    onUpdate: (CustomTracker) -> Unit,
    onRemove: (CustomTracker) -> Unit,
    modifier: Modifier = Modifier,
) {
    var addOpen by remember { mutableStateOf(false) }

    Column(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(Labels.CUSTOM, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.weight(1f))
            IconButton(onClick = { addOpen = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add custom tracker")
            }
        }
        Spacer(Modifier.height(6.dp))

        if (trackers.isEmpty()) {
            Text(
                "Add a custom tracker for the things this session actually tracks.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                style = MaterialTheme.typography.bodyMedium,
            )
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                trackers.forEach { tracker ->
                    TrackerCard(
                        tracker = tracker,
                        onUpdate = onUpdate,
                        onRemove = { onRemove(tracker) },
                    )
                }
            }
        }
    }

    if (addOpen) AddTrackerDialog(
        onDismiss = { addOpen = false },
        onConfirm = { label, display, max ->
            onAdd(label, display, max)
            addOpen = false
        },
    )
}

@Composable
private fun TrackerCard(tracker: CustomTracker, onUpdate: (CustomTracker) -> Unit, onRemove: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    tracker.label,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f),
                )
                IconButton(onClick = onRemove) {
                    Icon(Icons.Default.Delete, contentDescription = "Remove ${tracker.label}")
                }
            }
            when (tracker.displayType) {
                CustomTrackerDisplay.COUNTER -> CounterBody(tracker, onUpdate)
                CustomTrackerDisplay.PIPS -> PipsBody(tracker, onUpdate)
                CustomTrackerDisplay.CHECKLIST -> ChecklistBody(tracker, onUpdate)
            }
        }
    }
}

@Composable
private fun CounterBody(tracker: CustomTracker, onUpdate: (CustomTracker) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = { onUpdate(tracker.copy(currentValue = tracker.currentValue - 1)) }) {
            Icon(Icons.Default.Remove, contentDescription = "Decrease")
        }
        Text(
            text = tracker.maxValue?.let { "${tracker.currentValue} / $it" } ?: "${tracker.currentValue}",
            style = MaterialTheme.typography.titleMedium,
        )
        IconButton(onClick = {
            val next = tracker.currentValue + 1
            val bounded = tracker.maxValue?.let { min(next, it) } ?: next
            onUpdate(tracker.copy(currentValue = bounded))
        }) { Icon(Icons.Default.Add, contentDescription = "Increase") }
    }
}

@Composable
private fun PipsBody(tracker: CustomTracker, onUpdate: (CustomTracker) -> Unit) {
    val total = tracker.maxValue ?: 5
    val value = tracker.currentValue.coerceIn(0, total)
    val states = (0 until total).map { idx -> if (idx < value) PipState.AGGRAVATED else PipState.EMPTY }
    PipRow(
        states = states,
        variant = PipVariant.GENERIC,
        onTap = { index ->
            val next = if (index < value) index else index + 1
            onUpdate(tracker.copy(currentValue = next.coerceIn(0, total)))
        },
    )
}

@Composable
private fun ChecklistBody(tracker: CustomTracker, onUpdate: (CustomTracker) -> Unit) {
    val total = max(1, tracker.maxValue ?: 3)
    val value = tracker.currentValue.coerceIn(0, total)
    Column {
        repeat(total) { idx ->
            val checked = idx < value
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(
                    checked = checked,
                    onCheckedChange = { want ->
                        val next = if (want) idx + 1 else idx
                        onUpdate(tracker.copy(currentValue = next))
                    },
                )
                Text("Step ${idx + 1}")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddTrackerDialog(onDismiss: () -> Unit, onConfirm: (String, CustomTrackerDisplay, Int?) -> Unit) {
    var label by remember { mutableStateOf("") }
    var display by remember { mutableStateOf(CustomTrackerDisplay.COUNTER) }
    var maxText by remember { mutableStateOf("") }
    var dropdown by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(onClick = {
                val max = maxText.toIntOrNull()?.takeIf { it > 0 }
                if (label.isNotBlank()) onConfirm(label.trim(), display, max)
            }) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
        title = { Text("New custom tracker") },
        text = {
            Column {
                OutlinedTextField(
                    value = label,
                    onValueChange = { label = it },
                    singleLine = true,
                    label = { Text("Label") },
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(8.dp))
                ExposedDropdownMenuBox(expanded = dropdown, onExpandedChange = { dropdown = !dropdown }) {
                    OutlinedTextField(
                        readOnly = true,
                        value = display.name.lowercase().replaceFirstChar { it.titlecase() },
                        onValueChange = {},
                        label = { Text("Display") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = dropdown) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                    )
                    androidx.compose.material3.ExposedDropdownMenu(expanded = dropdown, onDismissRequest = { dropdown = false }) {
                        CustomTrackerDisplay.values().forEach { option ->
                            DropdownMenuItem(
                                text = { Text(option.name.lowercase().replaceFirstChar { it.titlecase() }) },
                                onClick = { display = option; dropdown = false },
                            )
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = maxText,
                    onValueChange = { v -> maxText = v.filter(Char::isDigit) },
                    singleLine = true,
                    label = { Text("Max (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
    )
}

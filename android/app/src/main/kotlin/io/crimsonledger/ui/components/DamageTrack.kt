package io.crimsonledger.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import io.crimsonledger.domain.DamageKind
import io.crimsonledger.domain.DamageTrack
import io.crimsonledger.domain.Labels
import io.crimsonledger.domain.isImpaired
import io.crimsonledger.domain.isTorpor
import io.crimsonledger.domain.pipStatesFor

@Composable
fun DamageTrackRow(
    title: String,
    variant: PipVariant,
    track: DamageTrack,
    showTorporBadge: Boolean = false,
    onCycle: (Int) -> Unit,
    onAdjust: (DamageKind, Int) -> Unit,
    onClear: () -> Unit,
    onMaxChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    var altOpen by remember { mutableStateOf(false) }

    Column(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.width(8.dp))
            if (isTorpor(track) && showTorporBadge) DangerBadge(Labels.TORPOR)
            else if (isImpaired(track)) WarnBadge(Labels.IMPAIRED)
            Spacer(Modifier.weight(1f))
            IconButton(onClick = { altOpen = !altOpen }) {
                Icon(
                    imageVector = if (altOpen) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = if (altOpen) "Hide adjustments" else "Show adjustments",
                )
            }
        }
        Spacer(Modifier.height(6.dp))
        PipRow(
            states = pipStatesFor(track),
            variant = variant,
            onTap = onCycle,
            modifier = Modifier.fillMaxWidth(),
        )

        AnimatedVisibility(visible = altOpen) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Spacer(Modifier.height(8.dp))
                AdjustRow(Labels.SUPERFICIAL, track.superficial) { delta -> onAdjust(DamageKind.SUPERFICIAL, delta) }
                AdjustRow(Labels.AGGRAVATED, track.aggravated) { delta -> onAdjust(DamageKind.AGGRAVATED, delta) }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Max", style = MaterialTheme.typography.labelLarge)
                    Spacer(Modifier.width(6.dp))
                    IconButton(onClick = { onMaxChange(track.max - 1) }) {
                        Icon(Icons.Default.Remove, contentDescription = "Decrease max")
                    }
                    Text("${track.max}")
                    IconButton(onClick = { onMaxChange(track.max + 1) }) {
                        Icon(Icons.Default.Add, contentDescription = "Increase max")
                    }
                    Spacer(Modifier.weight(1f))
                    TextButton(onClick = onClear) { Text("Clear damage") }
                }
            }
        }
    }
}

@Composable
private fun AdjustRow(label: String, value: Int, onDelta: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(label, style = MaterialTheme.typography.labelLarge, modifier = Modifier.width(104.dp))
        IconButton(onClick = { onDelta(-1) }) {
            Icon(Icons.Default.Remove, contentDescription = "Decrease $label")
        }
        Text("$value")
        IconButton(onClick = { onDelta(1) }) {
            Icon(Icons.Default.Add, contentDescription = "Increase $label")
        }
    }
}

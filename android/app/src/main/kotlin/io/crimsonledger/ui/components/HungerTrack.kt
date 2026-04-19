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
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.crimsonledger.domain.Bounds
import io.crimsonledger.domain.Labels
import io.crimsonledger.domain.PipState
import io.crimsonledger.domain.Severity
import io.crimsonledger.domain.hungerSeverity

@Composable
fun HungerTrack(
    thirst: Int,
    onChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    val severity = hungerSeverity(thirst)
    Column(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(Labels.HUNGER, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.width(8.dp))
            when (severity) {
                Severity.DANGER -> DangerBadge("Ravenous")
                Severity.WARN -> WarnBadge("Thirsty")
                Severity.NONE -> {}
            }
        }
        Spacer(Modifier.height(8.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            IconButton(onClick = { onChange(thirst - 1) }) {
                Icon(Icons.Default.Remove, contentDescription = "Decrease hunger")
            }
            val states = (0 until Bounds.HUNGER_MAX).map {
                if (it < thirst) PipState.AGGRAVATED else PipState.EMPTY
            }
            PipRow(
                states = states,
                variant = PipVariant.HUNGER,
                onTap = { index ->
                    val next = if (index < thirst) index else index + 1
                    onChange(next)
                },
                modifier = Modifier.weight(1f),
            )
            IconButton(onClick = { onChange(thirst + 1) }) {
                Icon(Icons.Default.Add, contentDescription = "Increase hunger")
            }
        }
    }
}

package io.crimsonledger.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import io.crimsonledger.domain.atDegenerationRisk
import io.crimsonledger.domain.humanitySeverity

@Composable
fun HumanityTrack(
    morality: Int,
    marks: Int,
    onMoralityChange: (Int) -> Unit,
    onMarksChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    val severity = humanitySeverity(morality)
    val overflow = atDegenerationRisk(morality, marks)

    Column(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(Labels.HUMANITY, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.width(8.dp))
            when (severity) {
                Severity.DANGER -> DangerBadge("Degenerating")
                Severity.WARN -> WarnBadge("Shaken")
                Severity.NONE -> {}
            }
            if (overflow) {
                Spacer(Modifier.width(6.dp))
                DangerBadge(Labels.DEGENERATION_RISK)
            }
        }
        Spacer(Modifier.height(8.dp))

        // Dots: filled from the left for Humanity; Stains overlay from the right.
        val total = Bounds.HUMANITY_MAX
        val states = (0 until total).map { idx ->
            val fromRight = total - 1 - idx
            when {
                fromRight < marks -> PipState.AGGRAVATED  // Stains
                idx < morality -> PipState.SUPERFICIAL    // Humanity
                else -> PipState.EMPTY
            }
        }
        val variants = (0 until total).map { idx ->
            val fromRight = total - 1 - idx
            if (fromRight < marks) PipVariant.STAIN else PipVariant.HUMANITY
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            states.forEachIndexed { idx, state ->
                Box { Pip(state = state, variant = variants[idx], size = 28.dp) }
            }
        }
        Spacer(Modifier.height(8.dp))
        Row(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(Labels.HUMANITY, style = MaterialTheme.typography.labelLarge)
            IconButton(onClick = { onMoralityChange(morality - 1) }) {
                Icon(Icons.Default.Remove, contentDescription = "Decrease humanity")
            }
            Text("$morality / $total")
            IconButton(onClick = { onMoralityChange(morality + 1) }) {
                Icon(Icons.Default.Add, contentDescription = "Increase humanity")
            }
            Spacer(Modifier.width(12.dp))
            Text(Labels.STAINS, style = MaterialTheme.typography.labelLarge)
            IconButton(onClick = { onMarksChange(marks - 1) }) {
                Icon(Icons.Default.Remove, contentDescription = "Decrease stains")
            }
            Text("$marks")
            IconButton(onClick = { onMarksChange(marks + 1) }) {
                Icon(Icons.Default.Add, contentDescription = "Increase stains")
            }
        }
    }
}

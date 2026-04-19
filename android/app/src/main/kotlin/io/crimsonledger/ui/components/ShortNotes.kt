package io.crimsonledger.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.crimsonledger.domain.Labels
import kotlinx.coroutines.delay

/**
 * Debounces writes to the store so every keystroke isn't a DB round-trip.
 */
@Composable
fun ShortNotes(
    value: String,
    onCommit: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var draft by remember(value) { mutableStateOf(value) }

    LaunchedEffect(draft) {
        if (draft == value) return@LaunchedEffect
        delay(400)
        onCommit(draft)
    }

    Column(modifier = modifier) {
        Text(Labels.NOTES, style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(6.dp))
        OutlinedTextField(
            value = draft,
            onValueChange = { draft = it },
            modifier = Modifier.fillMaxWidth().height(120.dp),
            placeholder = { Text("Quick scratchpad for this session…") },
        )
    }
}

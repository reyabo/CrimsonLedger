package io.crimsonledger.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.crimsonledger.domain.PipState

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PipRow(
    states: List<PipState>,
    variant: PipVariant,
    onTap: ((Int) -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    FlowRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        states.forEachIndexed { index, state ->
            Pip(
                state = state,
                variant = variant,
                onTap = onTap?.let { { it(index) } },
            )
        }
    }
}

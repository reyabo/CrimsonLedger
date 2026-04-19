package io.crimsonledger.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import io.crimsonledger.ui.theme.Amber
import io.crimsonledger.ui.theme.Bone100
import io.crimsonledger.ui.theme.CrimsonBright
import io.crimsonledger.ui.theme.CrimsonDeep

@Composable
fun DangerBadge(label: String, modifier: Modifier = Modifier, tint: Color = CrimsonBright) {
    Text(
        text = label.uppercase(),
        color = Bone100,
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(tint)
            .padding(PaddingValues(horizontal = 8.dp, vertical = 2.dp)),
    )
}

@Composable
fun WarnBadge(label: String, modifier: Modifier = Modifier) =
    DangerBadge(label = label, modifier = modifier, tint = Amber)

@Composable
fun MutedBadge(label: String, modifier: Modifier = Modifier) =
    DangerBadge(label = label, modifier = modifier, tint = CrimsonDeep)

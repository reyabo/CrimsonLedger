package io.crimsonledger.ui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import io.crimsonledger.domain.PipState
import io.crimsonledger.ui.theme.Amber
import io.crimsonledger.ui.theme.Bone100
import io.crimsonledger.ui.theme.Bone400
import io.crimsonledger.ui.theme.CrimsonBright
import io.crimsonledger.ui.theme.Ink600
import io.crimsonledger.ui.theme.Ink700

enum class PipVariant { HEALTH, WILLPOWER, HUMANITY, STAIN, HUNGER, GENERIC }

@Composable
fun Pip(
    state: PipState,
    variant: PipVariant,
    onTap: (() -> Unit)? = null,
    size: Dp = 28.dp,
) {
    val context = LocalContext.current
    val filled = when (variant) {
        PipVariant.HEALTH, PipVariant.WILLPOWER -> CrimsonBright
        PipVariant.HUMANITY -> Bone100
        PipVariant.STAIN -> CrimsonBright
        PipVariant.HUNGER -> Amber
        PipVariant.GENERIC -> Bone100
    }
    val fill: Color = when (state) {
        PipState.EMPTY -> Color.Transparent
        PipState.SUPERFICIAL -> filled.copy(alpha = 0.55f)
        PipState.AGGRAVATED -> filled
    }
    val border = when (state) {
        PipState.EMPTY -> Ink600
        PipState.SUPERFICIAL -> filled
        PipState.AGGRAVATED -> filled
    }

    Box(
        modifier = Modifier
            .size(size)
            .clip(RoundedCornerShape(6.dp))
            .background(Ink700)
            .border(1.5.dp, border, RoundedCornerShape(6.dp))
            .then(
                if (onTap != null) Modifier.clickable(role = Role.Button) {
                    haptic(context)
                    onTap()
                } else Modifier,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Box(
            modifier = Modifier
                .size(size - 8.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(fill),
        )
        if (state == PipState.AGGRAVATED) {
            AggravatedCross(size = size - 10.dp)
        }
    }
}

@Composable
private fun AggravatedCross(size: Dp) {
    // A simple × drawn with two diagonals to mark aggravated damage at a glance.
    androidx.compose.foundation.Canvas(modifier = Modifier.size(size)) {
        val stroke = Stroke(width = 2.5f, cap = StrokeCap.Round)
        drawLine(
            color = Bone100,
            start = androidx.compose.ui.geometry.Offset(0f, 0f),
            end = androidx.compose.ui.geometry.Offset(this.size.width, this.size.height),
            strokeWidth = stroke.width,
            cap = stroke.cap,
        )
        drawLine(
            color = Bone100,
            start = androidx.compose.ui.geometry.Offset(this.size.width, 0f),
            end = androidx.compose.ui.geometry.Offset(0f, this.size.height),
            strokeWidth = stroke.width,
            cap = stroke.cap,
        )
    }
}

private fun haptic(context: android.content.Context) {
    // Short vibration; no-op if the device lacks a vibrator or permission.
    runCatching {
        val vibrator = context.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? android.os.Vibrator
        if (vibrator?.hasVibrator() == true) {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                vibrator.vibrate(android.os.VibrationEffect.createOneShot(10L, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION") vibrator.vibrate(10L)
            }
        }
    }
}

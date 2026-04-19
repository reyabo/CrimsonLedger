package io.crimsonledger.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

private val CrimsonDark = darkColorScheme(
    primary = CrimsonBright,
    onPrimary = Bone100,
    primaryContainer = Crimson,
    onPrimaryContainer = Bone100,
    secondary = CrimsonDeep,
    onSecondary = Bone100,
    background = Ink900,
    onBackground = Bone100,
    surface = Ink800,
    onSurface = Bone100,
    surfaceVariant = Ink700,
    onSurfaceVariant = Bone400,
    outline = Ink600,
    error = CrimsonBright,
    onError = Bone100,
)

private val CrimsonTypography = Typography(
    titleLarge = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 22.sp, letterSpacing = 0.2.sp),
    titleMedium = TextStyle(fontWeight = FontWeight.Medium, fontSize = 18.sp),
    bodyLarge = TextStyle(fontWeight = FontWeight.Normal, fontSize = 16.sp),
    bodyMedium = TextStyle(fontWeight = FontWeight.Normal, fontSize = 14.sp),
    labelLarge = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 14.sp, letterSpacing = 0.4.sp),
)

@Composable
fun CrimsonLedgerTheme(
    @Suppress("UNUSED_PARAMETER") darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    // The product is dark-first; we ignore the system flag deliberately.
    MaterialTheme(
        colorScheme = CrimsonDark,
        typography = CrimsonTypography,
        content = content,
    )
}

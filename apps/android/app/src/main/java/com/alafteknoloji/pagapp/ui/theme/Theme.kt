package com.alafteknoloji.pagapp.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

@Immutable
data class PAGColors(
    val brandMidnight: Color,
    val brandLime: Color,
    val brandBlue: Color,
    
    val backgroundPrimary: Color,
    val surfacePrimary: Color,
    val surfaceSecondary: Color,
    
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    
    val borderDefault: Color,
    val borderStrong: Color,
    
    val success: Color,
    val warning: Color,
    val error: Color,
    val info: Color,

    val brandOrange: Color = warning,
    val border: Color = borderDefault
)

val LocalPAGColors = staticCompositionLocalOf {
    LightPAGColors // Default fallback
}

val LightPAGColors = PAGColors(
    brandMidnight = PAGMidnight,
    brandLime = PAGLime,
    brandBlue = PAGBlue,
    backgroundPrimary = LightBackgroundPrimary,
    surfacePrimary = LightSurfacePrimary,
    surfaceSecondary = LightSurfaceSecondary,
    textPrimary = LightTextPrimary,
    textSecondary = LightTextSecondary,
    textMuted = LightTextMuted,
    borderDefault = LightBorderDefault,
    borderStrong = LightBorderStrong,
    success = PAGSuccess,
    warning = PAGWarning,
    error = PAGError,
    info = PAGInfo
)

val DarkPAGColors = PAGColors(
    brandMidnight = PAGMidnight,
    brandLime = PAGLime,
    brandBlue = PAGBlue,
    backgroundPrimary = DarkBackgroundPrimary,
    surfacePrimary = DarkSurfacePrimary,
    surfaceSecondary = DarkSurfaceSecondary,
    textPrimary = DarkTextPrimary,
    textSecondary = DarkTextSecondary,
    textMuted = DarkTextMuted,
    borderDefault = DarkBorderDefault,
    borderStrong = DarkBorderStrong,
    success = PAGSuccess,
    warning = PAGWarning,
    error = PAGError,
    info = PAGInfo
)

// Map to Material 3 as best effort for standard components
private val LightColorScheme = lightColorScheme(
    primary = PAGLime,
    onPrimary = PAGMidnight,
    background = LightBackgroundPrimary,
    surface = LightSurfacePrimary,
    onBackground = LightTextPrimary,
    onSurface = LightTextPrimary,
    error = PAGError,
    outline = LightBorderDefault
)

private val DarkColorScheme = darkColorScheme(
    primary = PAGLime,
    onPrimary = PAGMidnight,
    background = DarkBackgroundPrimary,
    surface = DarkSurfacePrimary,
    onBackground = DarkTextPrimary,
    onSurface = DarkTextPrimary,
    error = PAGError,
    outline = DarkBorderDefault
)

object PAGTheme {
    val colors: PAGColors
        @Composable
        get() = LocalPAGColors.current
    
    val typography: PAGTypography
        @Composable
        get() = LocalPAGTypography.current

    val spacing: PAGSpacing
        @Composable
        get() = LocalPAGSpacing.current

    val radius: PAGRadius
        @Composable
        get() = LocalPAGRadius.current
}

@Composable
fun PAGAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val pagColors = if (darkTheme) DarkPAGColors else LightPAGColors
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    CompositionLocalProvider(
        LocalPAGColors provides pagColors,
        LocalPAGTypography provides defaultPAGTypography,
        LocalPAGSpacing provides defaultPAGSpacing,
        LocalPAGRadius provides defaultPAGRadius
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            content = content
        )
    }
}

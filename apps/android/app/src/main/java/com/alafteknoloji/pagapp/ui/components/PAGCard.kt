package com.alafteknoloji.pagapp.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun PAGCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = PAGTheme.colors.surfacePrimary,
    borderColor: Color = PAGTheme.colors.borderDefault,
    shape: Shape = PAGTheme.radius.xl,
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        modifier = modifier,
        shape = shape,
        color = backgroundColor,
        border = BorderStroke(1.dp, borderColor),
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(PAGTheme.spacing.md),
            content = content
        )
    }
}

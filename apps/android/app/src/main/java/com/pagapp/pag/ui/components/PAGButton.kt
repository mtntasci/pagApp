package com.pagapp.pag.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.pagapp.pag.ui.theme.PAGTheme

enum class PAGButtonStyle {
    Primary,
    Secondary,
    Destructive
}

@Composable
fun PAGButton(
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    style: PAGButtonStyle = PAGButtonStyle.Primary,
    enabled: Boolean = true
) {
    val containerColor: Color
    val contentColor: Color

    when (style) {
        PAGButtonStyle.Primary -> {
            containerColor = PAGTheme.colors.brandLime
            contentColor = PAGTheme.colors.brandMidnight
        }
        PAGButtonStyle.Secondary -> {
            containerColor = PAGTheme.colors.surfaceSecondary
            contentColor = PAGTheme.colors.textPrimary
        }
        PAGButtonStyle.Destructive -> {
            containerColor = PAGTheme.colors.error
            contentColor = PAGTheme.colors.surfacePrimary
        }
    }

    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp),
        enabled = enabled,
        shape = PAGTheme.radius.md,
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = contentColor,
            disabledContainerColor = containerColor.copy(alpha = 0.5f),
            disabledContentColor = contentColor.copy(alpha = 0.5f)
        )
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = title,
                style = PAGTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold)
            )
            if (icon != null) {
                Spacer(modifier = Modifier.width(PAGTheme.spacing.xs))
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

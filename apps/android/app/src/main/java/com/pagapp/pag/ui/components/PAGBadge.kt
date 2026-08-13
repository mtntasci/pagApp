package com.pagapp.pag.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.pagapp.pag.ui.theme.PAGTheme

enum class PAGBadgeStyle {
    ProfileScore,
    RewardPool,
    Tag,
    Info
}

@Composable
fun PAGBadge(
    title: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    style: PAGBadgeStyle = PAGBadgeStyle.Tag
) {
    val backgroundColor: Color
    val contentColor: Color

    when (style) {
        PAGBadgeStyle.ProfileScore -> {
            backgroundColor = PAGTheme.colors.brandLime.copy(alpha = 0.18f)
            contentColor = PAGTheme.colors.textPrimary
        }
        PAGBadgeStyle.RewardPool -> {
            backgroundColor = PAGTheme.colors.success.copy(alpha = 0.12f)
            contentColor = PAGTheme.colors.success
        }
        PAGBadgeStyle.Tag -> {
            backgroundColor = PAGTheme.colors.surfaceSecondary
            contentColor = PAGTheme.colors.textSecondary
        }
        PAGBadgeStyle.Info -> {
            backgroundColor = PAGTheme.colors.brandBlue.copy(alpha = 0.12f)
            contentColor = PAGTheme.colors.brandBlue
        }
    }

    Row(
        modifier = modifier
            .clip(CircleShape)
            .background(backgroundColor)
            .padding(horizontal = PAGTheme.spacing.xs, vertical = PAGTheme.spacing.xxxs),
        horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xxxs),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = contentColor,
                modifier = Modifier.size(11.dp)
            )
        }
        Text(
            text = title,
            style = PAGTheme.typography.caption.copy(fontWeight = FontWeight.SemiBold),
            color = contentColor
        )
    }
}

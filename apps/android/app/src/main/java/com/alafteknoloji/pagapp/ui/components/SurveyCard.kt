package com.alafteknoloji.pagapp.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.SurveyMock
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun SurveyCard(
    survey: SurveyMock,
    onTakeSurvey: () -> Unit,
    modifier: Modifier = Modifier
) {
    PAGCard(
        modifier = modifier.fillMaxWidth(),
        backgroundColor = PAGTheme.colors.surfacePrimary,
        borderColor = PAGTheme.colors.borderDefault,
        shape = PAGTheme.radius.xl
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xs)
        ) {
            // Header: Owner & Duration
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                PAGBadge(
                    title = survey.ownerName,
                    icon = if (survey.isProfileSurvey) Icons.Rounded.Person else Icons.Rounded.Star, // Using Star as placeholder for building
                    style = PAGBadgeStyle.Tag
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Lock, // Placeholder for clock
                        contentDescription = "Süre",
                        tint = PAGTheme.colors.textMuted,
                        modifier = Modifier.size(12.dp)
                    )
                    Text(
                        text = "${survey.estimatedDurationMinutes} dk",
                        style = PAGTheme.typography.bodySmall,
                        color = PAGTheme.colors.textMuted
                    )
                }
            }

            // Title
            Text(
                text = survey.title,
                style = PAGTheme.typography.heading,
                color = PAGTheme.colors.textPrimary,
                maxLines = 2
            )

            // Badges row: Profile Score & Reward Pool
            Row(
                horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xxs),
                modifier = Modifier.padding(top = 2.dp)
            ) {
                PAGBadge(
                    title = "+${survey.profileScoreReward} Profil Puanı",
                    icon = Icons.Filled.Star, // Placeholder for bolt.fill
                    style = PAGBadgeStyle.ProfileScore
                )

                survey.rewardPoolText?.let { rewardPool ->
                    PAGBadge(
                        title = rewardPool,
                        icon = Icons.Filled.Star, // Placeholder for gift.fill
                        style = PAGBadgeStyle.RewardPool
                    )
                }
            }

            Spacer(modifier = Modifier.height(2.dp))

            // CTA Button
            PAGButton(
                title = "Ankete Katıl",
                icon = Icons.Filled.ArrowForward,
                style = PAGButtonStyle.Primary,
                onClick = onTakeSurvey
            )
        }
    }
}

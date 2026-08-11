package com.alafteknoloji.pagapp.ui.screens.surveys

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.SurveyMock
import com.alafteknoloji.pagapp.models.SurveyStatus
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import java.text.DateFormat

@Composable
fun SurveyDetailScreen(
    survey: SurveyMock,
    onStartSurvey: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.backgroundPrimary)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 120.dp) // Leave space for bottom CTA
        ) {
            Column(
                modifier = Modifier.padding(PAGTheme.spacing.md),
                verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.lg)
            ) {
                // Header
                Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)) {
                    PAGBadge(
                        title = survey.ownerName,
                        icon = if (survey.isProfileSurvey) Icons.Filled.Person else Icons.Filled.Star,
                        style = PAGBadgeStyle.Tag
                    )
                    Text(
                        text = survey.title,
                        style = PAGTheme.typography.display,
                        color = PAGTheme.colors.textPrimary
                    )
                    Text(
                        text = survey.description,
                        style = PAGTheme.typography.body,
                        color = PAGTheme.colors.textSecondary
                    )
                }

                Divider(color = PAGTheme.colors.borderDefault)

                // Details Grid
                Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md)) {
                    DetailRow(icon = Icons.Filled.List, title = "Soru Sayısı", value = "${survey.questions.size} Soru")
                    DetailRow(icon = Icons.Filled.List, title = "Yaklaşık Süre", value = "${survey.estimatedDurationMinutes} Dakika")
                    survey.endDate?.let { date ->
                        DetailRow(
                            icon = Icons.Filled.List,
                            title = "Son Katılım",
                            value = DateFormat.getDateInstance(DateFormat.MEDIUM).format(date)
                        )
                    }
                }

                Divider(color = PAGTheme.colors.borderDefault)

                // Rewards
                Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)) {
                    Text(
                        text = "Kazanımlar",
                        style = PAGTheme.typography.title,
                        color = PAGTheme.colors.textPrimary
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        RewardBox(
                            title = "Profil Puanı",
                            value = "+${survey.profileScoreReward}",
                            color = PAGTheme.colors.brandLime,
                            modifier = Modifier.weight(1f)
                        )
                        survey.rewardPoolText?.let { poolText ->
                            RewardBox(
                                title = "Ödül Havuzu",
                                value = poolText,
                                color = PAGTheme.colors.brandBlue,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }
        }

        // Bottom Action
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(PAGTheme.colors.surfacePrimary.copy(alpha = 0.95f))
                .padding(PAGTheme.spacing.md)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Hızlı tamamla, ödül sıralamasında öne geç.",
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.textMuted
                )
                
                val isActive = survey.status == SurveyStatus.ACTIVE
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .background(
                            color = if (isActive) PAGTheme.colors.brandLime else PAGTheme.colors.borderDefault,
                            shape = PAGTheme.radius.md
                        )
                        .clickable(enabled = isActive) { onStartSurvey() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "ANKETE BAŞLA",
                        style = PAGTheme.typography.heading,
                        color = if (isActive) PAGTheme.colors.brandMidnight else PAGTheme.colors.textMuted
                    )
                }
            }
        }
    }
}

@Composable
private fun DetailRow(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = PAGTheme.colors.textMuted,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.size(8.dp))
        Text(
            text = title,
            style = PAGTheme.typography.body,
            color = PAGTheme.colors.textSecondary,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            style = PAGTheme.typography.bodyLarge,
            color = PAGTheme.colors.textPrimary
        )
    }
}

@Composable
private fun RewardBox(
    title: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .background(PAGTheme.colors.surfaceSecondary, PAGTheme.radius.lg)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = Icons.Filled.Star,
            contentDescription = null,
            tint = color
        )
        Text(
            text = value,
            style = PAGTheme.typography.heading,
            color = color
        )
        Text(
            text = title,
            style = PAGTheme.typography.bodySmall,
            color = PAGTheme.colors.textSecondary
        )
    }
}

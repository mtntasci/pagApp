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
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.PAGSurvey
import com.alafteknoloji.pagapp.services.SurveyService
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun SurveyDetailScreen(
    surveyId: String,
    onStartSurvey: (PAGSurvey) -> Unit,
    modifier: Modifier = Modifier,
    surveyService: SurveyService = remember { SurveyService() }
) {
    var survey by remember { mutableStateOf<PAGSurvey?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(surveyId) {
        isLoading = true
        survey = surveyService.fetchSurveyDetail(surveyId)
        isLoading = false
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.backgroundPrimary)
    ) {
        if (isLoading || survey == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PAGTheme.colors.brandLime)
            }
        } else {
            val currentSurvey = survey!!
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(bottom = 120.dp)
            ) {
                Column(
                    modifier = Modifier.padding(PAGTheme.spacing.md),
                    verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.lg)
                ) {
                    // Header
                    Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)) {
                        PAGBadge(
                            title = currentSurvey.ownerDisplayName,
                            icon = if (currentSurvey.surveyType == "PROFILE") Icons.Filled.Person else Icons.Filled.Star,
                            style = PAGBadgeStyle.Tag
                        )
                        Text(
                            text = currentSurvey.title,
                            style = PAGTheme.typography.display,
                            color = PAGTheme.colors.textPrimary
                        )
                        Text(
                            text = currentSurvey.description,
                            style = PAGTheme.typography.body,
                            color = PAGTheme.colors.textSecondary
                        )
                    }

                    HorizontalDivider(color = PAGTheme.colors.borderDefault)

                    // Details Grid
                    Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md)) {
                        DetailRow(icon = Icons.AutoMirrored.Filled.List, title = "Soru Sayısı", value = "${currentSurvey.questionCount} Soru (Max 3)")
                        DetailRow(icon = Icons.AutoMirrored.Filled.List, title = "Yaklaşık Süre", value = currentSurvey.estimatedDurationText)
                        DetailRow(icon = Icons.Filled.Person, title = "Anket Tipi", value = if (currentSurvey.surveyType == "PROFILE") "Profil Anketi" else "Standart Anket")
                    }

                    HorizontalDivider(color = PAGTheme.colors.borderDefault)

                    // Rewards
                    Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)) {
                        Text(
                            text = "Potansiyel Kazanım",
                            style = PAGTheme.typography.title,
                            color = PAGTheme.colors.textPrimary
                        )
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            RewardBox(
                                title = "Profil Puanı Potansiyeli",
                                value = "+${currentSurvey.profileScoreReward}",
                                color = PAGTheme.colors.brandLime,
                                modifier = Modifier.weight(1f)
                            )
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
                        text = if (currentSurvey.isCompleted) "Bu anketi daha önce tamamladınız." else "Hızlı tamamla, profil puanı sıralamasında öne geç.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textMuted
                    )

                    val canStart = currentSurvey.status == "ACTIVE" && (!currentSurvey.isCompleted || currentSurvey.surveyType == "PROFILE")
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .background(
                                color = if (canStart) PAGTheme.colors.brandLime else PAGTheme.colors.borderDefault,
                                shape = PAGTheme.radius.md
                            )
                            .clickable(enabled = canStart) { onStartSurvey(currentSurvey) },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (currentSurvey.surveyType == "PROFILE" && currentSurvey.isCompleted) "ANKETİ GÜNCELLE" else "ANKETE BAŞLA",
                            style = PAGTheme.typography.heading,
                            color = if (canStart) PAGTheme.colors.brandMidnight else PAGTheme.colors.textMuted
                        )
                    }
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

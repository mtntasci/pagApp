package com.alafteknoloji.pagapp.ui.screens.surveys

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.PAGSurvey
import com.alafteknoloji.pagapp.services.SurveyService
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.components.PAGCard
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import kotlinx.coroutines.launch

@Composable
fun SurveysScreen(
    onNavigateToDetail: (String) -> Unit,
    modifier: Modifier = Modifier,
    surveyService: SurveyService = remember { SurveyService() }
) {
    var selectedTab by remember { mutableStateOf(0) } // 0: Bekleyen, 1: Tamamlanan

    val eligibleSurveys by surveyService.eligibleSurveys.collectAsState()
    val completedSurveys by surveyService.completedSurveys.collectAsState()
    val isLoading by surveyService.isLoading.collectAsState()
    val errorMessage by surveyService.errorMessage.collectAsState()
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        surveyService.fetchEligibleSurveys()
        surveyService.fetchCompletedSurveys()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.backgroundPrimary)
    ) {
        // ==================================================
        // CORPORATE SEGMENTED TAB BUTTONS
        // ==================================================
        Surface(
            color = PAGTheme.colors.surfaceSecondary,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = PAGTheme.spacing.md, vertical = PAGTheme.spacing.md)
                .border(1.dp, PAGTheme.colors.borderDefault, RoundedCornerShape(12.dp))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Bekleyen Anketler Tab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(
                            if (selectedTab == 0) PAGTheme.colors.surfacePrimary else Color.Transparent,
                            RoundedCornerShape(8.dp)
                        )
                        .clickable { selectedTab = 0 }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Bekleyen",
                        style = PAGTheme.typography.heading,
                        color = if (selectedTab == 0) PAGTheme.colors.brandLime else PAGTheme.colors.textMuted
                    )
                }

                // Tamamlanan Anketler Tab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(
                            if (selectedTab == 1) PAGTheme.colors.surfacePrimary else Color.Transparent,
                            RoundedCornerShape(8.dp)
                        )
                        .clickable {
                            selectedTab = 1
                            scope.launch {
                                surveyService.fetchCompletedSurveys()
                            }
                        }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Tamamlanan",
                        style = PAGTheme.typography.heading,
                        color = if (selectedTab == 1) PAGTheme.colors.brandLime else PAGTheme.colors.textMuted
                    )
                }
            }
        }

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PAGTheme.colors.brandLime)
            }
        } else if (errorMessage != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = errorMessage ?: "",
                        style = PAGTheme.typography.body,
                        color = PAGTheme.colors.error
                    )
                    Button(
                        onClick = {
                            scope.launch {
                                surveyService.fetchEligibleSurveys()
                                surveyService.fetchCompletedSurveys()
                            }
                        }
                    ) {
                        Text("Yeniden Dene")
                    }
                }
            }
        } else {
            val currentList = if (selectedTab == 0) eligibleSurveys else completedSurveys

            if (currentList.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 60.dp),
                    contentAlignment = Alignment.TopCenter
                ) {
                    Text(
                        text = if (selectedTab == 0) "Henüz bekleyen anket bulunmuyor." else "Henüz tamamlanmış anketiniz bulunmuyor.",
                        style = PAGTheme.typography.body,
                        color = PAGTheme.colors.textMuted
                    )
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(PAGTheme.spacing.md),
                    verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md)
                ) {
                    items(currentList) { survey ->
                        if (selectedTab == 0) {
                            PAGSurveyCard(
                                survey = survey,
                                onTakeSurvey = { onNavigateToDetail(survey.surveyId) }
                            )
                        } else {
                            PAGCompletedSurveyCard(survey = survey)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PAGSurveyCard(
    survey: PAGSurvey,
    onTakeSurvey: () -> Unit
) {
    PAGCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onTakeSurvey() }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    PAGBadge(
                        title = survey.ownerDisplayName,
                        style = PAGBadgeStyle.Tag
                    )
                    if (survey.isHighlighted) {
                        PAGBadge(
                            title = "⭐ Öne Çıkan",
                            style = PAGBadgeStyle.RewardPool
                        )
                    }
                }
                PAGBadge(
                    title = "+${survey.profileScoreReward} Puan",
                    icon = Icons.Filled.Star,
                    style = PAGBadgeStyle.ProfileScore
                )
            }

            Text(
                text = survey.title,
                style = PAGTheme.typography.heading,
                color = PAGTheme.colors.textPrimary,
                maxLines = 1,
                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
            )

            Text(
                text = survey.description,
                style = PAGTheme.typography.bodySmall,
                color = PAGTheme.colors.textSecondary
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "3 Soru",
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.textMuted
                )

                Text(
                    text = "Katıl →",
                    style = PAGTheme.typography.bodyLarge,
                    color = PAGTheme.colors.brandLime,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun PAGCompletedSurveyCard(
    survey: PAGSurvey
) {
    PAGCard(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, PAGTheme.colors.success.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                PAGBadge(
                    title = survey.ownerDisplayName,
                    style = PAGBadgeStyle.Tag
                )
                PAGBadge(
                    title = "Tamamlandı",
                    icon = Icons.Filled.CheckCircle,
                    style = PAGBadgeStyle.Info
                )
            }

            Text(
                text = survey.title,
                style = PAGTheme.typography.heading,
                color = PAGTheme.colors.textPrimary,
                maxLines = 1,
                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
            )

            Text(
                text = survey.description,
                style = PAGTheme.typography.bodySmall,
                color = PAGTheme.colors.textSecondary
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Kazanılan Ödül: +${survey.profileScoreReward} Profil Puanı",
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.brandLime,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

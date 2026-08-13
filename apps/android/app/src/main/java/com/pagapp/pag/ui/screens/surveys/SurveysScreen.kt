package com.pagapp.pag.ui.screens.surveys

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import com.pagapp.pag.models.PAGSurvey
import com.pagapp.pag.services.SurveyService
import com.pagapp.pag.ui.components.PAGBadge
import com.pagapp.pag.ui.components.PAGBadgeStyle
import com.pagapp.pag.ui.components.PAGCard
import com.pagapp.pag.ui.theme.PAGTheme

@Composable
fun SurveysScreen(
    onNavigateToDetail: (String) -> Unit,
    modifier: Modifier = Modifier,
    surveyService: SurveyService = remember { SurveyService() }
) {
    var selectedCategory by remember { mutableStateOf("Sana Uygun") }
    val categories = listOf("Sana Uygun", "Yeni", "Tamamlanan")

    val eligibleSurveys by surveyService.eligibleSurveys.collectAsState()
    val isLoading by surveyService.isLoading.collectAsState()

    LaunchedEffect(Unit) {
        surveyService.fetchEligibleSurveys()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.backgroundPrimary)
    ) {
        // Category Tabs
        LazyRow(
            contentPadding = PaddingValues(horizontal = PAGTheme.spacing.md, vertical = PAGTheme.spacing.sm),
            horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
        ) {
            items(categories) { category ->
                val isSelected = selectedCategory == category
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(if (isSelected) PAGTheme.colors.brandMidnight else Color.Transparent)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) Color.Transparent else PAGTheme.colors.borderDefault,
                            shape = CircleShape
                        )
                        .clickable { selectedCategory = category }
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = category,
                        style = PAGTheme.typography.bodyLarge,
                        color = if (isSelected) PAGTheme.colors.brandLime else PAGTheme.colors.textSecondary
                    )
                }
            }
        }

    val errorMessage by surveyService.errorMessage.collectAsState()
    val scope = androidx.compose.runtime.rememberCoroutineScope()

    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = PAGTheme.colors.brandLime)
        }
    } else if (errorMessage != null) {
        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = errorMessage ?: "",
                    style = PAGTheme.typography.body,
                    color = PAGTheme.colors.error
                )
                androidx.compose.material3.Button(
                    onClick = {
                        scope.launch {
                            surveyService.fetchEligibleSurveys()
                        }
                    }
                ) {
                    Text("Yeniden Dene")
                }
            }
        }
    } else {
            val filtered = remember(selectedCategory, eligibleSurveys) {
                when (selectedCategory) {
                    "Tamamlanan" -> eligibleSurveys.filter { it.isCompleted }
                    "Yeni" -> eligibleSurveys.filter { !it.isCompleted && it.surveyType != "PROFILE" }
                    else -> eligibleSurveys.filter { !it.isCompleted }
                }
            }

            if (filtered.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize().padding(top = 40.dp),
                    contentAlignment = Alignment.TopCenter
                ) {
                    Text(
                        text = "Bu kategoride anket bulunmuyor.",
                        style = PAGTheme.typography.body,
                        color = PAGTheme.colors.textMuted
                    )
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(PAGTheme.spacing.md),
                    verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md)
                ) {
                    items(filtered) { survey ->
                        PAGSurveyCard(
                            survey = survey,
                            onTakeSurvey = { onNavigateToDetail(survey.surveyId) }
                        )
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
                PAGBadge(
                    title = survey.ownerDisplayName,
                    style = PAGBadgeStyle.Tag
                )
                PAGBadge(
                    title = "+${survey.profileScoreReward} Puan",
                    icon = Icons.Filled.Star,
                    style = PAGBadgeStyle.ProfileScore
                )
            }

            Text(
                text = survey.title,
                style = PAGTheme.typography.heading,
                color = PAGTheme.colors.textPrimary
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
                    text = survey.estimatedDurationText,
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.textMuted
                )

                Text(
                    text = if (survey.isCompleted) "Tamamlandı" else "Katıl",
                    style = PAGTheme.typography.bodyLarge,
                    color = if (survey.isCompleted) PAGTheme.colors.textMuted else PAGTheme.colors.brandLime
                )
            }
        }
    }
}

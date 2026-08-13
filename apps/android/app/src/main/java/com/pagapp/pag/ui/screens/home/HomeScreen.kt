package com.pagapp.pag.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.pagapp.pag.models.SurveyMock
import com.pagapp.pag.models.UserProfileMock
import com.pagapp.pag.ui.components.PAGBadge
import com.pagapp.pag.ui.components.PAGBadgeStyle
import com.pagapp.pag.ui.components.PAGCard
import com.pagapp.pag.ui.components.SurveyCard
import com.pagapp.pag.ui.screens.home.story.PAGStoryBar
import com.pagapp.pag.models.StoryItemType
import com.pagapp.pag.models.HomeRoute
import com.pagapp.pag.models.StoryMock
import com.pagapp.pag.models.StoryType
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import kotlinx.coroutines.flow.MutableStateFlow
import com.pagapp.pag.services.UserService
import com.pagapp.pag.AppState
import com.pagapp.pag.ui.theme.PAGTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    appState: AppState,
    userService: UserService? = null,
    surveyService: com.pagapp.pag.services.SurveyService = androidx.compose.runtime.remember { com.pagapp.pag.services.SurveyService() }
) {
    val pagUser by (userService?.currentUser ?: MutableStateFlow(null)).collectAsState()
    val eligibleSurveys by surveyService.eligibleSurveys.collectAsState()
    val isLoadingSurveys by surveyService.isLoading.collectAsState()
    val userProfile = UserProfileMock.sample

    androidx.compose.runtime.LaunchedEffect(Unit) {
        surveyService.fetchEligibleSurveys()
    }
    
    val storyItems = mutableListOf<StoryItemType>(StoryItemType.Home)
    val sortedStories = StoryMock.sampleList.filter { it.isActive }.sortedBy { it.position }
    storyItems.addAll(sortedStories.map { StoryItemType.Story(it) })
    
    if (appState.homeRoute == HomeRoute.EARN_PROFILE_SCORE) {
        EarnProfileScoreScreen(
            onBack = { appState.homeRoute = HomeRoute.HOME },
            modifier = modifier
        )
        return
    }

    Scaffold(
        modifier = modifier,
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(bottom = PAGTheme.spacing.md),
            verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xl)
        ) {
            item {
                PAGStoryBar(
                    items = storyItems,
                    onSelect = { item ->
                        when (item) {
                            is StoryItemType.Home -> { /* Already home */ }
                            is StoryItemType.Story -> {
                                if (item.story.type == StoryType.SURVEY && item.story.surveyId != null) {
                                    appState.navigateToSurveyFlow(item.story.surveyId)
                                } else if (item.story.type == StoryType.EARN_PROFILE_SCORE) {
                                    appState.homeRoute = HomeRoute.EARN_PROFILE_SCORE
                                }
                            }
                        }
                    }
                )
            }
            
            item {
                Box(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                    UserProfileCard(userProfile = userProfile, pagUser = pagUser)
                }
            }

            item {
                Box(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                    RealActiveSurveysSection(
                        surveys = eligibleSurveys,
                        isLoading = isLoadingSurveys,
                        onNavigateToSurvey = { id -> appState.navigateToSurvey(id) }
                    )
                }
            }
        }
    }
}

@Composable
private fun UserProfileCard(userProfile: UserProfileMock, pagUser: com.pagapp.pag.models.PAGUser? = null) {
    val greetingText = if (!pagUser?.displayName.isNullOrBlank()) {
        "Merhaba, ${pagUser?.displayName} 👋"
    } else {
        "Merhaba 👋"
    }
    val score = pagUser?.profileScore ?: 0

    PAGCard(
        modifier = Modifier.fillMaxWidth(),
        backgroundColor = PAGTheme.colors.brandMidnight,
        borderColor = PAGTheme.colors.brandMidnight,
        shape = PAGTheme.radius.xl
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md)
        ) {
            Text(
                text = greetingText,
                style = PAGTheme.typography.heading,
                color = PAGTheme.colors.textPrimary
            )

            Text(
                text = "Profil Puanı",
                style = PAGTheme.typography.body,
                color = PAGTheme.colors.textSecondary
            )

            Row(
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xs)
            ) {
                Text(
                    text = "$score",
                    style = PAGTheme.typography.display,
                    color = PAGTheme.colors.brandLime
                )
                Text(
                    text = "Puan",
                    style = PAGTheme.typography.bodyLarge,
                    color = PAGTheme.colors.textSecondary,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }

            Row(
                horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
            ) {
                PAGBadge(
                    title = userProfile.rankingAdvantageText,
                    style = PAGBadgeStyle.ProfileScore
                )
                PAGBadge(
                    title = userProfile.rankingPercentileText,
                    style = PAGBadgeStyle.Tag
                )
            }
        }
    }
}

@Composable
private fun RealActiveSurveysSection(
    surveys: List<com.pagapp.pag.models.PAGSurvey>,
    isLoading: Boolean,
    onNavigateToSurvey: (String) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = "Sana Özel Aktif Anketler",
                    style = PAGTheme.typography.title,
                    color = PAGTheme.colors.textPrimary
                )
                Text(
                    text = "Profil skorun sayesinde öncelikli erişim sağlandı",
                    style = PAGTheme.typography.bodySmall,
                    color = PAGTheme.colors.textSecondary
                )
            }
            PAGBadge(
                title = "${surveys.size} Aktif",
                style = PAGBadgeStyle.Info
            )
        }

        if (isLoading) {
            Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
                androidx.compose.material3.CircularProgressIndicator(color = PAGTheme.colors.brandLime)
            }
        } else if (surveys.isEmpty()) {
            Text(
                text = "Şu an katılabileceğiniz aktif anket bulunmuyor.",
                style = PAGTheme.typography.bodySmall,
                color = PAGTheme.colors.textMuted
            )
        } else {
            Column(
                verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
            ) {
                surveys.take(5).forEach { survey ->
                    com.pagapp.pag.ui.screens.surveys.PAGSurveyCard(
                        survey = survey,
                        onTakeSurvey = { onNavigateToSurvey(survey.surveyId) }
                    )
                }
            }
        }
    }
}

package com.alafteknoloji.pagapp.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.AppState
import com.alafteknoloji.pagapp.models.HomeRoute
import com.alafteknoloji.pagapp.models.StoryItemType
import com.alafteknoloji.pagapp.models.StoryMock
import com.alafteknoloji.pagapp.models.StoryType
import com.alafteknoloji.pagapp.models.SurveyMock
import com.alafteknoloji.pagapp.models.UserProfileMock
import com.alafteknoloji.pagapp.services.ProfileSurveyService
import com.alafteknoloji.pagapp.services.StoryService
import com.alafteknoloji.pagapp.services.SurveyService
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.services.VerificationService
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.components.PAGCard
import com.alafteknoloji.pagapp.ui.components.SurveyCard
import com.alafteknoloji.pagapp.ui.screens.home.story.PAGStoryBar
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import kotlinx.coroutines.flow.MutableStateFlow

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    appState: AppState,
    userService: UserService? = null,
    surveyService: SurveyService = remember { SurveyService() },
    storyService: StoryService = remember { StoryService() }
) {
    val context = LocalContext.current
    val profileSurveyService = remember { ProfileSurveyService.getInstance(context) }
    val verificationService = remember { VerificationService.getInstance() }

    val pagUser by (userService?.currentUser ?: MutableStateFlow(null)).collectAsState()
    val eligibleSurveys by surveyService.eligibleSurveys.collectAsState()
    val fetchedStories: List<StoryMock> by storyService.stories.collectAsState()
    val isLoadingSurveys by surveyService.isLoading.collectAsState()
    val hasPromotedQuestion by profileSurveyService.hasPromotedQuestion.collectAsState()
    val pendingVerification by verificationService.pendingVerification.collectAsState()
    val userProfile = UserProfileMock.sample

    LaunchedEffect(Unit) {
        verificationService.checkPendingVerification()
        storyService.fetchStories()
        surveyService.fetchEligibleSurveys()
        profileSurveyService.fetchProfileQuestions(3)
    }

    val storyItems = mutableListOf<StoryItemType>(StoryItemType.Home)
    val activeStoryList: List<StoryMock> = if (fetchedStories.isNotEmpty()) fetchedStories else StoryMock.sampleList
    val sortedStories = activeStoryList.filter { it.isActive }.sortedBy { it.position }
    storyItems.addAll(sortedStories.map { StoryItemType.Story(it) })

    pendingVerification?.let { pending ->
        PendingVerificationScreen(
            pending = pending,
            onDismiss = { verificationService.dismissForNow() }
        )
        return
    }

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

            // Home Promotion Card: "Profili Güçlendir" (Appears ONLY IF Basic Profile is Complete)
            val isBasicComplete = pagUser?.profileCompleted ?: false
            if (isBasicComplete && hasPromotedQuestion) {
                item {
                    Box(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(PAGTheme.colors.surfacePrimary, RoundedCornerShape(12.dp))
                                .border(1.5.dp, PAGTheme.colors.brandLime, RoundedCornerShape(12.dp))
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Puan kazanmak ister misin?",
                                    style = PAGTheme.typography.heading,
                                    color = PAGTheme.colors.textPrimary
                                )
                                Icon(
                                    imageVector = Icons.Filled.Star,
                                    contentDescription = null,
                                    tint = PAGTheme.colors.brandLime
                                )
                            }

                            Text(
                                text = "Hadi profilini güçlendirelim.",
                                style = PAGTheme.typography.body,
                                color = PAGTheme.colors.textMuted
                            )

                            Button(
                                onClick = {
                                    appState.selectedTab = 3 // Switch to Profile tab
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(44.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.brandLime),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Profili Güçlendir",
                                        color = PAGTheme.colors.brandMidnight,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                                        contentDescription = null,
                                        tint = PAGTheme.colors.brandMidnight
                                    )
                                }
                            }
                        }
                    }
                }
            }

            item {
                Box(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                    val currentRanking by (userService?.currentRanking ?: MutableStateFlow(null)).collectAsState()
                    UserProfileCard(userProfile = userProfile, pagUser = pagUser, currentRanking = currentRanking)
                }
            }

            item {
                Box(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                    Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md)) {
                        Text(
                            text = "Aktif Anketler",
                            style = PAGTheme.typography.title,
                            color = PAGTheme.colors.textPrimary
                        )

                        if (isLoadingSurveys) {
                            androidx.compose.material3.CircularProgressIndicator(color = PAGTheme.colors.brandLime)
                        } else if (eligibleSurveys.isEmpty()) {
                            Text(
                                text = "Şu an için katılabileceğiniz aktif anket bulunmuyor.",
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.textMuted
                            )
                        } else {
                            eligibleSurveys.take(5).forEach { survey ->
                                SurveyCard(
                                    survey = SurveyMock(
                                        id = survey.surveyId,
                                        title = survey.title,
                                        ownerName = survey.ownerDisplayName,
                                        description = survey.description,
                                        profileScoreReward = survey.profileScoreReward,
                                        rewardType = com.alafteknoloji.pagapp.models.RewardType.PROFILE_SCORE_ONLY,
                                        rewardAmount = null,
                                        voucherTitle = null,
                                        estimatedDurationMinutes = 2,
                                        surveyType = com.alafteknoloji.pagapp.models.SurveyType.PAG,
                                        category = com.alafteknoloji.pagapp.models.SurveyCategory.FOR_YOU,
                                        status = com.alafteknoloji.pagapp.models.SurveyStatus.ACTIVE,
                                        endDate = null,
                                        questions = emptyList()
                                    ),
                                    onTakeSurvey = { appState.navigateToSurvey(survey.surveyId) }
                                )
                            }

                            if (eligibleSurveys.isNotEmpty()) {
                                Button(
                                    onClick = { appState.selectedTab = 1 },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.surfaceSecondary),
                                    shape = RoundedCornerShape(10.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, PAGTheme.colors.borderDefault)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Tüm Bekleyen Anketleri Gör (${eligibleSurveys.size})",
                                            color = PAGTheme.colors.brandLime,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Icon(
                                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                                            contentDescription = null,
                                            tint = PAGTheme.colors.brandLime
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

private data class RankingTier(
    val title: String,
    val subtitle: String,
    val badgeBgColor: Color,
    val badgeTextColor: Color
)

private fun getRankingTier(rank: Int?, percentile: Double?): RankingTier {
    val r = rank ?: 100
    val p = percentile ?: 100.0
    return when {
        r == 1 || p <= 10.0 -> RankingTier(
            title = "En Güçlü",
            subtitle = "Avantajlı konumunu koru",
            badgeBgColor = Color(0xFFFFD700), // Standout Gold
            badgeTextColor = Color(0xFF0F172A)
        )
        p <= 50.0 -> RankingTier(
            title = "Güçlü",
            subtitle = "Yeni puan fırsatlarını kaçırma",
            badgeBgColor = Color(0xFFCCFF00), // Green (Brand Lime)
            badgeTextColor = Color(0xFF0F172A)
        )
        p <= 70.0 -> RankingTier(
            title = "Yükselişte",
            subtitle = "Biraz daha puanla öne geçebilirsin",
            badgeBgColor = Color(0xFFF97316), // Warm Amber / Orange
            badgeTextColor = Color.White
        )
        else -> RankingTier(
            title = "Gelişim Sürecinde",
            subtitle = "Profilini güçlendir, sıralamada yüksel",
            badgeBgColor = Color(0xFF38BDF8), // Sky Blue / Cyan
            badgeTextColor = Color(0xFF0F172A)
        )
    }
}

@Composable
private fun UserProfileCard(
    userProfile: UserProfileMock,
    pagUser: com.alafteknoloji.pagapp.models.PAGUser? = null,
    currentRanking: com.alafteknoloji.pagapp.services.PAGUserRanking? = null
) {
    val nameToUse = pagUser?.firstName?.trim()
    val greetingText = if (!nameToUse.isNullOrBlank()) {
        "Merhaba, $nameToUse 👋"
    } else {
        "Merhaba 👋"
    }
    val score = pagUser?.profileScore ?: 0
    val tier = getRankingTier(currentRanking?.rank, currentRanking?.percentile)

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
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
            ) {
                // Tier Badge
                Box(
                    modifier = Modifier
                        .background(tier.badgeBgColor, RoundedCornerShape(50))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = tier.title,
                        color = tier.badgeTextColor,
                        style = PAGTheme.typography.caption,
                        fontWeight = FontWeight.Bold
                    )
                }

                val rankingDetailText = if (currentRanking != null) {
                    "Sıralaman: #${currentRanking.rank} • ${currentRanking.percentileText}"
                } else {
                    userProfile.rankingPercentileText
                }

                Box(
                    modifier = Modifier
                        .background(Color(0xFF1E293B), RoundedCornerShape(50))
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(50))
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = rankingDetailText,
                        color = Color(0xFFF8FAFC),
                        style = PAGTheme.typography.caption,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Text(
                text = tier.subtitle,
                style = PAGTheme.typography.caption,
                color = PAGTheme.colors.textMuted
            )
        }
    }
}

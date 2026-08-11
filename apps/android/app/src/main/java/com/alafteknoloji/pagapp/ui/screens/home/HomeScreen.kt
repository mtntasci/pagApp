package com.alafteknoloji.pagapp.ui.screens.home

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
import com.alafteknoloji.pagapp.models.SurveyMock
import com.alafteknoloji.pagapp.models.UserProfileMock
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.components.PAGCard
import com.alafteknoloji.pagapp.ui.components.SurveyCard
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    modifier: Modifier = Modifier
) {
    val userProfile = UserProfileMock.sample
    val surveys = SurveyMock.sampleList

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Merhaba, ${userProfile.name} 👋",
                        style = PAGTheme.typography.title,
                        color = PAGTheme.colors.textPrimary
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PAGTheme.colors.backgroundPrimary
                )
            )
        },
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(PAGTheme.spacing.md),
            verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xl)
        ) {
            item {
                UserProfileCard(userProfile = userProfile)
            }

            item {
                ActiveSurveysSection(surveys = surveys)
            }
        }
    }
}

@Composable
private fun UserProfileCard(userProfile: UserProfileMock) {
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
                text = "Profil Puanı",
                style = PAGTheme.typography.body,
                color = PAGTheme.colors.textSecondary
            )

            Row(
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xs)
            ) {
                Text(
                    text = "${userProfile.profileScore}",
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
private fun ActiveSurveysSection(surveys: List<SurveyMock>) {
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

        Column(
            verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
        ) {
            surveys.forEach { survey ->
                SurveyCard(
                    survey = survey,
                    onTakeSurvey = { /* TODO Handle Survey Click */ }
                )
            }
        }
    }
}

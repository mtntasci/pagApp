package com.pagapp.pag.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pagapp.pag.models.PAGSurvey
import com.pagapp.pag.services.SurveyService
import com.pagapp.pag.ui.components.PAGBadge
import com.pagapp.pag.ui.components.PAGBadgeStyle
import com.pagapp.pag.ui.theme.PAGTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileSurveysScreen(
    surveyService: SurveyService,
    onNavigateBack: () -> Unit = {},
    onSelectSurvey: (PAGSurvey) -> Unit = {}
) {
    val surveys by surveyService.eligibleSurveys.collectAsState()
    val isLoading by surveyService.isLoading.collectAsState()

    val profileSurveys = remember(surveys) {
        surveys.filter { it.surveyType == "PROFILE" }
    }

    LaunchedEffect(Unit) {
        surveyService.fetchEligibleSurveys()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profil Anketleri", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PAGTheme.colors.backgroundPrimary)
            )
        },
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
        ) {
            if (isLoading) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator(color = PAGTheme.colors.brandLime)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Profil Anketleri Yükleniyor...", color = PAGTheme.colors.textMuted)
                }
            } else if (profileSurveys.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(PAGTheme.spacing.xl),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = null,
                        tint = PAGTheme.colors.brandLime,
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Henüz Profil Anketi Yok",
                        style = PAGTheme.typography.heading,
                        color = PAGTheme.colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Şu anda yanıtlanabilecek aktif bir profil anketi bulunmuyor.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textMuted
                    )
                }
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(PAGTheme.spacing.md),
                    verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md)
                ) {
                    profileSurveys.forEach { survey ->
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                                .border(1.dp, PAGTheme.colors.borderDefault, PAGTheme.radius.md)
                                .clickable { onSelectSurvey(survey) }
                                .padding(PAGTheme.spacing.md),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = survey.title,
                                    style = PAGTheme.typography.heading,
                                    color = PAGTheme.colors.textPrimary,
                                    modifier = Modifier.weight(1f)
                                )
                                PAGBadge(
                                    title = "+${survey.profileScoreReward} Puan",
                                    icon = Icons.Filled.Star,
                                    style = PAGBadgeStyle.ProfileScore
                                )
                            }
                            Text(
                                text = survey.description,
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.textMuted
                            )
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                if (survey.isCompleted) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = PAGTheme.colors.success, modifier = Modifier.size(16.dp))
                                        Text("Tamamlandı (Cevabı Düzenle)", color = PAGTheme.colors.success, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                    }
                                } else {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null, tint = PAGTheme.colors.brandLime, modifier = Modifier.size(16.dp))
                                        Text("Yanıtla & Kazan", color = PAGTheme.colors.brandLime, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                                    contentDescription = "Aç",
                                    tint = PAGTheme.colors.textMuted
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

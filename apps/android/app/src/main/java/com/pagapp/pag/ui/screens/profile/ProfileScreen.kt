package com.pagapp.pag.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pagapp.pag.models.PAGSurvey
import com.pagapp.pag.services.AuthService
import com.pagapp.pag.services.BasicProfileService
import com.pagapp.pag.services.SurveyService
import com.pagapp.pag.services.UserService
import com.pagapp.pag.ui.components.PAGBadge
import com.pagapp.pag.ui.components.PAGBadgeStyle
import com.pagapp.pag.ui.screens.surveys.SurveyDetailScreen
import com.pagapp.pag.ui.screens.surveys.SurveyFlowScreen
import com.pagapp.pag.ui.theme.PAGTheme

enum class ProfileSubRoute {
    MAIN,
    BASIC_PROFILE,
    PROFILE_SURVEYS,
    SURVEY_DETAIL,
    SURVEY_FLOW
}

@Composable
fun ProfileScreen(
    modifier: Modifier = Modifier,
    userService: UserService? = null,
    onNavigateToBasicProfile: (() -> Unit)? = null
) {
    val context = LocalContext.current
    val basicProfileService = remember { BasicProfileService(context) }
    val surveyService = remember { SurveyService() }

    var currentSubRoute by remember { mutableStateOf(ProfileSubRoute.MAIN) }
    var selectedSurvey by remember { mutableStateOf<PAGSurvey?>(null) }

    val authUser by AuthService.currentUser.collectAsState()
    val pagUser by (userService?.currentUser ?: kotlinx.coroutines.flow.MutableStateFlow(null)).collectAsState()
    val basicProfileState by basicProfileService.basicProfile.collectAsState()

    val displayName = pagUser?.displayName ?: authUser?.displayName ?: authUser?.email ?: "Kullanıcı"
    val email = pagUser?.email ?: authUser?.email
    val score = pagUser?.profileScore ?: 0

    val isPhoneVerified = pagUser?.phoneVerified ?: (!pagUser?.phone.isNullOrEmpty())
    val phoneStatusText = if (isPhoneVerified) "Doğrulandı" else "Doğrulanmadı"

    val isEmailVerified = pagUser?.emailVerified ?: (email != null)
    val emailStatusText = if (isEmailVerified) "Doğrulandı" else "Doğrulanmadı"

    val kycStatus = pagUser?.kycStatus ?: "NOT_STARTED"
    val kycStatusText = when (kycStatus) {
        "VERIFIED" -> "Doğrulandı"
        "PENDING" -> "İnceleniyor"
        else -> "Henüz doğrulanmadı"
    }
    val isKycVerified = kycStatus == "VERIFIED"

    val isBasicProfileComplete = basicProfileState.completionPercentage == 100 || (pagUser?.profileCompleted ?: false)

    LaunchedEffect(Unit) {
        basicProfileService.fetchBasicProfile()
    }

    when (currentSubRoute) {
        ProfileSubRoute.BASIC_PROFILE -> {
            BasicProfileScreen(
                userService = userService,
                onNavigateBack = { currentSubRoute = ProfileSubRoute.MAIN }
            )
        }
        ProfileSubRoute.PROFILE_SURVEYS -> {
            ProfileSurveysScreen(
                surveyService = surveyService,
                onNavigateBack = { currentSubRoute = ProfileSubRoute.MAIN },
                onSelectSurvey = { survey ->
                    selectedSurvey = survey
                    currentSubRoute = ProfileSubRoute.SURVEY_DETAIL
                }
            )
        }
        ProfileSubRoute.SURVEY_DETAIL -> {
            selectedSurvey?.let { survey ->
                SurveyDetailScreen(
                    surveyId = survey.surveyId,
                    onStartSurvey = { currentSubRoute = ProfileSubRoute.SURVEY_FLOW },
                    surveyService = surveyService
                )
            } ?: run {
                currentSubRoute = ProfileSubRoute.PROFILE_SURVEYS
            }
        }
        ProfileSubRoute.SURVEY_FLOW -> {
            selectedSurvey?.let { survey ->
                SurveyFlowScreen(
                    survey = survey,
                    onComplete = { currentSubRoute = ProfileSubRoute.PROFILE_SURVEYS },
                    onExit = { currentSubRoute = ProfileSubRoute.PROFILE_SURVEYS },
                    surveyService = surveyService
                )
            } ?: run {
                currentSubRoute = ProfileSubRoute.PROFILE_SURVEYS
            }
        }
        ProfileSubRoute.MAIN -> {
            Box(
                modifier = modifier
                    .fillMaxSize()
                    .background(PAGTheme.colors.backgroundPrimary)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(vertical = PAGTheme.spacing.lg)
                ) {
                    // Header
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .clip(CircleShape)
                                .background(PAGTheme.colors.brandMidnight)
                                .border(2.dp, PAGTheme.colors.brandLime, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Person,
                                contentDescription = "Avatar",
                                tint = PAGTheme.colors.brandLime,
                                modifier = Modifier.size(48.dp)
                            )
                        }

                        Text(
                            text = displayName,
                            style = PAGTheme.typography.title,
                            color = PAGTheme.colors.textPrimary
                        )

                        if (email != null && email != displayName) {
                            Text(
                                text = email,
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.textMuted
                            )
                        }

                        PAGBadge(title = "$score Profil Puanı", icon = Icons.Filled.Star, style = PAGBadgeStyle.ProfileScore)
                    }

                    Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

                    // 1. Temel Profil Card
                    Column(
                        modifier = Modifier
                            .padding(horizontal = PAGTheme.spacing.md)
                            .fillMaxWidth()
                            .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                            .border(1.dp, PAGTheme.colors.brandLime.copy(alpha = 0.3f), PAGTheme.radius.md)
                            .clickable {
                                if (onNavigateToBasicProfile != null) {
                                    onNavigateToBasicProfile()
                                } else {
                                    currentSubRoute = ProfileSubRoute.BASIC_PROFILE
                                }
                            }
                            .padding(PAGTheme.spacing.md),
                        verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xs)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Temel Profil",
                                style = PAGTheme.typography.heading,
                                color = PAGTheme.colors.textPrimary
                            )
                            Text(
                                text = "%${basicProfileState.completionPercentage} Tamamlandı",
                                style = PAGTheme.typography.caption,
                                fontWeight = FontWeight.Bold,
                                color = PAGTheme.colors.brandLime
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Doğum, medeni durum, çocuk ve adres bilgilerinizi yönetin.",
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.textMuted,
                                modifier = Modifier.weight(1f)
                            )
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                                contentDescription = "Düzenle",
                                tint = PAGTheme.colors.textMuted
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(PAGTheme.spacing.md))

                    // 2. Yeni Kart — Profilini Güçlendir (Profil Anketleri Girişi)
                    Column(
                        modifier = Modifier
                            .padding(horizontal = PAGTheme.spacing.md)
                            .fillMaxWidth()
                            .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                            .border(
                                1.dp,
                                if (isBasicProfileComplete) PAGTheme.colors.brandLime.copy(alpha = 0.5f) else PAGTheme.colors.borderDefault,
                                PAGTheme.radius.md
                            )
                            .padding(PAGTheme.spacing.md),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Profilini Güçlendir",
                                style = PAGTheme.typography.heading,
                                color = PAGTheme.colors.textPrimary
                            )
                            Icon(
                                imageVector = Icons.Filled.Star,
                                contentDescription = null,
                                tint = PAGTheme.colors.brandLime,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Text(
                            text = "Ek sorulara yanıt vererek Profil Puanı kazanabileceğinizi biliyor musunuz?",
                            style = PAGTheme.typography.body,
                            color = PAGTheme.colors.textPrimary
                        )

                        Text(
                            text = "Profil sorularını yanıtladıkça sana daha uygun anketlere erişebilir ve Profil Puanı kazanabilirsin.",
                            style = PAGTheme.typography.caption,
                            color = PAGTheme.colors.textMuted
                        )

                        if (isBasicProfileComplete) {
                            Button(
                                onClick = { currentSubRoute = ProfileSubRoute.PROFILE_SURVEYS },
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
                                        text = "Profil Sorularını Gör",
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
                        } else {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(PAGTheme.colors.surfacePrimary.copy(alpha = 0.6f), RoundedCornerShape(8.dp))
                                    .border(1.dp, PAGTheme.colors.borderDefault, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 12.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Temel profili %100 tamamladıktan sonra erişilebilir",
                                    style = PAGTheme.typography.caption,
                                    color = PAGTheme.colors.textMuted
                                )
                                Icon(
                                    imageVector = Icons.Filled.Lock,
                                    contentDescription = "Kilitli",
                                    tint = PAGTheme.colors.textMuted,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

                    // 3. Verifications (Doğrulamalar - Source of Truth)
                    Text(
                        text = "Doğrulamalar",
                        style = PAGTheme.typography.title,
                        color = PAGTheme.colors.textPrimary,
                        modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)
                    )
                    Spacer(modifier = Modifier.height(PAGTheme.spacing.sm))

                    Column(
                        modifier = Modifier
                            .padding(horizontal = PAGTheme.spacing.md)
                            .fillMaxWidth()
                            .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                    ) {
                        VerificationRow("Telefon", phoneStatusText, isPhoneVerified, true)
                        VerificationRow("E-posta", emailStatusText, isEmailVerified, true)
                        VerificationRow("Kimlik / KYC", kycStatusText, isKycVerified, false)
                    }

                    Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

                    // 4. Logout Button
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier
                            .padding(horizontal = PAGTheme.spacing.md)
                            .fillMaxWidth()
                            .height(56.dp)
                            .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                            .border(1.dp, PAGTheme.colors.error.copy(alpha = 0.3f), PAGTheme.radius.md)
                            .clickable { AuthService.signOut() }
                            .padding(horizontal = PAGTheme.spacing.md)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                                contentDescription = "Çıkış Yap",
                                tint = PAGTheme.colors.error
                            )
                            Text(
                                text = "Çıkış Yap",
                                style = PAGTheme.typography.heading,
                                color = PAGTheme.colors.error
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))
                }
            }
        }
    }
}

@Composable
private fun VerificationRow(title: String, status: String, isVerified: Boolean, showDivider: Boolean) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(PAGTheme.spacing.md),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = title, style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(text = status, style = PAGTheme.typography.body, color = if (isVerified) PAGTheme.colors.success else PAGTheme.colors.textMuted)
                if (!isVerified) {
                    Icon(imageVector = Icons.Filled.Warning, contentDescription = null, tint = PAGTheme.colors.warning, modifier = Modifier.size(16.dp))
                }
            }
        }
        if (showDivider) {
            HorizontalDivider(color = PAGTheme.colors.borderDefault, modifier = Modifier.padding(start = PAGTheme.spacing.md))
        }
    }
}

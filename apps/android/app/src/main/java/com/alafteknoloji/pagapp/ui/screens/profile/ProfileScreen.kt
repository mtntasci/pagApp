package com.alafteknoloji.pagapp.ui.screens.profile

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
import kotlinx.coroutines.launch
import com.alafteknoloji.pagapp.models.PAGSurvey
import com.alafteknoloji.pagapp.services.AuthService
import com.alafteknoloji.pagapp.services.BasicProfileService
import com.alafteknoloji.pagapp.services.ProfileSurveyService
import com.alafteknoloji.pagapp.services.SurveyService
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.screens.surveys.SurveyDetailScreen
import com.alafteknoloji.pagapp.ui.screens.surveys.SurveyFlowScreen
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

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
    val profileSurveyService = remember { ProfileSurveyService.getInstance(context) }

    var currentSubRoute by remember { mutableStateOf(ProfileSubRoute.MAIN) }
    var selectedSurvey by remember { mutableStateOf<PAGSurvey?>(null) }

    val authUser by AuthService.currentUser.collectAsState()
    val pagUser by (userService?.currentUser ?: kotlinx.coroutines.flow.MutableStateFlow(null)).collectAsState()
    val basicProfileState by basicProfileService.basicProfile.collectAsState()
    val availableScoreX by profileSurveyService.availableScoreX.collectAsState()

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
        profileSurveyService.fetchProfileQuestions(3)
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
                onBackClick = { currentSubRoute = ProfileSubRoute.MAIN }
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
                                text = "Cinsiyet, doğum, medeni durum, çocuk ve adres bilgilerinizi yönetin.",
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

                    // 2. Dynamic Profile Box — New Score Opportunity
                    Column(
                        modifier = Modifier
                            .padding(horizontal = PAGTheme.spacing.md)
                            .fillMaxWidth()
                            .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                            .border(
                                width = if (availableScoreX > 0) 2.dp else 1.dp,
                                color = if (availableScoreX > 0) PAGTheme.colors.brandLime else PAGTheme.colors.borderDefault,
                                shape = PAGTheme.radius.md
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

                        if (availableScoreX > 0) {
                            // Dynamic Title: "[$availableScoreX] Yeni Puan Avantajını Kaçırma"
                            Surface(
                                color = PAGTheme.colors.brandLime,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "[$availableScoreX] Yeni Puan Avantajını Kaçırma",
                                        color = PAGTheme.colors.brandMidnight,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 14.sp
                                    )
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                                        contentDescription = null,
                                        tint = PAGTheme.colors.brandMidnight
                                    )
                                }
                            }
                        } else {
                            Text(
                                text = "Ek sorulara yanıt vererek Profil Puanı kazanabileceğinizi biliyor musunuz?",
                                style = PAGTheme.typography.body,
                                color = PAGTheme.colors.textPrimary
                            )
                        }

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
                                    contentDescription = null,
                                    tint = PAGTheme.colors.textMuted,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(PAGTheme.spacing.md))

                    // Verification Badges — DOĞRULA & KAZAN
                    var showPhoneDialog by remember { mutableStateOf(false) }
                    var showKycDialog by remember { mutableStateOf(false) }
                    var showIbanDialog by remember { mutableStateOf(false) }

                    var phoneInput by remember { mutableStateOf(pagUser?.phone ?: "") }
                    var ibanInput by remember { mutableStateOf(pagUser?.iban ?: "") }
                    var tcknInput by remember { mutableStateOf(pagUser?.tckn ?: "") }
                    var isSubmitting by remember { mutableStateOf(false) }
                    val scope = rememberCoroutineScope()

                    val isIbanVerified = pagUser?.ibanVerified ?: (!pagUser?.iban.isNullOrEmpty())

                    Column(
                        modifier = Modifier
                            .padding(horizontal = PAGTheme.spacing.md)
                            .fillMaxWidth()
                            .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                            .border(1.dp, PAGTheme.colors.borderDefault, PAGTheme.radius.md)
                            .padding(PAGTheme.spacing.md),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Doğrula & Kazan",
                                style = PAGTheme.typography.heading,
                                color = PAGTheme.colors.textPrimary
                            )
                            PAGBadge(title = "+900 Toplam PP", style = PAGBadgeStyle.ProfileScore)
                        }

                        Text(
                            text = "Profilinizi doğrulayarak öncelikli anketlere erişin ve ekstra Profil Puanı kazanın.",
                            style = PAGTheme.typography.caption,
                            color = PAGTheme.colors.textMuted
                        )

                        // 1. Phone Verification (+200 PP)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(PAGTheme.colors.surfaceSecondary, RoundedCornerShape(8.dp))
                                .clickable(enabled = !isPhoneVerified) { showPhoneDialog = true }
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "1. Telefon Doğrulaması", style = PAGTheme.typography.body, fontWeight = FontWeight.Bold, color = PAGTheme.colors.textPrimary)
                                Text(text = "+200 Profil Puanı Kazan", style = PAGTheme.typography.caption, color = PAGTheme.colors.brandLime)
                            }
                            Text(
                                text = if (isPhoneVerified) "✅ Doğrulandı (+200 PP)" else "Doğrula →",
                                style = PAGTheme.typography.caption,
                                fontWeight = FontWeight.Bold,
                                color = if (isPhoneVerified) PAGTheme.colors.brandLime else Color(0xFFF59E0B)
                            )
                        }

                        // 2. KYC Verification (+500 PP)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(PAGTheme.colors.surfaceSecondary, RoundedCornerShape(8.dp))
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "2. Kimlik Doğrulaması (KYC)", style = PAGTheme.typography.body, fontWeight = FontWeight.Bold, color = PAGTheme.colors.textPrimary)
                                Text(text = "+500 Profil Puanı Kazan", style = PAGTheme.typography.caption, color = PAGTheme.colors.brandLime)
                            }
                            Text(
                                text = if (isKycVerified) "✅ Doğrulandı (+500 PP)" else "Yakında 🔒",
                                style = PAGTheme.typography.caption,
                                fontWeight = FontWeight.Bold,
                                color = if (isKycVerified) PAGTheme.colors.brandLime else PAGTheme.colors.textMuted
                            )
                        }

                        // 3. IBAN Verification (+200 PP)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(PAGTheme.colors.surfaceSecondary, RoundedCornerShape(8.dp))
                                .clickable(enabled = !isIbanVerified) { showIbanDialog = true }
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "3. IBAN Doğrulama", style = PAGTheme.typography.body, fontWeight = FontWeight.Bold, color = PAGTheme.colors.textPrimary)
                                Text(text = "+200 Profil Puanı Kazan", style = PAGTheme.typography.caption, color = PAGTheme.colors.brandLime)
                            }
                            Text(
                                text = if (isIbanVerified) "✅ Doğrulandı (+200 PP)" else "IBAN Doğrula →",
                                style = PAGTheme.typography.caption,
                                fontWeight = FontWeight.Bold,
                                color = if (isIbanVerified) PAGTheme.colors.brandLime else Color(0xFFF59E0B)
                            )
                        }
                    }

                    // Dialogs
                    if (showPhoneDialog) {
                        PhoneVerificationDialog(
                            initialPhone = phoneInput,
                            userService = userService,
                            onDismiss = { showPhoneDialog = false },
                            onSuccess = {
                                scope.launch {
                                    userService?.bootstrapCurrentUser()
                                }
                            }
                        )
                    }

                    if (showIbanDialog) {
                        AlertDialog(
                            onDismissRequest = { showIbanDialog = false },
                            title = { Text("IBAN Doğrulama (+200 PP)", color = PAGTheme.colors.textPrimary, fontWeight = FontWeight.Bold) },
                            text = {
                                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text("Nakit ödül transferleri için TC Kimlik No ve IBAN bilgilerinizi giriniz.", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted)
                                    OutlinedTextField(
                                        value = tcknInput,
                                        onValueChange = { if (it.length <= 11) tcknInput = it.filter { c -> c.isDigit() } },
                                        label = { Text("TC Kimlik No (11 Hane)") },
                                        singleLine = true,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                    OutlinedTextField(
                                        value = ibanInput,
                                        onValueChange = { ibanInput = it },
                                        label = { Text("IBAN (TR...)") },
                                        singleLine = true,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }
                            },
                            confirmButton = {
                                Button(
                                    onClick = {
                                        scope.launch {
                                            isSubmitting = true
                                            userService?.submitIbanAndTckn(ibanInput, tcknInput)
                                            isSubmitting = false
                                            showIbanDialog = false
                                        }
                                    },
                                    enabled = !isSubmitting && tcknInput.length == 11 && ibanInput.length > 15,
                                    colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.brandLime)
                                ) {
                                    Text("IBAN Doğrula & +200 PP Kazan", color = PAGTheme.colors.brandMidnight, fontWeight = FontWeight.Bold)
                                }
                            },
                            dismissButton = {
                                TextButton(onClick = { showIbanDialog = false }) {
                                    Text("Vazgeç", color = Color.White)
                                }
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(PAGTheme.spacing.lg))

                    // Sign Out Button
                    Button(
                        onClick = { AuthService.signOut() },
                        modifier = Modifier
                            .padding(horizontal = PAGTheme.spacing.md)
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.surfacePrimary),
                        shape = PAGTheme.radius.md
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                                contentDescription = null,
                                tint = Color.Red
                            )
                            Text(text = "Çıkış Yap", color = Color.Red, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(PAGTheme.spacing.sm))

                    // Dark Red Passive Clear Data Button
                    Button(
                        onClick = {},
                        enabled = false,
                        modifier = Modifier
                            .padding(horizontal = PAGTheme.spacing.md)
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF450A0A),
                            disabledContainerColor = Color(0xFF450A0A).copy(alpha = 0.5f)
                        ),
                        shape = PAGTheme.radius.md
                    ) {
                        Text(text = "Çıkış Yap ve Verilerimi Temizle", color = Color.Red.copy(alpha = 0.6f))
                    }
                }
            }
        }
    }
}

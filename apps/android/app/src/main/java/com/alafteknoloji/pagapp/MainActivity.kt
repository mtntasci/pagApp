package com.alafteknoloji.pagapp

import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.alafteknoloji.pagapp.models.HomeRoute
import com.alafteknoloji.pagapp.services.AuthService
import com.alafteknoloji.pagapp.services.PAGApiClient
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.ui.screens.auth.LoginScreen
import com.alafteknoloji.pagapp.ui.screens.auth.SplashScreen
import com.alafteknoloji.pagapp.ui.screens.home.HomeScreen
import com.alafteknoloji.pagapp.ui.screens.profile.ProfileScreen
import com.alafteknoloji.pagapp.ui.screens.rewards.RewardsScreen
import com.alafteknoloji.pagapp.ui.screens.surveys.SurveyRoute
import com.alafteknoloji.pagapp.ui.screens.surveys.SurveysTab
import com.alafteknoloji.pagapp.ui.theme.PAGAppTheme
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PAGAppTheme {
                val appState = remember { AppState() }
                val userService = remember { UserService(applicationContext) }
                val isAuthenticated by AuthService.isAuthenticated.collectAsState()
                val currentUser by userService.currentUser.collectAsState()
                val isBootstrapping by userService.isBootstrapping.collectAsState()
                val bootstrapError by userService.bootstrapError.collectAsState()
                var showSplash by remember { mutableStateOf(true) }
                val scope = rememberCoroutineScope()

                LaunchedEffect(isAuthenticated) {
                    if (isAuthenticated) {
                        userService.bootstrapCurrentUser()
                    } else {
                        userService.clearUserSession()
                    }
                }

                if (showSplash || (isAuthenticated && currentUser == null && isBootstrapping)) {
                    SplashScreen(onSplashFinished = { showSplash = false })
                } else if (!isAuthenticated) {
                    LoginScreen(activity = this)
                } else if (bootstrapError != null && currentUser == null) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(PAGTheme.colors.backgroundPrimary)
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = bootstrapError ?: "",
                            style = PAGTheme.typography.body,
                            color = PAGTheme.colors.error,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = {
                                scope.launch {
                                    userService.bootstrapCurrentUser()
                                }
                            }
                        ) {
                            Text("Yeniden Dene")
                        }
                    }
                } else if (currentUser?.isUnderage == true || currentUser?.underageBlocked == true) {
                    com.alafteknoloji.pagapp.ui.screens.legal.UnderageBlockedScreen(userService = userService)
                } else {
                    MainScreen(appState, userService)
                }
            }
        }
    }
}

data class TabItem(
    val title: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val content: @Composable () -> Unit
)

class AppState {
    var selectedTab by mutableIntStateOf(0)
    var homeRoute by mutableStateOf(HomeRoute.HOME)
    var selectedStoryId by mutableStateOf<String?>(null)
    var surveyRoute by mutableStateOf(SurveyRoute.LIST)
    var selectedSurveyId by mutableStateOf<String?>(null)

    fun navigateToStory(storyId: String) {
        selectedStoryId = storyId
    }

    fun goBackToFeed() {
        homeRoute = HomeRoute.HOME
        selectedStoryId = null
    }

    fun navigateToSurvey(surveyId: String) {
        selectedSurveyId = surveyId
        surveyRoute = SurveyRoute.DETAIL
    }

    fun navigateToSurveyFlow(surveyId: String) {
        selectedSurveyId = surveyId
        surveyRoute = SurveyRoute.DETAIL
        selectedTab = 1
    }

    fun goBackToSurveys() {
        surveyRoute = SurveyRoute.LIST
        selectedSurveyId = null
    }

    fun navigateToSurveysTab() {
        surveyRoute = SurveyRoute.LIST
        selectedSurveyId = null
        selectedTab = 1
    }
}

@Composable
fun MainScreen(appState: AppState, userService: UserService? = null) {
    val scope = rememberCoroutineScope()
    var showPushDialog by remember { mutableStateOf(false) }
    var showLocationDialog by remember { mutableStateOf(false) }
    var showCelebrationToast by remember { mutableStateOf(false) }
    var celebrationMessage by remember { mutableStateOf("") }

    // Permission Launchers
    val notificationLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { _ ->
            showPushDialog = false
            scope.launch {
                delay(400)
                showLocationDialog = true
            }
        }
    )

    val locationLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { permissions ->
            showLocationDialog = false
            val granted = permissions.values.any { it }
            if (granted) {
                scope.launch {
                    try {
                        val apiRes = PAGApiClient.post("/permissions/location", JSONObject())
                        if (apiRes?.optBoolean("success") == true) {
                            val dataObj = apiRes.optJSONObject("data")
                            val scoreAwarded = dataObj?.optInt("scoreAwarded", 0) ?: 0
                            if (scoreAwarded > 0) {
                                userService?.bootstrapCurrentUser()
                                celebrationMessage = "Tebrikler! +100 Profil Puanı Hesabınıza Eklendi 🎉"
                                showCelebrationToast = true
                                delay(3500)
                                showCelebrationToast = false
                            }
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }
    )

    LaunchedEffect(Unit) {
        delay(1000)
        showPushDialog = true
    }

    val tabs = listOf(
        TabItem("Ana Sayfa", Icons.Filled.Home) { 
            HomeScreen(
                modifier = Modifier.fillMaxSize(),
                appState = appState,
                userService = userService
            ) 
        },
        TabItem("Anketler", Icons.AutoMirrored.Filled.List) { 
            SurveysTab(
                modifier = Modifier.fillMaxSize(),
                currentRoute = appState.surveyRoute,
                selectedSurveyId = appState.selectedSurveyId,
                onRouteChanged = { route -> appState.surveyRoute = route },
                onSurveySelected = { id -> appState.selectedSurveyId = id },
                onNavigateToHome = { 
                    appState.goBackToSurveys()
                    appState.selectedTab = 0 
                },
                userService = userService
            ) 
        },
        TabItem("Ödüller", Icons.Filled.Star) { RewardsScreen(modifier = Modifier.fillMaxSize()) },
        TabItem("Profil", Icons.Filled.Person) { ProfileScreen(modifier = Modifier.fillMaxSize(), userService = userService) }
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = PAGTheme.colors.surfacePrimary,
                contentColor = PAGTheme.colors.textSecondary
            ) {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        icon = { Icon(tab.icon, contentDescription = tab.title) },
                        label = { Text(tab.title, style = PAGTheme.typography.caption) },
                        selected = appState.selectedTab == index,
                        onClick = { appState.selectedTab = index },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PAGTheme.colors.brandLime,
                            selectedTextColor = PAGTheme.colors.brandLime,
                            indicatorColor = PAGTheme.colors.brandMidnight,
                            unselectedIconColor = PAGTheme.colors.textSecondary,
                            unselectedTextColor = PAGTheme.colors.textSecondary
                        )
                    )
                }
            }
        },
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
        ) {
            tabs[appState.selectedTab].content()

            // 1. Push Notification Permission Dialog
            if (showPushDialog) {
                OnboardingPermissionDialog(
                    icon = Icons.Default.Notifications,
                    iconColor = PAGTheme.colors.brandLime,
                    title = "Anlık Bildirimler",
                    description = "Anlık Bildirimler Nakit, Hediye Çeki ve daha bir çok ödül kazanmanıza yardımcı olacak. Açmak ister misiniz?",
                    confirmText = "Evet, Bildirimleri Aç",
                    cancelText = "Şimdi Değil",
                    onConfirm = {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            notificationLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                        } else {
                            showPushDialog = false
                            scope.launch {
                                delay(400)
                                showLocationDialog = true
                            }
                        }
                    },
                    onDismiss = {
                        showPushDialog = false
                        scope.launch {
                            delay(400)
                            showLocationDialog = true
                        }
                    }
                )
            }

            // 2. Location Permission Dialog (+100 Puan)
            if (showLocationDialog) {
                OnboardingPermissionDialog(
                    icon = Icons.Default.LocationOn,
                    iconColor = PAGTheme.colors.brandLime,
                    badgeText = "+100 Profil Puanı",
                    title = "Konum Paylaşımı",
                    description = "Konumunuzu paylaşmak size ilk Profil Puanınızı kazandıracak. Onaylıyor musunuz?",
                    confirmText = "Evet, Konumu Paylaş (+100 Puan)",
                    cancelText = "Daha Sonra",
                    onConfirm = {
                        locationLauncher.launch(
                            arrayOf(
                                android.Manifest.permission.ACCESS_FINE_LOCATION,
                                android.Manifest.permission.ACCESS_COARSE_LOCATION
                            )
                        )
                    },
                    onDismiss = {
                        showLocationDialog = false
                    }
                )
            }

            // 3. Score Celebration Toast
            AnimatedVisibility(
                visible = showCelebrationToast,
                enter = fadeIn() + scaleIn(),
                exit = fadeOut() + scaleOut(),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 24.dp)
            ) {
                Surface(
                    color = PAGTheme.colors.surfacePrimary,
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, PAGTheme.colors.brandLime),
                    shadowElevation = 12.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = PAGTheme.colors.brandLime,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = celebrationMessage,
                            style = PAGTheme.typography.body,
                            fontWeight = FontWeight.Bold,
                            color = PAGTheme.colors.textPrimary
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun OnboardingPermissionDialog(
    icon: ImageVector,
    iconColor: Color,
    badgeText: String? = null,
    title: String,
    description: String,
    confirmText: String,
    cancelText: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.7f))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(22.dp))
                    .background(PAGTheme.colors.surfacePrimary)
                    .border(1.dp, PAGTheme.colors.borderDefault, RoundedCornerShape(22.dp))
                    .padding(26.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(18.dp)
            ) {
                Box(
                    modifier = Modifier.size(70.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                            .background(iconColor.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            tint = iconColor,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    if (badgeText != null) {
                        Surface(
                            color = PAGTheme.colors.brandLime,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.align(Alignment.TopEnd)
                        ) {
                            Text(
                                text = badgeText,
                                color = PAGTheme.colors.brandMidnight,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                Text(
                    text = title,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = PAGTheme.colors.textPrimary
                )

                Text(
                    text = description,
                    style = PAGTheme.typography.body,
                    color = PAGTheme.colors.textSecondary,
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp
                )

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onConfirm,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PAGTheme.colors.brandLime,
                            contentColor = PAGTheme.colors.brandMidnight
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                    ) {
                        Text(
                            text = confirmText,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = cancelText,
                            color = PAGTheme.colors.textSecondary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}

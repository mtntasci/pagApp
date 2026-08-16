package com.alafteknoloji.pagapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.alafteknoloji.pagapp.ui.screens.surveys.SurveyRoute
import androidx.compose.runtime.mutableStateOf
import com.alafteknoloji.pagapp.ui.screens.home.HomeScreen
import com.alafteknoloji.pagapp.ui.screens.profile.ProfileScreen
import com.alafteknoloji.pagapp.ui.screens.rewards.RewardsScreen
import com.alafteknoloji.pagapp.models.HomeRoute
import com.alafteknoloji.pagapp.ui.screens.surveys.SurveysTab
import com.alafteknoloji.pagapp.ui.screens.auth.SplashScreen
import com.alafteknoloji.pagapp.ui.screens.auth.LoginScreen
import com.alafteknoloji.pagapp.ui.theme.PAGAppTheme
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

import androidx.compose.runtime.collectAsState
import com.alafteknoloji.pagapp.services.AuthService

import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import com.alafteknoloji.pagapp.services.UserService

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
                } else if (currentUser?.legalConsentRequired == true) {
                    com.alafteknoloji.pagapp.ui.screens.legal.ConsentGateScreen(userService = userService)
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
    var surveyRoute by mutableStateOf(SurveyRoute.LIST)
    var selectedSurveyId by mutableStateOf<String?>(null)
    var isAuthenticated by mutableStateOf(false)
    var showSplash by mutableStateOf(true)
    var homeRoute by mutableStateOf(HomeRoute.HOME)
    
    fun navigateToSurvey(id: String) {
        selectedSurveyId = id
        surveyRoute = SurveyRoute.DETAIL
        selectedTab = 1
    }
    
    fun goBackToSurveys() {
        surveyRoute = SurveyRoute.LIST
    }
    
    fun navigateToSurveyFlow(id: String) {
        selectedSurveyId = id
        surveyRoute = SurveyRoute.FLOW
        selectedTab = 1
    }
}

@Composable
fun MainScreen(appState: AppState, userService: UserService? = null) {
    
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
        androidx.compose.foundation.layout.Box(
            modifier = Modifier.padding(innerPadding).fillMaxSize()
        ) {
            tabs[appState.selectedTab].content()
        }
    }
}

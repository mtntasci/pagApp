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
import com.alafteknoloji.pagapp.ui.screens.home.HomeScreen
import com.alafteknoloji.pagapp.ui.screens.profile.ProfileScreen
import com.alafteknoloji.pagapp.ui.screens.rewards.RewardsScreen
import com.alafteknoloji.pagapp.ui.screens.surveys.SurveysTab
import com.alafteknoloji.pagapp.ui.theme.PAGAppTheme
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PAGAppTheme {
                MainScreen()
            }
        }
    }
}

data class TabItem(
    val title: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val content: @Composable () -> Unit
)

@Composable
fun MainScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }
    
    val tabs = listOf(
        TabItem("Ana Sayfa", Icons.Filled.Home) { HomeScreen(modifier = Modifier.fillMaxSize()) },
        TabItem("Anketler", Icons.AutoMirrored.Filled.List) { SurveysTab(modifier = Modifier.fillMaxSize()) },
        TabItem("Ödüller", Icons.Filled.Star) { RewardsScreen(modifier = Modifier.fillMaxSize()) },

        TabItem("Profil", Icons.Filled.Person) { ProfileScreen(modifier = Modifier.fillMaxSize()) }
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
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
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
            tabs[selectedTab].content()
        }
    }
}

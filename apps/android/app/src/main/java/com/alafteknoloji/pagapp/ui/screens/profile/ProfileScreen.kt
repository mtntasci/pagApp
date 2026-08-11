package com.alafteknoloji.pagapp.ui.screens.profile

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun ProfileScreen(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "Profil (Yapım Aşamasında)",
            style = PAGTheme.typography.title,
            color = PAGTheme.colors.textSecondary
        )
    }
}

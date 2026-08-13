package com.alafteknoloji.pagapp.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EarnProfileScoreScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text("Profil Puanı Kazan", style = PAGTheme.typography.title) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Geri",
                            tint = PAGTheme.colors.textPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PAGTheme.colors.backgroundPrimary,
                    titleContentColor = PAGTheme.colors.textPrimary
                )
            )
        },
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(PAGTheme.spacing.lg)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Icon
                Box(
                    modifier = Modifier
                        .size(96.dp)
                        .background(PAGTheme.colors.surfacePrimary, CircleShape)
                        .border(2.dp, PAGTheme.colors.brandLime, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.PlayArrow,
                        contentDescription = null,
                        tint = PAGTheme.colors.brandLime,
                        modifier = Modifier.size(48.dp)
                    )
                }
                
                Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))
                
                Text(
                    text = "Video İzle, Profil Puanı Kazan",
                    style = PAGTheme.typography.display,
                    color = PAGTheme.colors.textPrimary,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(PAGTheme.spacing.md))
                
                Text(
                    text = "Profil Puanını artırarak yeni anketlerde daha öncelikli olabilirsin.",
                    style = PAGTheme.typography.body,
                    color = PAGTheme.colors.textSecondary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)
                )
            }
            
            // Mock CTA Button
            Button(
                onClick = { /* Demo only */ },
                enabled = false,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(bottom = PAGTheme.spacing.xl),
                colors = ButtonDefaults.buttonColors(
                    disabledContainerColor = PAGTheme.colors.surfaceSecondary,
                    disabledContentColor = PAGTheme.colors.textMuted
                ),
                shape = PAGTheme.radius.md
            ) {
                Icon(Icons.Filled.PlayArrow, contentDescription = null)
                Spacer(modifier = Modifier.width(PAGTheme.spacing.xs))
                Text("Video İzle (Demo)", style = PAGTheme.typography.heading)
            }
        }
    }
}

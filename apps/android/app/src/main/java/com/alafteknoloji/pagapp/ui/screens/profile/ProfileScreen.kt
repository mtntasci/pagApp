package com.alafteknoloji.pagapp.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun ProfileScreen(modifier: Modifier = Modifier) {
    var notificationsEnabled by remember { mutableStateOf(false) }

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
                Icon(
                    imageVector = Icons.Rounded.Person,
                    contentDescription = null,
                    tint = PAGTheme.colors.brandMidnight,
                    modifier = Modifier.size(80.dp)
                )
                Text(
                    text = "Ali Yılmaz",
                    style = PAGTheme.typography.title,
                    color = PAGTheme.colors.textPrimary
                )
                PAGBadge(title = "1.250 Profil Puanı", icon = Icons.Filled.Warning, style = PAGBadgeStyle.ProfileScore)
            }

            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

            // Notification Permission
            Column(
                modifier = Modifier
                    .padding(horizontal = PAGTheme.spacing.md)
                    .fillMaxWidth()
                    .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                    .padding(PAGTheme.spacing.md),
                verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Bildirim İzinleri",
                        style = PAGTheme.typography.heading,
                        color = PAGTheme.colors.textPrimary
                    )
                    Switch(
                        checked = notificationsEnabled,
                        onCheckedChange = { notificationsEnabled = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = PAGTheme.colors.brandLime)
                    )
                }
                if (!notificationsEnabled) {
                    Text(
                        text = "Bildirimler kapalıysa yeni ve yüksek ödüllü anketlerden zamanında haberdar olamayabilirsin.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textMuted
                    )
                }
            }

            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

            // Verifications
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
                VerificationRow("Telefon", "Doğrulandı", true, true)
                VerificationRow("E-posta", "Doğrulanmadı", false, true)
                VerificationRow("Kimlik / KYC", "Henüz yapılmadı", false, false)
            }

            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

            // Profile Surveys Section
            Text(
                text = "Profil Anketleri",
                style = PAGTheme.typography.title,
                color = PAGTheme.colors.textPrimary,
                modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)
            )
            Spacer(modifier = Modifier.height(PAGTheme.spacing.sm))
            
            Column(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                Text(
                    text = "Sana özel anketleri yakalamak için profilini güncel tut. Verdiğin yanıtları istediğin zaman değiştirebilirsin.",
                    style = PAGTheme.typography.body,
                    color = PAGTheme.colors.textSecondary
                )
                Spacer(modifier = Modifier.height(PAGTheme.spacing.md))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PAGTheme.colors.surfaceSecondary, PAGTheme.radius.md)
                        .padding(PAGTheme.spacing.md),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Profil Anketlerimi Gör", style = PAGTheme.typography.heading, color = PAGTheme.colors.brandBlue)
                    Icon(imageVector = Icons.Filled.Warning, contentDescription = null, tint = PAGTheme.colors.textMuted) // Right arrow placeholder
                }
            }
            
            Spacer(modifier = Modifier.height(40.dp))
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
            Divider(color = PAGTheme.colors.borderDefault, modifier = Modifier.padding(start = PAGTheme.spacing.md))
        }
    }
}

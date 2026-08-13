package com.alafteknoloji.pagapp.ui.screens.rewards

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.services.PAGScoreLedgerEntry
import com.alafteknoloji.pagapp.services.RewardService
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.components.PAGButton
import com.alafteknoloji.pagapp.ui.components.PAGButtonStyle
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun RewardsScreen(
    modifier: Modifier = Modifier,
    rewardService: RewardService = remember { RewardService() }
) {
    val rewardBalance by rewardService.rewardBalance.collectAsState()
    val profileScore by rewardService.profileScore.collectAsState()
    val rewardLedgers by rewardService.rewardLedgers.collectAsState()
    val vouchers by rewardService.vouchers.collectAsState()
    val scoreLedgers by rewardService.scoreLedgers.collectAsState()
    val isLoading by rewardService.isLoading.collectAsState()

    // Accordions default closed states
    var isRewardsExpanded by remember { mutableStateOf(false) }
    var isVouchersExpanded by remember { mutableStateOf(false) }
    var isScoreHistoryExpanded by remember { mutableStateOf(false) } // Default closed as requested

    LaunchedEffect(Unit) {
        rewardService.fetchUserRewards()
    }

    fun displayReason(reason: String): String {
        return if (reason == "Temel Profil Tamamlama Ödülü") "Tamamlama Ödülü" else reason
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.backgroundPrimary)
    ) {
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PAGTheme.colors.brandLime)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(vertical = PAGTheme.spacing.lg)
            ) {
                // Top Balance Summary Area
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = PAGTheme.spacing.md),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Monetary Balance Box
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .background(PAGTheme.colors.surfacePrimary, RoundedCornerShape(12.dp))
                            .border(1.dp, PAGTheme.colors.brandLime.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(text = "Ödül Bakiyen", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted)
                        Text(text = "₺$rewardBalance", style = PAGTheme.typography.display, color = PAGTheme.colors.brandLime)
                    }

                    // Profile Score Box
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .background(PAGTheme.colors.surfacePrimary, RoundedCornerShape(12.dp))
                            .border(1.dp, Color(0xFFA855F7).copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(text = "Profil Puanın", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted)
                        Text(text = "$profileScore", style = PAGTheme.typography.display, color = Color(0xFFA855F7))
                    }
                }

                Spacer(modifier = Modifier.height(PAGTheme.spacing.md))

                // Withdrawal CTA
                Box(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md).alpha(0.5f)) {
                    PAGButton(
                        title = "Para Çek (Yakında)",
                        icon = Icons.Filled.Info,
                        style = PAGButtonStyle.Secondary,
                        enabled = false,
                        onClick = {}
                    )
                }

                Spacer(modifier = Modifier.height(PAGTheme.spacing.lg))
                Divider(color = PAGTheme.colors.borderDefault)
                Spacer(modifier = Modifier.height(PAGTheme.spacing.lg))

                // ==================================================
                // 1. KAZANILAN ÖDÜLLER ACCORDION (Varsayılan Kapalı)
                // ==================================================
                Column(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                    Surface(
                        color = PAGTheme.colors.surfacePrimary,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isRewardsExpanded = !isRewardsExpanded }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "Kazanılan Ödüller", style = PAGTheme.typography.heading, color = PAGTheme.colors.textPrimary)
                                Text(text = "${rewardLedgers.size} Kayıt", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted)
                            }
                            Icon(
                                imageVector = if (isRewardsExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                                contentDescription = null,
                                tint = PAGTheme.colors.textMuted
                            )
                        }
                    }

                    AnimatedVisibility(visible = isRewardsExpanded) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (rewardLedgers.isEmpty()) {
                                Text(text = "Henüz kazanılmış bir finansal ödül bulunmuyor.", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted, modifier = Modifier.padding(8.dp))
                            } else {
                                rewardLedgers.take(5).forEach { history ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(PAGTheme.colors.surfaceSecondary, RoundedCornerShape(8.dp))
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = displayReason(history.reason),
                                                style = PAGTheme.typography.heading,
                                                color = PAGTheme.colors.textPrimary,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Text(text = history.createdAt, style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted)
                                        }
                                        Text(text = history.formattedAmount, style = PAGTheme.typography.heading, color = PAGTheme.colors.brandLime)
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // ==================================================
                // 2. HEDİYE ÇEKLERİ ACCORDION (Varsayılan Kapalı)
                // ==================================================
                Column(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                    Surface(
                        color = PAGTheme.colors.surfacePrimary,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isVouchersExpanded = !isVouchersExpanded }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "Hediye Çekleri", style = PAGTheme.typography.heading, color = PAGTheme.colors.textPrimary)
                                Text(text = "${vouchers.size} Aktif Çek", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted)
                            }
                            Icon(
                                imageVector = if (isVouchersExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                                contentDescription = null,
                                tint = PAGTheme.colors.textMuted
                            )
                        }
                    }

                    AnimatedVisibility(visible = isVouchersExpanded) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (vouchers.isEmpty()) {
                                Text(text = "Henüz tanımlı hediye çekiniz bulunmuyor.", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted, modifier = Modifier.padding(8.dp))
                            } else {
                                vouchers.take(5).forEach { voucher ->
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(PAGTheme.colors.surfaceSecondary, RoundedCornerShape(8.dp))
                                            .padding(12.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            PAGBadge(title = voucher.title, icon = Icons.Filled.Star, style = PAGBadgeStyle.Tag)
                                            Text(text = if (voucher.status == "ASSIGNED") "Aktif" else voucher.status, style = PAGTheme.typography.caption, color = PAGTheme.colors.success)
                                        }
                                        Text(text = "${voucher.valueAmount} TL Hediye Çeki", style = PAGTheme.typography.heading, color = PAGTheme.colors.textPrimary)
                                        Text(text = "KOD: ${voucher.code}", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.brandLime)
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // ==================================================
                // 3. PROFİL PUANLARI ACCORDION (Varsayılan Kapalı)
                // ==================================================
                Column(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)) {
                    Surface(
                        color = PAGTheme.colors.surfacePrimary,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isScoreHistoryExpanded = !isScoreHistoryExpanded }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "Profil Puanları Geçmişi", style = PAGTheme.typography.heading, color = PAGTheme.colors.textPrimary)
                                Text(text = "${scoreLedgers.size} Kayıt", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted)
                            }
                            Icon(
                                imageVector = if (isScoreHistoryExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                                contentDescription = null,
                                tint = PAGTheme.colors.textMuted
                            )
                        }
                    }

                    AnimatedVisibility(visible = isScoreHistoryExpanded) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (scoreLedgers.isEmpty()) {
                                Text(text = "Henüz kazanılmış Profil Puanı kaydı bulunmuyor.", style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted, modifier = Modifier.padding(8.dp))
                            } else {
                                scoreLedgers.take(5).forEach { entry ->
                                    ScoreRowItem(entry = entry, displayReason = ::displayReason)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

@Composable
fun ScoreRowItem(
    entry: PAGScoreLedgerEntry,
    displayReason: (String) -> String
) {
    val (badgeText, badgeColor) = when (entry.sourceType.uppercase()) {
        "VIDEO" -> "VİDEO ÖDÜLÜ" to Color(0xFFA855F7) // Purple
        "PROFILE" -> "PROFİL ANKETİ" to Color(0xFFF97316) // Amber/Orange
        "SURVEY" -> "ANKET" to Color(0xFF3B82F6) // Blue
        else -> "TEMEL PROFİL" to Color(0xFF10B981) // Green
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(PAGTheme.colors.surfaceSecondary, RoundedCornerShape(8.dp))
            .padding(12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Surface(
                color = badgeColor.copy(alpha = 0.15f),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = badgeText,
                    color = badgeColor,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = displayReason(entry.reason),
                style = PAGTheme.typography.heading,
                color = PAGTheme.colors.textPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(text = entry.createdAt, style = PAGTheme.typography.caption, color = PAGTheme.colors.textMuted)
        }

        Text(text = "+${entry.amount}", style = PAGTheme.typography.heading, color = badgeColor)
    }
}

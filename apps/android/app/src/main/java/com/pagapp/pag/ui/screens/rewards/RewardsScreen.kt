package com.pagapp.pag.ui.screens.rewards

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.unit.dp
import com.pagapp.pag.services.RewardService
import com.pagapp.pag.ui.components.PAGBadge
import com.pagapp.pag.ui.components.PAGBadgeStyle
import com.pagapp.pag.ui.components.PAGButton
import com.pagapp.pag.ui.components.PAGButtonStyle
import com.pagapp.pag.ui.theme.PAGTheme

@Composable
fun RewardsScreen(
    modifier: Modifier = Modifier,
    rewardService: RewardService = remember { RewardService() }
) {
    val rewardBalance by rewardService.rewardBalance.collectAsState()
    val rewardLedgers by rewardService.rewardLedgers.collectAsState()
    val vouchers by rewardService.vouchers.collectAsState()
    val isLoading by rewardService.isLoading.collectAsState()

    LaunchedEffect(Unit) {
        rewardService.fetchUserRewards()
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
                // Top Balance Area
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Ödül Bakiyen",
                        style = PAGTheme.typography.bodyLarge,
                        color = PAGTheme.colors.textSecondary
                    )
                    Text(
                        text = "₺$rewardBalance",
                        style = PAGTheme.typography.display,
                        color = PAGTheme.colors.brandLime
                    )
                }

                Spacer(modifier = Modifier.height(PAGTheme.spacing.lg))

                // Withdrawal Foundation CTA (Disabled as instructed)
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

                // History Section
                Text(
                    text = "Kazanılan Ödüller",
                    style = PAGTheme.typography.title,
                    color = PAGTheme.colors.textPrimary,
                    modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)
                )
                Spacer(modifier = Modifier.height(PAGTheme.spacing.sm))

                Column(
                    modifier = Modifier.padding(horizontal = PAGTheme.spacing.md),
                    verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
                ) {
                    if (rewardLedgers.isEmpty()) {
                        Text(
                            text = "Henüz finansal ödül geçmişiniz bulunmuyor.",
                            style = PAGTheme.typography.bodySmall,
                            color = PAGTheme.colors.textMuted
                        )
                    } else {
                        rewardLedgers.forEach { history ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                                    .padding(PAGTheme.spacing.md),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(text = history.reason, style = PAGTheme.typography.heading, color = PAGTheme.colors.textPrimary)
                                    Text(text = history.createdAt, style = PAGTheme.typography.bodySmall, color = PAGTheme.colors.textMuted)
                                }
                                Text(
                                    text = history.formattedAmount,
                                    style = PAGTheme.typography.heading,
                                    color = if (history.type == "VOUCHER") PAGTheme.colors.warning else PAGTheme.colors.brandLime
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(PAGTheme.spacing.lg))
                Divider(color = PAGTheme.colors.borderDefault)
                Spacer(modifier = Modifier.height(PAGTheme.spacing.lg))

                // Vouchers Section
                Text(
                    text = "Hediye Çekleri",
                    style = PAGTheme.typography.title,
                    color = PAGTheme.colors.textPrimary,
                    modifier = Modifier.padding(horizontal = PAGTheme.spacing.md)
                )
                Spacer(modifier = Modifier.height(PAGTheme.spacing.sm))

                Column(
                    modifier = Modifier.padding(horizontal = PAGTheme.spacing.md),
                    verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
                ) {
                    if (vouchers.isEmpty()) {
                        Text(
                            text = "Henüz tanımlı hediye çekiniz bulunmuyor.",
                            style = PAGTheme.typography.bodySmall,
                            color = PAGTheme.colors.textMuted
                        )
                    } else {
                        vouchers.forEach { voucher ->
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                                    .padding(PAGTheme.spacing.md),
                                verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.Top
                                ) {
                                    PAGBadge(title = voucher.title, icon = Icons.Filled.Star, style = PAGBadgeStyle.Tag)
                                    Text(
                                        text = if (voucher.status == "ASSIGNED") "Aktif" else voucher.status,
                                        style = PAGTheme.typography.caption,
                                        color = PAGTheme.colors.success
                                    )
                                }
                                Text(text = "${voucher.valueAmount} TL Hediye Çeki", style = PAGTheme.typography.heading, color = PAGTheme.colors.textPrimary)

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(PAGTheme.colors.surfaceSecondary, PAGTheme.radius.sm)
                                        .padding(PAGTheme.spacing.md),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(text = "KOD: ${voucher.code}", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.brandLime)
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

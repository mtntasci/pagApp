package com.alafteknoloji.pagapp.ui.screens.rewards

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
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.RewardHistoryMock
import com.alafteknoloji.pagapp.models.VoucherMock
import com.alafteknoloji.pagapp.ui.components.PAGBadge
import com.alafteknoloji.pagapp.ui.components.PAGBadgeStyle
import com.alafteknoloji.pagapp.ui.components.PAGButton
import com.alafteknoloji.pagapp.ui.components.PAGButtonStyle
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import java.text.DateFormat

@Composable
fun RewardsScreen(modifier: Modifier = Modifier) {
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
                    text = "₺320",
                    style = PAGTheme.typography.display,
                    color = PAGTheme.colors.brandLime
                )
            }
            
            Spacer(modifier = Modifier.height(PAGTheme.spacing.lg))
            
            // Withdrawal Foundation CTA
            Box(modifier = Modifier.padding(horizontal = PAGTheme.spacing.md).alpha(0.5f)) {
                PAGButton(
                    title = "Para Çek (Yakında)",
                    icon = Icons.Filled.Warning, // Placeholder for arrow
                    style = PAGButtonStyle.Secondary,
                    enabled = false,
                    onClick = { /* Withdrawal UI Foundation - TBD */ }
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
                RewardHistoryMock.sampleList.forEach { history ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                            .padding(PAGTheme.spacing.md),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = history.title, style = PAGTheme.typography.heading, color = PAGTheme.colors.textPrimary)
                            Text(text = DateFormat.getDateInstance(DateFormat.SHORT).format(history.date), style = PAGTheme.typography.bodySmall, color = PAGTheme.colors.textMuted)
                        }
                        Text(
                            text = history.amountText,
                            style = PAGTheme.typography.heading,
                            color = if (history.isVoucher) PAGTheme.colors.warning else PAGTheme.colors.brandBlue
                        )
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
                VoucherMock.sampleList.forEach { voucher ->
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
                            PAGBadge(title = voucher.organization, icon = Icons.Filled.Warning, style = PAGBadgeStyle.Tag)
                            Text(
                                text = voucher.status,
                                style = PAGTheme.typography.caption,
                                color = if (voucher.status == "Kullanıldı") PAGTheme.colors.textMuted else PAGTheme.colors.success
                            )
                        }
                        Text(text = voucher.title, style = PAGTheme.typography.heading, color = PAGTheme.colors.textPrimary)
                        
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(PAGTheme.colors.surfaceSecondary, PAGTheme.radius.sm)
                                .padding(PAGTheme.spacing.md),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "KOD: ${voucher.code}", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.brandLime)
                            Icon(imageVector = Icons.Filled.Warning, contentDescription = "Kopyala", tint = PAGTheme.colors.textSecondary)
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

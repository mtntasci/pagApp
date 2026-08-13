package com.pagapp.pag.ui.screens.surveys

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.pagapp.pag.models.PAGSurvey
import com.pagapp.pag.models.PAGSurveyCompletionResult
import com.pagapp.pag.services.UserService
import com.pagapp.pag.ui.components.PAGButton
import com.pagapp.pag.ui.components.PAGButtonStyle
import com.pagapp.pag.ui.theme.PAGTheme

@Composable
fun SurveyResultScreen(
    survey: PAGSurvey,
    completionResult: PAGSurveyCompletionResult?,
    onBackToHome: () -> Unit,
    modifier: Modifier = Modifier,
    userService: UserService? = null
) {
    val awardedScore = completionResult?.profileScorePotential ?: 0
    val isDuplicateOrZero = (completionResult?.isDuplicate == true)
    val rewardAmount = completionResult?.rewardAwarded ?: 0
    val rewardType = completionResult?.rewardType
    val voucherCode = completionResult?.voucherCode

    LaunchedEffect(completionResult) {
        val newScore = completionResult?.currentProfileScore
        if (newScore != null && userService != null) {
            userService.updateUserProfileScore(newScore)
            userService.fetchUserRanking()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.backgroundPrimary)
            .padding(PAGTheme.spacing.lg)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = Icons.Filled.CheckCircle,
                contentDescription = "Başarılı",
                tint = PAGTheme.colors.success,
                modifier = Modifier.size(80.dp)
            )

            Spacer(modifier = Modifier.height(PAGTheme.spacing.lg))

            Text(
                text = if (isDuplicateOrZero) "Yanıtınız Güncellendi" else "Anket Tamamlandı",
                style = PAGTheme.typography.display,
                color = PAGTheme.colors.textPrimary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PAGTheme.colors.surfaceSecondary, PAGTheme.radius.md)
                    .padding(PAGTheme.spacing.md),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
            ) {
                Text(
                    text = "Cevaplarınız güvenli şekilde kaydedildi.",
                    style = PAGTheme.typography.bodyLarge,
                    color = PAGTheme.colors.textSecondary,
                    textAlign = TextAlign.Center
                )

                if (awardedScore > 0) {
                    Text(
                        text = "+$awardedScore Profil Puanı Kazanıldı!",
                        style = PAGTheme.typography.heading,
                        color = PAGTheme.colors.brandLime,
                        textAlign = TextAlign.Center
                    )
                }

                if (rewardAmount > 0 && rewardType == "MONEY") {
                    Text(
                        text = "$rewardAmount TL Kazandınız!",
                        style = PAGTheme.typography.display,
                        color = PAGTheme.colors.brandLime,
                        textAlign = TextAlign.Center
                    )
                } else if (rewardType == "VOUCHER" && voucherCode != null) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Hediye Çekiniz Hazır!",
                            style = PAGTheme.typography.heading,
                            color = PAGTheme.colors.warning
                        )
                        Text(
                            text = "KOD: $voucherCode",
                            style = PAGTheme.typography.bodyLarge,
                            color = PAGTheme.colors.brandLime
                        )
                    }
                }
            }
        }

        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
        ) {
            PAGButton(
                title = "ANA SAYFAYA DÖN",
                icon = Icons.AutoMirrored.Filled.ArrowForward,
                style = PAGButtonStyle.Primary,
                onClick = onBackToHome
            )
        }
    }
}

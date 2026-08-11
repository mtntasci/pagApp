package com.alafteknoloji.pagapp.ui.screens.surveys

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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.SurveyType
import com.alafteknoloji.pagapp.models.RewardResultMock
import com.alafteknoloji.pagapp.models.RewardType
import com.alafteknoloji.pagapp.models.SurveyMock
import com.alafteknoloji.pagapp.ui.components.PAGButton
import com.alafteknoloji.pagapp.ui.components.PAGButtonStyle
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun SurveyResultScreen(
    survey: SurveyMock,
    onBackToHome: () -> Unit,
    modifier: Modifier = Modifier
) {
    val mockResult = if (survey.surveyType == SurveyType.PROFILE) {
        RewardResultMock.sampleProfileOnly
    } else if (survey.voucherTitle != null) {
        RewardResultMock.sampleVoucher
    } else {
        RewardResultMock.sampleMoney
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
                text = "Anket Tamamlandı",
                style = PAGTheme.typography.display,
                color = PAGTheme.colors.textPrimary,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))
            
            // Profil Score Result
            mockResult.profileScore?.let { score ->
                Text(
                    text = "+$score Profil Puanı",
                    style = PAGTheme.typography.display,
                    color = PAGTheme.colors.brandLime,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(PAGTheme.spacing.md))
            }
            
            // Money Result
            mockResult.moneyAmount?.let { money ->
                Text(
                    text = "${money} TL kazandın",
                    style = PAGTheme.typography.heading,
                    color = PAGTheme.colors.brandBlue,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(PAGTheme.spacing.md))
            }
            
            // Voucher Result
            mockResult.voucherInfo?.let { voucher ->
                Text(
                    text = "Hediye çeki kazandın: $voucher",
                    style = PAGTheme.typography.heading,
                    color = PAGTheme.colors.warning,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(PAGTheme.spacing.md))
            }
        }
        
        Box(
            modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth()
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

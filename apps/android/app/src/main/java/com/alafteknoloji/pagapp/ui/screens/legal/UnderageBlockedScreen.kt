package com.alafteknoloji.pagapp.ui.screens.legal

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.services.AuthService
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun UnderageBlockedScreen(
    userService: UserService
) {
    Scaffold(
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(88.dp)
                        .clip(CircleShape)
                        .background(PAGTheme.colors.brandOrange.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = PAGTheme.colors.brandOrange,
                        modifier = Modifier.size(44.dp)
                    )
                }

                Text(
                    text = "Yaş Uygunluğu Sınırı (18+)",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black,
                    color = PAGTheme.colors.textPrimary,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = "PAG platformu ve kamuoyu araştırmaları yalnızca 18 yaşını doldurmuş yetişkin bireylere yöneliktir.",
                    style = PAGTheme.typography.body,
                    color = PAGTheme.colors.textSecondary,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )

                Text(
                    text = "Hesabınızda kayıtlı doğum tarihi bilgisi gereğince platform katılımınız durdurulmuştur. Bir hata olduğunu düşünüyorsanız info@alafteknoloji.com adresi üzerinden destek ekibimizle irtibata geçebilirsiniz.",
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.textMuted,
                    textAlign = TextAlign.Center,
                    lineHeight = 18.sp
                )
            }

            Button(
                onClick = {
                    AuthService.signOut()
                    userService.clearUserSession()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = PAGTheme.colors.brandLime,
                    contentColor = PAGTheme.colors.brandMidnight
                ),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Oturumu Kapat",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }
            }
        }
    }
}

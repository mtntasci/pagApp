package com.alafteknoloji.pagapp.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.services.PendingVerificationSurveyData
import com.alafteknoloji.pagapp.services.VerificationService
import com.alafteknoloji.pagapp.ui.theme.DarkBackgroundPrimary
import com.alafteknoloji.pagapp.ui.theme.DarkBorderDefault
import com.alafteknoloji.pagapp.ui.theme.DarkSurfacePrimary
import com.alafteknoloji.pagapp.ui.theme.DarkSurfaceSecondary
import com.alafteknoloji.pagapp.ui.theme.DarkTextMuted
import com.alafteknoloji.pagapp.ui.theme.DarkTextPrimary
import com.alafteknoloji.pagapp.ui.theme.DarkTextSecondary
import com.alafteknoloji.pagapp.ui.theme.PAGLime
import com.alafteknoloji.pagapp.ui.theme.PAGMidnight
import com.alafteknoloji.pagapp.ui.theme.PAGSuccess
import kotlinx.coroutines.launch

@Composable
fun PendingVerificationScreen(
    pending: PendingVerificationSurveyData,
    onDismiss: () -> Unit
) {
    val verificationService = remember { VerificationService.getInstance() }
    val scope = rememberCoroutineScope()

    var isStarted by remember { mutableStateOf(false) }
    var selectedOptionId by remember { mutableStateOf<String?>(null) }
    var isCompleted by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Scaffold(
        containerColor = DarkBackgroundPrimary
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (isCompleted) {
                // Success Completion View
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Spacer(modifier = Modifier.weight(1f))

                    Box(
                        modifier = Modifier
                            .size(90.dp)
                            .background(PAGLime.copy(alpha = 0.15f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Success",
                            tint = PAGLime,
                            modifier = Modifier.size(50.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Tebrikler!",
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold,
                        color = DarkTextPrimary
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Kalite doğrulama sorusunu tamamladınız.",
                        fontSize = 15.sp,
                        color = DarkTextSecondary,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(DarkSurfacePrimary, RoundedCornerShape(12.dp))
                            .border(1.dp, DarkBorderDefault, RoundedCornerShape(12.dp))
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "KAZANILAN ÖDÜL",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = DarkTextMuted
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = pending.rewardSummary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = PAGLime
                        )
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Button(
                        onClick = {
                            verificationService.dismissForNow()
                            onDismiss()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PAGLime,
                            contentColor = PAGMidnight
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "Ana Sayfaya Dön",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            } else if (!isStarted) {
                // Intro "Bir Son Adım" Page
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(
                            onClick = {
                                verificationService.dismissForNow()
                                onDismiss()
                            }
                        ) {
                            Text(
                                text = "Daha Sonra",
                                color = DarkTextMuted,
                                fontSize = 14.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(PAGLime.copy(alpha = 0.15f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Reward",
                            tint = PAGLime,
                            modifier = Modifier.size(40.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Bir Son Adım",
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold,
                        color = DarkTextPrimary
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Ana Anket: ${pending.masterSurveyTitle}",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = PAGLime,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Katıldığınız anket için tek soruluk kalite doğrulaması sizi bekliyor.",
                        fontSize = 14.sp,
                        color = DarkTextSecondary,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(DarkSurfacePrimary, RoundedCornerShape(12.dp))
                            .border(1.5.dp, PAGLime.copy(alpha = 0.6f), RoundedCornerShape(12.dp))
                            .padding(18.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "DOĞRULAMA ÖDÜLÜ",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = DarkTextMuted
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Tamamladığınızda ${pending.rewardSummary} kazanacaksınız.",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = DarkTextPrimary,
                            textAlign = TextAlign.Center
                        )
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Button(
                        onClick = { isStarted = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PAGLime,
                            contentColor = PAGMidnight
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "Başla",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    TextButton(
                        onClick = {
                            verificationService.dismissForNow()
                            onDismiss()
                        }
                    ) {
                        Text(
                            text = "Şimdilik Geç",
                            color = DarkTextMuted,
                            fontSize = 14.sp
                        )
                    }
                }
            } else {
                // 1-Question Verification Survey Screen
                val question = pending.questions.firstOrNull()

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { isStarted = false }) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = DarkTextPrimary
                            )
                        }
                        Text(
                            text = "Kalite Doğrulama (1/1)",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = DarkTextMuted,
                            modifier = Modifier.weight(1f),
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.size(48.dp))
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = question?.text ?: "Anket yanıtlarınızı onaylıyor musunuz?",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = DarkTextPrimary
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        items(question?.options ?: emptyList()) { opt ->
                            val isSelected = selectedOptionId == opt.optionId
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        if (isSelected) PAGLime else DarkSurfacePrimary,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .border(
                                        1.dp,
                                        if (isSelected) PAGLime else DarkBorderDefault,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable { selectedOptionId = opt.optionId }
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = opt.label,
                                    fontSize = 15.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) PAGMidnight else DarkTextPrimary,
                                    modifier = Modifier.weight(1f)
                                )

                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Selected",
                                        tint = PAGMidnight
                                    )
                                }
                            }
                        }
                    }

                    if (errorMessage != null) {
                        Text(
                            text = errorMessage ?: "",
                            color = Color.Red,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }

                    Button(
                        onClick = {
                            val qId = question?.questionId ?: return@Button
                            val optId = selectedOptionId ?: return@Button
                            scope.launch {
                                isSubmitting = true
                                errorMessage = null
                                val ok = verificationService.submitVerificationAnswer(
                                    surveyId = pending.verificationSurveyId,
                                    questionId = qId,
                                    optionId = optId
                                )
                                if (ok) {
                                    isCompleted = true
                                } else {
                                    errorMessage = "Yanıt gönderilemedi. Lütfen tekrar deneyin."
                                }
                                isSubmitting = false
                            }
                        },
                        enabled = selectedOptionId != null && !isSubmitting,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PAGLime,
                            contentColor = PAGMidnight,
                            disabledContainerColor = DarkSurfaceSecondary,
                            disabledContentColor = DarkTextMuted
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = PAGMidnight
                            )
                        } else {
                            Text(
                                text = "Tamamla & Ödülü Kazan",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

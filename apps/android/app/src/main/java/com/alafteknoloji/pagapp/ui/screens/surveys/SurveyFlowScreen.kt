package com.alafteknoloji.pagapp.ui.screens.surveys

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.PAGAnswerInput
import com.alafteknoloji.pagapp.models.PAGSurvey
import com.alafteknoloji.pagapp.models.PAGSurveyCompletionResult
import com.alafteknoloji.pagapp.services.SurveyService
import com.alafteknoloji.pagapp.ui.components.PAGButton
import com.alafteknoloji.pagapp.ui.components.PAGButtonStyle
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SurveyFlowScreen(
    survey: PAGSurvey,
    onComplete: (PAGSurveyCompletionResult) -> Unit,
    onExit: () -> Unit,
    modifier: Modifier = Modifier,
    surveyService: SurveyService = remember { SurveyService() }
) {
    val questions = remember(survey) { survey.questions?.take(3) ?: emptyList() }
    var currentIndex by remember { mutableIntStateOf(0) }
    var selectedOptionId by remember { mutableStateOf<String?>(null) }
    val answersMap = remember { mutableStateMapOf<String, String>() }

    var isSubmitting by remember { mutableStateOf(false) }
    var submitError by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val currentQuestion = questions.getOrNull(currentIndex)

    if (currentQuestion == null) {
        onExit()
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Soru ${currentIndex + 1}/${questions.size}",
                        style = PAGTheme.typography.title,
                        color = PAGTheme.colors.textPrimary
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onExit) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Çıkış",
                            tint = PAGTheme.colors.textPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PAGTheme.colors.backgroundPrimary)
            )
        },
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { paddingValues ->
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(PAGTheme.colors.backgroundPrimary)
        ) {
            // Scrollable Content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = PAGTheme.spacing.md)
                    .padding(bottom = 120.dp)
            ) {
                LinearProgressIndicator(
                    progress = { (currentIndex + 1).toFloat() / questions.size },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(PAGTheme.radius.pill),
                    color = PAGTheme.colors.brandLime,
                    trackColor = PAGTheme.colors.surfaceSecondary
                )

                Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

                Text(
                    text = currentQuestion.text,
                    style = PAGTheme.typography.display,
                    color = PAGTheme.colors.textPrimary
                )

                Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

                Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)) {
                    currentQuestion.options.forEach { option ->
                        val isSelected = selectedOptionId == option.optionId

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    color = if (isSelected) PAGTheme.colors.surfaceSecondary else PAGTheme.colors.backgroundPrimary,
                                    shape = PAGTheme.radius.md
                                )
                                .border(
                                    width = 1.dp,
                                    color = if (isSelected) PAGTheme.colors.brandLime else PAGTheme.colors.borderDefault,
                                    shape = PAGTheme.radius.md
                                )
                                .clickable {
                                    selectedOptionId = option.optionId
                                    answersMap[currentQuestion.questionId] = option.optionId
                                }
                                .padding(PAGTheme.spacing.md),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = isSelected,
                                onClick = {
                                    selectedOptionId = option.optionId
                                    answersMap[currentQuestion.questionId] = option.optionId
                                },
                                colors = RadioButtonDefaults.colors(
                                    selectedColor = PAGTheme.colors.brandLime,
                                    unselectedColor = PAGTheme.colors.textMuted
                                )
                            )
                            Text(
                                text = option.label,
                                style = PAGTheme.typography.bodyLarge,
                                color = if (isSelected) PAGTheme.colors.textPrimary else PAGTheme.colors.textSecondary
                            )
                        }
                    }
                }

                submitError?.let { err ->
                    Spacer(modifier = Modifier.height(PAGTheme.spacing.md))
                    Text(
                        text = err,
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.error
                    )
                }
            }

            // Pinned Floating Bottom CTA Button (Above Tab Bar)
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(PAGTheme.colors.surfacePrimary.copy(alpha = 0.95f))
                    .padding(horizontal = PAGTheme.spacing.md, vertical = PAGTheme.spacing.md)
            ) {
                val isLast = currentIndex == questions.size - 1
                PAGButton(
                    title = if (isSubmitting) "GÖNDERİLİYOR..." else if (isLast) "ANKETİ TAMAMLA" else "DEVAM",
                    icon = if (isLast) Icons.Filled.Check else Icons.AutoMirrored.Filled.ArrowForward,
                    style = PAGButtonStyle.Primary,
                    enabled = selectedOptionId != null && !isSubmitting,
                    onClick = {
                        if (isLast) {
                            scope.launch {
                                isSubmitting = true
                                submitError = null
                                try {
                                    val answerInputs = answersMap.map { PAGAnswerInput(it.key, it.value) }
                                    val res = surveyService.submitSurveyResponse(
                                        surveyId = survey.surveyId,
                                        answers = answerInputs
                                    )
                                    isSubmitting = false
                                    if (res != null) {
                                        onComplete(res)
                                    } else {
                                        submitError = "Cevaplar gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz."
                                    }
                                } catch (e: Exception) {
                                    isSubmitting = false
                                    submitError = "Gönderim hatası: ${e.localizedMessage}"
                                }
                            }
                        } else {
                            currentIndex++
                            selectedOptionId = answersMap[questions.getOrNull(currentIndex)?.questionId]
                        }
                    }
                )
            }
        }
    }
}

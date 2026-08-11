package com.alafteknoloji.pagapp.ui.screens.surveys

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.alafteknoloji.pagapp.models.SurveyMock
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

enum class SurveyRoute {
    LIST,
    DETAIL,
    FLOW,
    RESULT
}

@Composable
fun SurveysTab(modifier: Modifier = Modifier) {
    var currentRoute by remember { mutableStateOf(SurveyRoute.LIST) }
    var selectedSurveyId by remember { mutableStateOf<String?>(null) }
    
    val selectedSurvey = SurveyMock.sampleList.find { it.id == selectedSurveyId }

    Box(modifier = modifier.fillMaxSize().background(PAGTheme.colors.backgroundPrimary)) {
        when (currentRoute) {
            SurveyRoute.LIST -> {
                SurveysScreen(
                    onNavigateToDetail = { surveyId ->
                        selectedSurveyId = surveyId
                        currentRoute = SurveyRoute.DETAIL
                    }
                )
            }
            SurveyRoute.DETAIL -> {
                selectedSurvey?.let { survey ->
                    SurveyDetailScreen(
                        survey = survey,
                        onStartSurvey = {
                            currentRoute = SurveyRoute.FLOW
                        }
                    )
                }
            }
            SurveyRoute.FLOW -> {
                selectedSurvey?.let { survey ->
                    SurveyFlowScreen(
                        survey = survey,
                        onComplete = {
                            currentRoute = SurveyRoute.RESULT
                        },
                        onExit = {
                            // Erken çıkış: partial state tutulmuyor
                            currentRoute = SurveyRoute.LIST
                        }
                    )
                }
            }
            SurveyRoute.RESULT -> {
                selectedSurvey?.let { survey ->
                    SurveyResultScreen(
                        survey = survey,
                        onBackToHome = {
                            currentRoute = SurveyRoute.LIST
                        }
                    )
                }
            }
        }
    }
}

package com.alafteknoloji.pagapp.ui.screens.surveys

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.activity.compose.BackHandler
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
fun SurveysTab(
    modifier: Modifier = Modifier,
    currentRoute: SurveyRoute = SurveyRoute.LIST,
    selectedSurveyId: String? = null,
    onRouteChanged: (SurveyRoute) -> Unit = {},
    onSurveySelected: (String?) -> Unit = {},
    onNavigateToHome: () -> Unit = {}
) {
    
    val selectedSurvey = SurveyMock.sampleList.find { it.id == selectedSurveyId }

    BackHandler(enabled = currentRoute != SurveyRoute.LIST) {
        onRouteChanged(SurveyRoute.LIST)
    }

    Box(modifier = modifier.fillMaxSize().background(PAGTheme.colors.backgroundPrimary)) {
        when (currentRoute) {
            SurveyRoute.LIST -> {
                SurveysScreen(
                    onNavigateToDetail = { surveyId ->
                        onSurveySelected(surveyId)
                        onRouteChanged(SurveyRoute.DETAIL)
                    }
                )
            }
            SurveyRoute.DETAIL -> {
                selectedSurvey?.let { survey ->
                    SurveyDetailScreen(
                        survey = survey,
                        onStartSurvey = {
                            onRouteChanged(SurveyRoute.FLOW)
                        }
                    )
                }
            }
            SurveyRoute.FLOW -> {
                selectedSurvey?.let { survey ->
                    SurveyFlowScreen(
                        survey = survey,
                        onComplete = {
                            onRouteChanged(SurveyRoute.RESULT)
                        },
                        onExit = {
                            onRouteChanged(SurveyRoute.LIST)
                        }
                    )
                }
            }
            SurveyRoute.RESULT -> {
                selectedSurvey?.let { survey ->
                    SurveyResultScreen(
                        survey = survey,
                        onBackToHome = onNavigateToHome
                    )
                }
            }
        }
    }
}

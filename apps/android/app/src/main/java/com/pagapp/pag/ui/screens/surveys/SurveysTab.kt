package com.pagapp.pag.ui.screens.surveys

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.pagapp.pag.models.PAGSurvey
import com.pagapp.pag.models.PAGSurveyCompletionResult
import com.pagapp.pag.services.SurveyService
import com.pagapp.pag.ui.theme.PAGTheme

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
    onNavigateToHome: () -> Unit = {},
    surveyService: SurveyService = remember { SurveyService() },
    userService: com.pagapp.pag.services.UserService? = null
) {
    var activeSurvey by remember { mutableStateOf<PAGSurvey?>(null) }
    var completionResult by remember { mutableStateOf<PAGSurveyCompletionResult?>(null) }

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
                    },
                    surveyService = surveyService
                )
            }
            SurveyRoute.DETAIL -> {
                selectedSurveyId?.let { surveyId ->
                    SurveyDetailScreen(
                        surveyId = surveyId,
                        onStartSurvey = { loadedSurvey ->
                            activeSurvey = loadedSurvey
                            onRouteChanged(SurveyRoute.FLOW)
                        },
                        surveyService = surveyService
                    )
                }
            }
            SurveyRoute.FLOW -> {
                activeSurvey?.let { survey ->
                    SurveyFlowScreen(
                        survey = survey,
                        onComplete = { result ->
                            completionResult = result
                            onRouteChanged(SurveyRoute.RESULT)
                        },
                        onExit = {
                            onRouteChanged(SurveyRoute.LIST)
                        },
                        surveyService = surveyService
                    )
                }
            }
            SurveyRoute.RESULT -> {
                activeSurvey?.let { survey ->
                    SurveyResultScreen(
                        survey = survey,
                        completionResult = completionResult,
                        onBackToHome = onNavigateToHome,
                        userService = userService
                    )
                }
            }
        }
    }
}

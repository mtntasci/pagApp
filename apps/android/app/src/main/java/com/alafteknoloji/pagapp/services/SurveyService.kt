package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.PAGAnswerInput
import com.alafteknoloji.pagapp.models.PAGQuestion
import com.alafteknoloji.pagapp.models.PAGQuestionOption
import com.alafteknoloji.pagapp.models.PAGSurvey
import com.alafteknoloji.pagapp.models.PAGSurveyCompletionResult
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

class SurveyService {
    private val functions: FirebaseFunctions = FirebaseFunctions.getInstance()

    private val _eligibleSurveys = MutableStateFlow<List<PAGSurvey>>(emptyList())
    val eligibleSurveys: StateFlow<List<PAGSurvey>> = _eligibleSurveys.asStateFlow()

    private val _completedSurveys = MutableStateFlow<List<PAGSurvey>>(emptyList())
    val completedSurveys: StateFlow<List<PAGSurvey>> = _completedSurveys.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    suspend fun fetchEligibleSurveys() {
        _isLoading.value = true
        _errorMessage.value = null

        try {
            val result = functions.getHttpsCallable("getEligibleSurveys").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val dataDict = resMap?.get("data") as? Map<String, Any>
                @Suppress("UNCHECKED_CAST")
                val rawSurveys = dataDict?.get("surveys") as? List<Map<String, Any>> ?: emptyList()

                val parsed = rawSurveys.mapNotNull { item ->
                    val surveyId = item["surveyId"] as? String ?: return@mapNotNull null
                    val title = item["title"] as? String ?: return@mapNotNull null
                    val description = item["description"] as? String ?: ""

                    PAGSurvey(
                        surveyId = surveyId,
                        ownerType = item["ownerType"] as? String ?: "PAG",
                        organizationId = item["organizationId"] as? String,
                        surveyType = item["surveyType"] as? String ?: "PAG",
                        title = title,
                        description = description,
                        status = item["status"] as? String ?: "ACTIVE",
                        questionCount = (item["questionCount"] as? Number)?.toInt() ?: 3,
                        profileScoreReward = (item["profileScoreReward"] as? Number)?.toInt() ?: 50,
                        isCompleted = item["isCompleted"] as? Boolean ?: false
                    )
                }

                _eligibleSurveys.value = parsed
            } else {
                _errorMessage.value = "Anketler alınamadı."
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _errorMessage.value = "Anketler yüklenirken hata oluştu."
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun fetchCompletedSurveys() {
        try {
            val result = functions.getHttpsCallable("getCompletedSurveys").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val dataDict = resMap?.get("data") as? Map<String, Any>
                @Suppress("UNCHECKED_CAST")
                val rawSurveys = dataDict?.get("surveys") as? List<Map<String, Any>> ?: emptyList()

                val parsed = rawSurveys.mapNotNull { item ->
                    val surveyId = item["surveyId"] as? String ?: return@mapNotNull null
                    val title = item["title"] as? String ?: return@mapNotNull null
                    val description = item["description"] as? String ?: ""

                    PAGSurvey(
                        surveyId = surveyId,
                        ownerType = item["ownerType"] as? String ?: "PAG",
                        organizationId = item["organizationId"] as? String,
                        surveyType = item["surveyType"] as? String ?: "PAG",
                        title = title,
                        description = description,
                        status = "COMPLETED",
                        questionCount = (item["questionCount"] as? Number)?.toInt() ?: 3,
                        profileScoreReward = (item["profileScoreReward"] as? Number)?.toInt() ?: 50,
                        isCompleted = true
                    )
                }

                _completedSurveys.value = parsed
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun fetchSurveyDetail(surveyId: String): PAGSurvey? {
        return try {
            val result = functions.getHttpsCallable("getSurveyDetail")
                .call(mapOf("surveyId" to surveyId))
                .await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val dataDict = resMap?.get("data") as? Map<String, Any>
                @Suppress("UNCHECKED_CAST")
                val surveyMap = dataDict?.get("survey") as? Map<String, Any> ?: return null
                @Suppress("UNCHECKED_CAST")
                val questionsRaw = dataDict["questions"] as? List<Map<String, Any>> ?: emptyList()

                val parsedQuestions = questionsRaw.map { qMap ->
                    @Suppress("UNCHECKED_CAST")
                    val optionsRaw = qMap["options"] as? List<Map<String, Any>> ?: emptyList()
                    val parsedOptions = optionsRaw.map { oMap ->
                        PAGQuestionOption(
                            optionId = oMap["optionId"] as? String ?: "",
                            label = oMap["label"] as? String ?: "",
                            order = (oMap["order"] as? Number)?.toInt() ?: 0
                        )
                    }

                    PAGQuestion(
                        questionId = qMap["questionId"] as? String ?: "",
                        order = (qMap["order"] as? Number)?.toInt() ?: 0,
                        type = qMap["type"] as? String ?: "SINGLE_SELECT",
                        text = qMap["text"] as? String ?: "",
                        options = parsedOptions
                    )
                }

                PAGSurvey(
                    surveyId = surveyMap["surveyId"] as? String ?: surveyId,
                    ownerType = surveyMap["ownerType"] as? String ?: "PAG",
                    organizationId = surveyMap["organizationId"] as? String,
                    surveyType = surveyMap["surveyType"] as? String ?: "PAG",
                    title = surveyMap["title"] as? String ?: "",
                    description = surveyMap["description"] as? String ?: "",
                    status = surveyMap["status"] as? String ?: "ACTIVE",
                    questionCount = (surveyMap["questionCount"] as? Number)?.toInt() ?: parsedQuestions.size,
                    questions = parsedQuestions,
                    profileScoreReward = (surveyMap["profileScoreReward"] as? Number)?.toInt() ?: 50,
                    isCompleted = dataDict["isCompleted"] as? Boolean ?: false
                )
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun submitSurveyResponse(
        surveyId: String,
        answers: List<PAGAnswerInput>
    ): PAGSurveyCompletionResult? {
        return try {
            val answersList = answers.map {
                mapOf("questionId" to it.questionId, "optionId" to it.optionId)
            }

            val payload = mapOf(
                "surveyId" to surveyId,
                "answers" to answersList
            )

            val result = functions.getHttpsCallable("submitSurveyResponse")
                .call(payload)
                .await()

            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val dataDict = resMap?.get("data") as? Map<String, Any> ?: return null

                PAGSurveyCompletionResult(
                    responseId = dataDict["responseId"] as? String ?: "",
                    surveyId = dataDict["surveyId"] as? String ?: surveyId,
                    completedAt = dataDict["completedAt"] as? String ?: "",
                    isDuplicate = dataDict["isDuplicate"] as? Boolean ?: false,
                    profileScorePotential = (dataDict["profileScoreAwarded"] as? Number)?.toInt() ?: 0,
                    currentProfileScore = (dataDict["currentProfileScore"] as? Number)?.toInt() ?: 0,
                    rewardAwarded = (dataDict["currentRewardBalance"] as? Number)?.toInt() ?: 0,
                    rewardType = dataDict["rewardType"] as? String ?: "NONE",
                    voucherCode = dataDict["voucherCode"] as? String,
                    voucherTitle = dataDict["voucherTitle"] as? String,
                    currentRewardBalance = (dataDict["currentRewardBalance"] as? Number)?.toInt() ?: 0
                )
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

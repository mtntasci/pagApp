package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.PAGAnswerInput
import com.alafteknoloji.pagapp.models.PAGQuestion
import com.alafteknoloji.pagapp.models.PAGQuestionOption
import com.alafteknoloji.pagapp.models.PAGSurvey
import com.alafteknoloji.pagapp.models.PAGSurveyCompletionResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

class SurveyService {

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
            val apiRes = PAGApiClient.get("/home")
            if (apiRes != null && apiRes.optBoolean("success")) {
                val dataObj = apiRes.optJSONObject("data")
                val rawSurveys = dataObj?.optJSONArray("surveys")
                val parsed = mutableListOf<PAGSurvey>()
                if (rawSurveys != null) {
                    for (i in 0 until rawSurveys.length()) {
                        val item = rawSurveys.getJSONObject(i)
                        val surveyId = item.optString("id").ifEmpty { item.optString("surveyId") }
                        val title = item.optString("title")
                        if (surveyId.isNotEmpty() && title.isNotEmpty()) {
                            val qList = mutableListOf<PAGQuestion>()
                            val rawQs = item.optJSONArray("questions")
                            if (rawQs != null) {
                                for (qIdx in 0 until rawQs.length()) {
                                    val qObj = rawQs.getJSONObject(qIdx)
                                    val qId = qObj.optString("questionId", "q${qIdx + 1}")
                                    val qText = qObj.optString("text", "")
                                    val optList = mutableListOf<PAGQuestionOption>()
                                    val rawOpts = qObj.optJSONArray("options")
                                    if (rawOpts != null) {
                                        for (oIdx in 0 until rawOpts.length()) {
                                            val opt = rawOpts.get(oIdx)
                                            if (opt is String) {
                                                optList.add(PAGQuestionOption("opt_${oIdx + 1}", opt, oIdx + 1))
                                            } else if (opt is JSONObject) {
                                                optList.add(PAGQuestionOption(
                                                    opt.optString("optionId", "opt_${oIdx + 1}"),
                                                    opt.optString("label", ""),
                                                    opt.optInt("order", oIdx + 1)
                                                ))
                                            }
                                        }
                                    }
                                    qList.add(PAGQuestion(qId, qIdx + 1, "SINGLE_SELECT", qText, optList))
                                }
                            }

                            parsed.add(
                                PAGSurvey(
                                    surveyId = surveyId,
                                    ownerType = item.optString("ownerType", "PAG"),
                                    organizationId = if (item.isNull("organizationId")) null else item.optString("organizationId"),
                                    surveyType = item.optString("surveyType", "PAG"),
                                    title = title,
                                    description = item.optString("description", ""),
                                    status = item.optString("status", "ACTIVE"),
                                    questionCount = if (qList.isNotEmpty()) qList.size else item.optInt("questionCount", 3),
                                    questions = qList,
                                    profileScoreReward = item.optInt("profileScoreReward", 50),
                                    isCompleted = false,
                                    isHighlighted = item.optBoolean("isHighlighted", false)
                                )
                            )
                        }
                    }
                }
                _eligibleSurveys.value = parsed
            } else {
                _eligibleSurveys.value = emptyList()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _eligibleSurveys.value = emptyList()
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun fetchCompletedSurveys() {
        try {
            val apiRes = PAGApiClient.get("/surveys/completed")
            if (apiRes != null && apiRes.optBoolean("success")) {
                val dataDict = apiRes.optJSONObject("data")
                val rawSurveys = dataDict?.optJSONArray("completedSurveys")
                val parsed = mutableListOf<PAGSurvey>()
                if (rawSurveys != null) {
                    for (i in 0 until rawSurveys.length()) {
                        val item = rawSurveys.getJSONObject(i)
                        val surveyId = item.optString("surveyId").ifEmpty { item.optString("id") }
                        val title = item.optString("title")
                        if (surveyId.isNotEmpty() && title.isNotEmpty()) {
                            parsed.add(
                                PAGSurvey(
                                    surveyId = surveyId,
                                    ownerType = item.optString("ownerType", "PAG"),
                                    organizationId = if (item.isNull("organizationId")) null else item.optString("organizationId"),
                                    surveyType = item.optString("surveyType", "PAG"),
                                    title = title,
                                    description = item.optString("description", ""),
                                    status = "COMPLETED",
                                    questionCount = item.optInt("questionCount", 3),
                                    profileScoreReward = item.optInt("profileScoreReward", 50),
                                    isCompleted = true
                                )
                            )
                        }
                    }
                }
                _completedSurveys.value = parsed
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun fetchSurveyDetail(surveyId: String): PAGSurvey? {
        val found = _eligibleSurveys.value.find { it.surveyId == surveyId }
        if (found != null) return found
        val comp = _completedSurveys.value.find { it.surveyId == surveyId }
        return comp
    }

    suspend fun submitSurveyResponse(
        surveyId: String,
        answers: List<PAGAnswerInput>,
        isProfile: Boolean = false,
        userService: UserService? = null
    ): PAGSurveyCompletionResult {
        val answersArray = JSONArray()
        answers.take(3).forEach { ans ->
            val obj = JSONObject().apply {
                put("questionId", ans.questionId)
                put("optionId", ans.optionId)
            }
            answersArray.put(obj)
        }

        val jsonBody = JSONObject().apply {
            put("answers", answersArray)
        }

        val apiRes = PAGApiClient.post("/surveys/$surveyId/submit", jsonBody)
        if (apiRes != null && apiRes.optBoolean("success")) {
            val dataDict = apiRes.optJSONObject("data")
            val scoreAwarded = dataDict?.optInt("earnedScore", 50) ?: 50
            val currentScore = dataDict?.optInt("profileScore")
            val earnedReward = dataDict?.optJSONObject("earnedReward")
            val prizeAmount = earnedReward?.optInt("amount")
            val prizeType = earnedReward?.optString("type")
            val vCode = earnedReward?.optString("code")
            val vTitle = earnedReward?.optString("poolName")
            val currentRewardBalance = dataDict?.optString("rewardBalance", "0")?.toDoubleOrNull()?.toInt() ?: 0

            fetchEligibleSurveys()
            userService?.bootstrapCurrentUser()

            return PAGSurveyCompletionResult(
                responseId = "${surveyId}_submitted",
                surveyId = surveyId,
                completedAt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", java.util.Locale.US).format(java.util.Date()),
                isDuplicate = false,
                profileScorePotential = scoreAwarded,
                currentProfileScore = currentScore,
                rewardAwarded = prizeAmount,
                rewardType = prizeType,
                voucherCode = vCode,
                voucherTitle = vTitle,
                currentRewardBalance = currentRewardBalance
            )
        }

        val errorMsg = apiRes?.optString("error", "Tamamlama işlemi başarısız.") ?: "Tamamlama işlemi başarısız."
        throw Exception(errorMsg)
    }
}

package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.PAGQuestion
import com.alafteknoloji.pagapp.models.PAGQuestionOption
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

data class PendingVerificationSurveyData(
    val assignmentId: String,
    val verificationSurveyId: String,
    val masterSurveyId: String,
    val masterSurveyTitle: String,
    val title: String,
    val description: String,
    val rewardSummary: String,
    val questionCount: Int,
    val questions: List<PAGQuestion>
)

class VerificationService private constructor() {

    private val _pendingVerification = MutableStateFlow<PendingVerificationSurveyData?>(null)
    val pendingVerification: StateFlow<PendingVerificationSurveyData?> = _pendingVerification.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    suspend fun checkPendingVerification() {
        _isLoading.value = false
        _pendingVerification.value = null
    }

    suspend fun submitVerificationAnswer(
        surveyId: String,
        questionId: String,
        optionId: String
    ): Boolean {
        _isSubmitting.value = true
        _errorMessage.value = null

        return try {
            val answersArray = JSONArray().apply {
                put(JSONObject().apply {
                    put("questionId", questionId)
                    put("optionId", optionId)
                })
            }
            val body = JSONObject().apply {
                put("answers", answersArray)
            }
            val apiRes = PAGApiClient.post("/surveys/$surveyId/submit", body)
            val success = apiRes != null && apiRes.optBoolean("success")
            if (success) {
                _pendingVerification.value = null
            }
            _isSubmitting.value = false
            success
        } catch (e: Exception) {
            _isSubmitting.value = false
            _errorMessage.value = e.localizedMessage
            false
        }
    }

    fun dismissForNow() {
        _pendingVerification.value = null
    }

    companion object {
        val shared = VerificationService()
    }
}

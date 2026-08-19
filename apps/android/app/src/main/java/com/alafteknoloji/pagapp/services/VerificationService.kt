package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.PAGQuestion
import com.alafteknoloji.pagapp.models.PAGQuestionOption
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

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
    private val functions: FirebaseFunctions = FirebaseFunctions.getInstance()

    private val _pendingVerification = MutableStateFlow<PendingVerificationSurveyData?>(null)
    val pendingVerification: StateFlow<PendingVerificationSurveyData?> = _pendingVerification.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    suspend fun checkPendingVerification() {
        _isLoading.value = true
        _errorMessage.value = null

        try {
            val result = functions.getHttpsCallable("getPendingVerificationSurvey").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val dataDict = resMap?.get("data") as? Map<String, Any>
                val hasPending = dataDict?.get("hasPendingVerification") as? Boolean ?: false

                if (hasPending) {
                    @Suppress("UNCHECKED_CAST")
                    val pendingData = dataDict?.get("pendingSurvey") as? Map<String, Any>
                    if (pendingData != null) {
                        @Suppress("UNCHECKED_CAST")
                        val rawQuestions = pendingData["questions"] as? List<Map<String, Any>> ?: emptyList()
                        val parsedQuestions = rawQuestions.map { q ->
                            @Suppress("UNCHECKED_CAST")
                            val rawOpts = q["options"] as? List<Map<String, Any>> ?: emptyList()
                            val opts = rawOpts.map { opt ->
                                PAGQuestionOption(
                                    optionId = opt["optionId"] as? String ?: opt["id"] as? String ?: "opt_1",
                                    label = opt["label"] as? String ?: "",
                                    order = (opt["order"] as? Number)?.toInt() ?: 1
                                )
                            }
                            PAGQuestion(
                                questionId = q["questionId"] as? String ?: q["id"] as? String ?: "vq1",
                                order = (q["order"] as? Number)?.toInt() ?: 1,
                                type = q["type"] as? String ?: "SINGLE_SELECT",
                                text = q["text"] as? String ?: q["questionText"] as? String ?: "",
                                options = opts
                            )
                        }

                        _pendingVerification.value = PendingVerificationSurveyData(
                            assignmentId = pendingData["assignmentId"] as? String ?: "",
                            verificationSurveyId = pendingData["verificationSurveyId"] as? String ?: "",
                            masterSurveyId = pendingData["masterSurveyId"] as? String ?: "",
                            masterSurveyTitle = pendingData["masterSurveyTitle"] as? String ?: "Anket",
                            title = pendingData["title"] as? String ?: "Kalite Doğrulama",
                            description = pendingData["description"] as? String ?: "",
                            rewardSummary = pendingData["rewardSummary"] as? String ?: "250 TL Hediye Çeki",
                            questionCount = (pendingData["questionCount"] as? Number)?.toInt() ?: 1,
                            questions = parsedQuestions
                        )
                    } else {
                        _pendingVerification.value = null
                    }
                } else {
                    _pendingVerification.value = null
                }
            } else {
                _pendingVerification.value = null
            }
        } catch (e: Exception) {
            _pendingVerification.value = null
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun submitVerificationAnswer(surveyId: String, questionId: String, optionId: String): Boolean {
        _isSubmitting.value = true
        _errorMessage.value = null

        return try {
            val payload = mapOf(
                "surveyId" to surveyId,
                "answers" to listOf(
                    mapOf(
                        "questionId" to questionId,
                        "optionId" to optionId
                    )
                )
            )

            val result = functions.getHttpsCallable("submitSurveyResponse").call(payload).await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                _pendingVerification.value = null
                true
            } else {
                _errorMessage.value = "Yanıt kaydedilemedi."
                false
            }
        } catch (e: Exception) {
            _errorMessage.value = e.localizedMessage ?: "Bağlantı hatası oluştu."
            false
        } finally {
            _isSubmitting.value = false
        }
    }

    fun dismissForNow() {
        _pendingVerification.value = null
    }

    companion object {
        @Volatile
        private var instance: VerificationService? = null

        fun getInstance(): VerificationService {
            return instance ?: synchronized(this) {
                instance ?: VerificationService().also { instance = it }
            }
        }
    }
}

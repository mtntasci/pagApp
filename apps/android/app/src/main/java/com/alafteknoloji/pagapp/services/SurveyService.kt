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
                _errorMessage.value = "Anketler yüklenirken sunucu hatası oluştu."
                _eligibleSurveys.value = emptyList()
            }
            _isLoading.value = false
        } catch (e: Exception) {
            _errorMessage.value = "Anketler yüklenirken bir sorun oluştu: ${e.localizedMessage}"
            _eligibleSurveys.value = emptyList()
            _isLoading.value = false
        }
    }

    suspend fun fetchSurveyDetail(surveyId: String): PAGSurvey {
        val payload = mapOf("surveyId" to surveyId)
        val result = functions.getHttpsCallable("getSurveyDetail").call(payload).await()
        @Suppress("UNCHECKED_CAST")
        val resMap = result.getData() as? Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val dataDict = resMap?.get("data") as? Map<String, Any> ?: throw Exception("Anket bulunamadı")

        val id = dataDict["surveyId"] as? String ?: surveyId
        val title = dataDict["title"] as? String ?: "Anket"
        val description = dataDict["description"] as? String ?: ""
        val ownerType = dataDict["ownerType"] as? String ?: "PAG"
        val orgId = dataDict["organizationId"] as? String
        val surveyType = dataDict["surveyType"] as? String ?: "PAG"
        val isCompleted = dataDict["isCompleted"] as? Boolean ?: false
        val reward = (dataDict["profileScoreReward"] as? Number)?.toInt() ?: 50

        @Suppress("UNCHECKED_CAST")
        val rawQuestions = dataDict["questions"] as? List<Map<String, Any>> ?: emptyList()

        val questions = rawQuestions.take(3).map { q ->
            val qId = q["questionId"] as? String ?: "q1"
            val text = q["text"] as? String ?: ""
            val order = (q["order"] as? Number)?.toInt() ?: 1
            val type = q["type"] as? String ?: "SINGLE_SELECT"

            @Suppress("UNCHECKED_CAST")
            val rawOpts = q["options"] as? List<Map<String, Any>> ?: emptyList()
            val options = rawOpts.map { opt ->
                val optId = opt["optionId"] as? String ?: "opt_1"
                val label = opt["label"] as? String ?: ""
                val optOrder = (opt["order"] as? Number)?.toInt() ?: 1
                PAGQuestionOption(optId, label, optOrder)
            }

            PAGQuestion(qId, order, type, text, options)
        }

        return PAGSurvey(
            surveyId = id,
            ownerType = ownerType,
            organizationId = orgId,
            surveyType = surveyType,
            title = title,
            description = description,
            status = "ACTIVE",
            questionCount = questions.size,
            questions = questions,
            profileScoreReward = reward,
            isCompleted = isCompleted
        )
    }

    suspend fun submitSurveyResponse(
        surveyId: String,
        answers: List<PAGAnswerInput>,
        isProfile: Boolean = false
    ): PAGSurveyCompletionResult {
        val functionName = if (isProfile) "updateProfileSurveyResponse" else "submitSurveyResponse"
        val answerDicts = answers.take(3).map { mapOf("questionId" to it.questionId, "optionId" to it.optionId) }
        val payload = mapOf(
            "surveyId" to surveyId,
            "answers" to answerDicts
        )

        val result = functions.getHttpsCallable(functionName).call(payload).await()
        @Suppress("UNCHECKED_CAST")
        val resMap = result.getData() as? Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val dataDict = resMap?.get("data") as? Map<String, Any> ?: throw Exception("Submit failed")

        val resId = dataDict["responseId"] as? String ?: "${surveyId}_submitted"
        val completedAt = dataDict["completedAt"] as? String ?: "2026-08-12T00:00:00Z"
        val isDuplicate = dataDict["isDuplicate"] as? Boolean ?: false
        val scoreAwarded = (dataDict["profileScoreAwarded"] as? Number)?.toInt() ?: (dataDict["profileScorePotential"] as? Number)?.toInt() ?: 50
        val currentScore = (dataDict["currentProfileScore"] as? Number)?.toInt()

        fetchEligibleSurveys()

        return PAGSurveyCompletionResult(
            responseId = resId,
            surveyId = surveyId,
            completedAt = completedAt,
            isDuplicate = isDuplicate,
            profileScorePotential = scoreAwarded,
            currentProfileScore = currentScore
        )
    }

    companion object {
        // Preview / Test fixtures ONLY
        val previewDemoSurveys = listOf(
            PAGSurvey(
                surveyId = "srv_pag_01",
                ownerType = "PAG",
                surveyType = "PAG",
                title = "Mobil Uygulama Kullanım Alışkanlıkları",
                description = "Günlük mobil uygulama tercihlerinizi değerlendirin ve profil puanınızı yükseltin.",
                questionCount = 3,
                questions = listOf(
                    PAGQuestion("q1", 1, "SINGLE_SELECT", "Günlük ortalama akıllı telefon kullanım süreniz nedir?", listOf(
                        PAGQuestionOption("opt_1", "1 saatten az", 1),
                        PAGQuestionOption("opt_2", "1-3 saat arası", 2),
                        PAGQuestionOption("opt_3", "3 saatten fazla", 3)
                    )),
                    PAGQuestion("q2", 2, "SINGLE_SELECT", "En sık kullandığınız mobil uygulama kategorisi hangisidir?", listOf(
                        PAGQuestionOption("opt_1", "Sosyal Medya", 1),
                        PAGQuestionOption("opt_2", "Finans & Bankacılık", 2),
                        PAGQuestionOption("opt_3", "Oyun & Eğlence", 3)
                    )),
                    PAGQuestion("q3", 3, "SINGLE_SELECT", "Mobil anket uygulamalarından en büyük beklentiniz nedir?", listOf(
                        PAGQuestionOption("opt_1", "Hızlı Ödül Kazancı", 1),
                        PAGQuestionOption("opt_2", "Kısa ve Eğlenceli Sorular", 2),
                        PAGQuestionOption("opt_3", "Marka Kampanyaları", 3)
                    ))
                ),
                profileScoreReward = 50
            )
        )
    }
}

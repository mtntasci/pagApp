package com.alafteknoloji.pagapp.services

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

data class PAGProfileQuestionOption(
    val optionId: String = "",
    val label: String = "",
    val order: Int = 1
)

data class PAGProfileQuestion(
    val id: String = "",
    val questionText: String = "",
    val categoryId: String = "",
    val categoryName: String = "",
    val targetingGender: String = "ALL",
    val options: List<PAGProfileQuestionOption> = emptyList(),
    val profileScoreReward: Int = 10,
    val status: String = "ACTIVE",
    val showOnHome: Boolean = false
)

data class PAGProfileQuestionAnswer(
    val questionId: String = "",
    val questionText: String = "",
    val categoryId: String = "",
    val categoryName: String = "",
    val options: List<PAGProfileQuestionOption> = emptyList(),
    val selectedOptionId: String = "",
    val selectedOptionLabel: String = "",
    val updatedAt: String = ""
)

class ProfileSurveyService private constructor(context: Context) {

    private val _unansweredQuestions = MutableStateFlow<List<PAGProfileQuestion>>(emptyList())
    val unansweredQuestions: StateFlow<List<PAGProfileQuestion>> = _unansweredQuestions.asStateFlow()

    private val _answeredQuestions = MutableStateFlow<List<PAGProfileQuestionAnswer>>(emptyList())
    val answeredQuestions: StateFlow<List<PAGProfileQuestionAnswer>> = _answeredQuestions.asStateFlow()

    private val _availableScoreX = MutableStateFlow(0)
    val availableScoreX: StateFlow<Int> = _availableScoreX.asStateFlow()

    private val _hasPromotedQuestion = MutableStateFlow(false)
    val hasPromotedQuestion: StateFlow<Boolean> = _hasPromotedQuestion.asStateFlow()

    private val _hasMoreUnanswered = MutableStateFlow(false)
    val hasMoreUnanswered: StateFlow<Boolean> = _hasMoreUnanswered.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting.asStateFlow()

    private val _lastBatchScoreAwarded = MutableStateFlow(0)
    val lastBatchScoreAwarded: StateFlow<Int> = _lastBatchScoreAwarded.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    suspend fun fetchProfileQuestions(batchSize: Int = 3) {
        _isLoading.value = true
        _errorMessage.value = null

        try {
            val apiRes = PAGApiClient.get("/profile-questions")
            if (apiRes?.optBoolean("success") == true) {
                val dataObj = apiRes.optJSONObject("data") ?: JSONObject()
                _availableScoreX.value = dataObj.optInt("availableScoreX", 0)

                val unansweredArr = dataObj.optJSONArray("unansweredQuestions") ?: JSONArray()
                val parsedUnanswered = mutableListOf<PAGProfileQuestion>()

                for (i in 0 until unansweredArr.length()) {
                    val item = unansweredArr.optJSONObject(i) ?: continue
                    val optsArr = item.optJSONArray("options") ?: JSONArray()
                    val opts = mutableListOf<PAGProfileQuestionOption>()
                    for (j in 0 until optsArr.length()) {
                        val o = optsArr.optJSONObject(j) ?: continue
                        opts.add(
                            PAGProfileQuestionOption(
                                optionId = o.optString("optionId"),
                                label = o.optString("label"),
                                order = o.optInt("order", j + 1)
                            )
                        )
                    }

                    parsedUnanswered.add(
                        PAGProfileQuestion(
                            id = item.optString("id"),
                            questionText = item.optString("questionText"),
                            categoryId = item.optString("categoryId", "Genel"),
                            categoryName = item.optString("categoryName", "Genel"),
                            targetingGender = item.optString("targetingGender", "ALL"),
                            options = opts,
                            profileScoreReward = item.optInt("profileScoreReward", 10),
                            status = item.optString("status", "ACTIVE"),
                            showOnHome = item.optBoolean("showOnHome", false)
                        )
                    )
                }

                val answeredArr = dataObj.optJSONArray("answeredQuestions") ?: JSONArray()
                val parsedAnswered = mutableListOf<PAGProfileQuestionAnswer>()

                for (i in 0 until answeredArr.length()) {
                    val item = answeredArr.optJSONObject(i) ?: continue
                    val optsArr = item.optJSONArray("options") ?: JSONArray()
                    val opts = mutableListOf<PAGProfileQuestionOption>()
                    for (j in 0 until optsArr.length()) {
                        val o = optsArr.optJSONObject(j) ?: continue
                        opts.add(
                            PAGProfileQuestionOption(
                                optionId = o.optString("optionId"),
                                label = o.optString("label"),
                                order = o.optInt("order", j + 1)
                            )
                        )
                    }

                    parsedAnswered.add(
                        PAGProfileQuestionAnswer(
                            questionId = item.optString("questionId"),
                            questionText = item.optString("questionText"),
                            categoryId = item.optString("categoryId", "Genel"),
                            categoryName = item.optString("categoryName", "Genel"),
                            options = opts,
                            selectedOptionId = item.optString("selectedOptionId"),
                            selectedOptionLabel = item.optString("selectedOptionLabel"),
                            updatedAt = item.optString("updatedAt")
                        )
                    )
                }

                _unansweredQuestions.value = parsedUnanswered
                _answeredQuestions.value = parsedAnswered
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _errorMessage.value = e.localizedMessage
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun submitBatchAnswers(answers: Map<String, String>): Boolean {
        if (answers.isEmpty()) return false
        _isSubmitting.value = true
        _errorMessage.value = null

        return try {
            val answersArray = JSONArray()
            answers.forEach { (qId, optId) ->
                val obj = JSONObject().apply {
                    put("questionId", qId)
                    put("optionId", optId)
                }
                answersArray.put(obj)
            }

            val payload = JSONObject().apply {
                put("answers", answersArray)
            }

            val apiRes = PAGApiClient.post("/profile-questions", payload)
            if (apiRes?.optBoolean("success") == true) {
                val dataObj = apiRes.optJSONObject("data") ?: JSONObject()
                _lastBatchScoreAwarded.value = dataObj.optInt("batchScoreAwarded", 0)

                // Refresh questions
                fetchProfileQuestions(3)
                true
            } else {
                _errorMessage.value = apiRes?.optString("error", "Cevaplar kaydedilemedi.") ?: "Cevaplar kaydedilemedi."
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _errorMessage.value = e.localizedMessage
            false
        } finally {
            _isSubmitting.value = false
        }
    }

    suspend fun fetchAnsweredQuestions() {
        fetchProfileQuestions(3)
    }

    suspend fun updateAnswer(questionId: String, selectedOptionId: String): Boolean {
        return try {
            val answersArray = JSONArray().apply {
                put(JSONObject().apply {
                    put("questionId", questionId)
                    put("optionId", selectedOptionId)
                })
            }
            val payload = JSONObject().apply {
                put("answers", answersArray)
            }
            val apiRes = PAGApiClient.post("/profile-questions", payload)
            if (apiRes?.optBoolean("success") == true) {
                fetchProfileQuestions(3)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    companion object {
        @Volatile
        private var instance: ProfileSurveyService? = null

        fun getInstance(context: Context): ProfileSurveyService {
            return instance ?: synchronized(this) {
                instance ?: ProfileSurveyService(context.applicationContext).also { instance = it }
            }
        }
    }
}

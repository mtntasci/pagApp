package com.alafteknoloji.pagapp.services

import android.content.Context
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

data class PAGProfileQuestionOption(
    val optionId: String = "",
    val label: String = "",
    val order: Int = 1
)

data class PAGProfileQuestion(
    val id: String = "",
    val questionText: String = "",
    val categoryId: String = "",
    val categoryName: String = "Genel",
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
    val categoryName: String = "Genel",
    val options: List<PAGProfileQuestionOption> = emptyList(),
    val selectedOptionId: String = "",
    val selectedOptionLabel: String = "",
    val updatedAt: String = ""
)

class ProfileSurveyService private constructor(context: Context) {

    private val functions = FirebaseFunctions.getInstance()

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
            val payload = hashMapOf("batchSize" to batchSize)
            val result = functions.getHttpsCallable("getProfileQuestions").call(payload).await()
            val responseMap = result.getData() as? Map<*, *> ?: return

            if (responseMap["success"] == true) {
                val dataMap = responseMap["data"] as? Map<*, *> ?: return
                _availableScoreX.value = (dataMap["availableScoreX"] as? Number)?.toInt() ?: 0
                _hasPromotedQuestion.value = dataMap["hasPromotedQuestion"] as? Boolean ?: false
                _hasMoreUnanswered.value = dataMap["hasMoreUnanswered"] as? Boolean ?: false

                val rawList = dataMap["unansweredQuestions"] as? List<*> ?: emptyList<Any>()
                val parsed = mutableListOf<PAGProfileQuestion>()

                for (item in rawList) {
                    if (item is Map<*, *>) {
                        val rawOpts = item["options"] as? List<*> ?: emptyList<Any>()
                        val opts = mutableListOf<PAGProfileQuestionOption>()
                        for (o in rawOpts) {
                            if (o is Map<*, *>) {
                                opts.add(
                                    PAGProfileQuestionOption(
                                        optionId = o["optionId"] as? String ?: "",
                                        label = o["label"] as? String ?: "",
                                        order = (o["order"] as? Number)?.toInt() ?: 1
                                    )
                                )
                            }
                        }

                        parsed.add(
                            PAGProfileQuestion(
                                id = item["id"] as? String ?: "",
                                questionText = item["questionText"] as? String ?: "",
                                categoryId = item["categoryId"] as? String ?: "",
                                categoryName = item["categoryName"] as? String ?: "Genel",
                                targetingGender = item["targetingGender"] as? String ?: "ALL",
                                options = opts,
                                profileScoreReward = (item["profileScoreReward"] as? Number)?.toInt() ?: 10,
                                status = item["status"] as? String ?: "ACTIVE",
                                showOnHome = item["showOnHome"] as? Boolean ?: false
                            )
                        )
                    }
                }
                _unansweredQuestions.value = parsed
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

        val payloadArr = answers.map { (qId, optId) ->
            mapOf("questionId" to qId, "optionId" to optId)
        }

        return try {
            val result = functions.getHttpsCallable("submitProfileQuestionAnswers")
                .call(hashMapOf("answers" to payloadArr))
                .await()
            val responseMap = result.getData() as? Map<*, *> ?: return false

            if (responseMap["success"] == true) {
                val dataMap = responseMap["data"] as? Map<*, *> ?: return false
                _lastBatchScoreAwarded.value = (dataMap["batchScoreAwarded"] as? Number)?.toInt() ?: 0

                fetchProfileQuestions(3)
                fetchAnsweredQuestions()
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _errorMessage.value = "Cevaplar gönderilemedi."
            false
        } finally {
            _isSubmitting.value = false
        }
    }

    suspend fun fetchAnsweredQuestions() {
        try {
            val result = functions.getHttpsCallable("getAnsweredProfileQuestions").call().await()
            val responseMap = result.getData() as? Map<*, *> ?: return

            if (responseMap["success"] == true) {
                val dataMap = responseMap["data"] as? Map<*, *> ?: return
                val rawList = dataMap["answeredQuestions"] as? List<*> ?: emptyList<Any>()
                val parsed = mutableListOf<PAGProfileQuestionAnswer>()

                for (item in rawList) {
                    if (item is Map<*, *>) {
                        val rawOpts = item["options"] as? List<*> ?: emptyList<Any>()
                        val opts = mutableListOf<PAGProfileQuestionOption>()
                        for (o in rawOpts) {
                            if (o is Map<*, *>) {
                                opts.add(
                                    PAGProfileQuestionOption(
                                        optionId = o["optionId"] as? String ?: "",
                                        label = o["label"] as? String ?: "",
                                        order = (o["order"] as? Number)?.toInt() ?: 1
                                    )
                                )
                            }
                        }

                        parsed.add(
                            PAGProfileQuestionAnswer(
                                questionId = item["questionId"] as? String ?: "",
                                questionText = item["questionText"] as? String ?: "",
                                categoryId = item["categoryId"] as? String ?: "",
                                categoryName = item["categoryName"] as? String ?: "Genel",
                                options = opts,
                                selectedOptionId = item["selectedOptionId"] as? String ?: "",
                                selectedOptionLabel = item["selectedOptionLabel"] as? String ?: "",
                                updatedAt = item["updatedAt"] as? String ?: ""
                            )
                        )
                    }
                }
                _answeredQuestions.value = parsed
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun updateAnswer(questionId: String, selectedOptionId: String): Boolean {
        return try {
            val payload = hashMapOf("questionId" to questionId, "selectedOptionId" to selectedOptionId)
            val result = functions.getHttpsCallable("updateProfileQuestionAnswer").call(payload).await()
            val responseMap = result.getData() as? Map<*, *> ?: return false
            if (responseMap["success"] == true) {
                fetchAnsweredQuestions()
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

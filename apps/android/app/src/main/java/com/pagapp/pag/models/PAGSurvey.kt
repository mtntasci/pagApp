package com.pagapp.pag.models

data class PAGQuestionOption(
    val optionId: String,
    val label: String,
    val order: Int
)

data class PAGQuestion(
    val questionId: String,
    val order: Int,
    val type: String = "SINGLE_SELECT",
    val text: String,
    val options: List<PAGQuestionOption>
)

data class PAGSurvey(
    val surveyId: String,
    val ownerType: String = "PAG", // "PAG" | "ORGANIZATION"
    val organizationId: String? = null,
    val surveyType: String = "PAG", // "PROFILE" | "PAG" | "ORGANIZATION"
    val title: String,
    val description: String,
    val status: String = "ACTIVE",
    val startAt: String? = null,
    val endAt: String? = null,
    val questionCount: Int = 3,
    val questions: List<PAGQuestion>? = null,
    val profileScoreReward: Int = 50,
    val isCompleted: Boolean = false
) {
    val ownerDisplayName: String
        get() {
            return if (ownerType == "ORGANIZATION") {
                if (organizationId?.contains("ford") == true) {
                    "Ford Turkey"
                } else if (organizationId?.contains("mcd") == true) {
                    "McDonald's Turkey"
                } else {
                    "Kurumsal Ortak"
                }
            } else {
                "PAG Özel"
            }
        }

    val estimatedDurationText: String
        get() = "${questionCount * 1} Dakika"
}

data class PAGAnswerInput(
    val questionId: String,
    val optionId: String
)

data class PAGSurveyCompletionResult(
    val responseId: String,
    val surveyId: String,
    val completedAt: String,
    val isDuplicate: Boolean? = false,
    val profileScorePotential: Int? = 50,
    val currentProfileScore: Int? = null,
    val rewardAwarded: Int? = null,
    val rewardType: String? = null,
    val voucherCode: String? = null,
    val voucherTitle: String? = null,
    val currentRewardBalance: Int? = null
)

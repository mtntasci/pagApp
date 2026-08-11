package com.alafteknoloji.pagapp.models

data class SurveyMock(
    val id: String,
    val title: String,
    val ownerName: String,
    val profileScoreReward: Int,
    val rewardPoolText: String?,
    val estimatedDurationMinutes: Int,
    val isProfileSurvey: Boolean
) {
    companion object {
        val sampleList = listOf(
            SurveyMock(
                id = "srv-1",
                title = "Otomotiv Tercihleri & Mobilite Alışkanlıkları",
                ownerName = "Ford Turkey",
                profileScoreReward = 50,
                rewardPoolText = "1.000 TL Ödül Havuzu",
                estimatedDurationMinutes = 2,
                isProfileSurvey = false
            ),
            SurveyMock(
                id = "srv-2",
                title = "Hızlı Restoran Tüketim Alışkanlıkları",
                ownerName = "McDonald's",
                profileScoreReward = 35,
                rewardPoolText = "500 TL Ödül Havuzu",
                estimatedDurationMinutes = 3,
                isProfileSurvey = false
            ),
            SurveyMock(
                id = "srv-3",
                title = "PAG Profil Güncelleme: Teknoloji & İlgi Alanları",
                ownerName = "PAG",
                profileScoreReward = 75,
                rewardPoolText = null,
                estimatedDurationMinutes = 1,
                isProfileSurvey = true
            )
        )
    }
}

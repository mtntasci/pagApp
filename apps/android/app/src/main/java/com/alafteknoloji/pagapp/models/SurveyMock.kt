package com.alafteknoloji.pagapp.models

import java.util.Date
import java.util.UUID

enum class SurveyCategory(val title: String) {
    FOR_YOU("Sana Uygun"),
    NEW("Yeni"),
    COMPLETED("Tamamlanan")
}

enum class SurveyStatus(val title: String) {
    ACTIVE("Aktif"),
    COMPLETED("Tamamlandı"),
    EXPIRED("Süresi Doldu")
}

data class SurveyMock(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val ownerName: String,
    val description: String,
    val profileScoreReward: Int,
    val rewardPoolText: String?,
    val estimatedDurationMinutes: Int,
    val isProfileSurvey: Boolean,
    val category: SurveyCategory,
    val status: SurveyStatus,
    val endDate: Date?,
    val questions: List<QuestionMock>
) {
    companion object {
        val sampleQuestions = listOf(
            QuestionMock(text = "Bu markayı ne sıklıkla tercih ediyorsunuz?", options = listOf("Her gün", "Haftada birkaç kez", "Ayda bir", "Nadir")),
            QuestionMock(text = "En çok hangi ürünü tüketiyorsunuz?", options = listOf("Kahve", "Tatlı", "Soğuk İçecek", "Diğer")),
            QuestionMock(text = "Fiyat/performans oranını nasıl buluyorsunuz?", options = listOf("Çok İyi", "İyi", "Orta", "Kötü"))
        )

        val sampleList = listOf(
            SurveyMock(
                id = "srv-1",
                title = "PAG Genel Araştırması",
                ownerName = "PAG",
                description = "Mobil uygulama alışkanlıklarınızı ve beklentilerinizi anlamak için kısa bir araştırma.",
                profileScoreReward = 50,
                rewardPoolText = "1.000 TL Ödül Havuzu",
                estimatedDurationMinutes = 2,
                isProfileSurvey = false,
                category = SurveyCategory.FOR_YOU,
                status = SurveyStatus.ACTIVE,
                endDate = Date(System.currentTimeMillis() + 86400 * 2000),
                questions = sampleQuestions
            ),
            SurveyMock(
                id = "srv-2",
                title = "Hızlı Restoran Tüketim Alışkanlıkları",
                ownerName = "McDonald's",
                description = "Hızlı tüketim restoranlarındaki tercihlerinizi ölçümleyen pazar araştırması.",
                profileScoreReward = 35,
                rewardPoolText = "Hediye Çeki",
                estimatedDurationMinutes = 3,
                isProfileSurvey = false,
                category = SurveyCategory.NEW,
                status = SurveyStatus.ACTIVE,
                endDate = Date(System.currentTimeMillis() + 86400 * 5000),
                questions = sampleQuestions
            ),
            SurveyMock(
                id = "srv-3",
                title = "Otomotiv Tercihleri & Mobilite",
                ownerName = "Ford",
                description = "Geleceğin mobilite çözümleri hakkında kullanıcı görüşleri.",
                profileScoreReward = 75,
                rewardPoolText = "500 TL Ödül Havuzu",
                estimatedDurationMinutes = 1,
                isProfileSurvey = false,
                category = SurveyCategory.COMPLETED,
                status = SurveyStatus.COMPLETED,
                endDate = null,
                questions = sampleQuestions
            ),
            SurveyMock(
                id = "srv-4",
                title = "PAG Profil Güncelleme: Teknoloji & İlgi Alanları",
                ownerName = "PAG",
                description = "Sana daha uygun anketler sunabilmemiz için profilini güncelle.",
                profileScoreReward = 25,
                rewardPoolText = null,
                estimatedDurationMinutes = 1,
                isProfileSurvey = true,
                category = SurveyCategory.FOR_YOU,
                status = SurveyStatus.ACTIVE,
                endDate = null,
                questions = listOf(
                    QuestionMock(text = "Hangi mobil işletim sistemini tercih ediyorsunuz?", options = listOf("iOS", "Android", "Diğer")),
                    QuestionMock(text = "Günlük akıllı telefon kullanım süreniz nedir?", options = listOf("1-2 saat", "3-5 saat", "5 saatten fazla")),
                    QuestionMock(text = "En çok hangi uygulama kategorisini kullanıyorsunuz?", options = listOf("Sosyal Medya", "Oyun", "Finans", "Eğitim"))
                )
            )
        )
    }
}

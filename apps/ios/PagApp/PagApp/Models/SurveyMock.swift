import Foundation

public enum SurveyCategory: String {
    case forYou = "Sana Uygun"
    case new = "Yeni"
    case completed = "Tamamlanan"
}

public enum SurveyStatus: String {
    case active = "Aktif"
    case completed = "Tamamlandı"
    case expired = "Süresi Doldu"
}

public struct SurveyMock: Identifiable {
    public let id: String
    public let title: String
    public let ownerName: String
    public let description: String
    public let profileScoreReward: Int
    public let rewardPoolText: String?
    public let estimatedDurationMinutes: Int
    public let isProfileSurvey: Bool
    public let category: SurveyCategory
    public let status: SurveyStatus
    public let endDate: Date?
    public let questions: [QuestionMock]
    
    public static let sampleQuestions = [
        QuestionMock(text: "Bu markayı ne sıklıkla tercih ediyorsunuz?", options: ["Her gün", "Haftada birkaç kez", "Ayda bir", "Nadir"]),
        QuestionMock(text: "En çok hangi ürünü tüketiyorsunuz?", options: ["Kahve", "Tatlı", "Soğuk İçecek", "Diğer"]),
        QuestionMock(text: "Fiyat/performans oranını nasıl buluyorsunuz?", options: ["Çok İyi", "İyi", "Orta", "Kötü"])
    ]
    
    public static let sampleList: [SurveyMock] = [
        SurveyMock(
            id: "srv-1",
            title: "PAG Genel Araştırması",
            ownerName: "PAG",
            description: "Mobil uygulama alışkanlıklarınızı ve beklentilerinizi anlamak için kısa bir araştırma.",
            profileScoreReward: 50,
            rewardPoolText: "1.000 TL Ödül Havuzu",
            estimatedDurationMinutes: 2,
            isProfileSurvey: false,
            category: .forYou,
            status: .active,
            endDate: Date().addingTimeInterval(86400 * 2), // 2 days from now
            questions: sampleQuestions
        ),
        SurveyMock(
            id: "srv-2",
            title: "Hızlı Restoran Tüketim Alışkanlıkları",
            ownerName: "McDonald's",
            description: "Hızlı tüketim restoranlarındaki tercihlerinizi ölçümleyen pazar araştırması.",
            profileScoreReward: 35,
            rewardPoolText: "Hediye Çeki",
            estimatedDurationMinutes: 3,
            isProfileSurvey: false,
            category: .new,
            status: .active,
            endDate: Date().addingTimeInterval(86400 * 5),
            questions: sampleQuestions
        ),
        SurveyMock(
            id: "srv-3",
            title: "Otomotiv Tercihleri & Mobilite",
            ownerName: "Ford",
            description: "Geleceğin mobilite çözümleri hakkında kullanıcı görüşleri.",
            profileScoreReward: 75,
            rewardPoolText: "500 TL Ödül Havuzu",
            estimatedDurationMinutes: 1,
            isProfileSurvey: false,
            category: .completed,
            status: .completed,
            endDate: nil,
            questions: sampleQuestions
        ),
        SurveyMock(
            id: "srv-4",
            title: "PAG Profil Güncelleme: Teknoloji & İlgi Alanları",
            ownerName: "PAG",
            description: "Sana daha uygun anketler sunabilmemiz için profilini güncelle.",
            profileScoreReward: 25,
            rewardPoolText: nil,
            estimatedDurationMinutes: 1,
            isProfileSurvey: true,
            category: .forYou,
            status: .active,
            endDate: nil,
            questions: [
                QuestionMock(text: "Hangi mobil işletim sistemini tercih ediyorsunuz?", options: ["iOS", "Android", "Diğer"]),
                QuestionMock(text: "Günlük akıllı telefon kullanım süreniz nedir?", options: ["1-2 saat", "3-5 saat", "5 saatten fazla"]),
                QuestionMock(text: "En çok hangi uygulama kategorisini kullanıyorsunuz?", options: ["Sosyal Medya", "Oyun", "Finans", "Eğitim"])
            ]
        )
    ]
}

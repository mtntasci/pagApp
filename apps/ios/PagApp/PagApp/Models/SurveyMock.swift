import Foundation

public struct SurveyMock: Identifiable {
    public let id: String
    public let title: String
    public let ownerName: String
    public let profileScoreReward: Int
    public let rewardPoolText: String?
    public let estimatedDurationMinutes: Int
    public let isProfileSurvey: Bool
    
    public static let sampleList: [SurveyMock] = [
        SurveyMock(
            id: "srv-1",
            title: "Otomotiv Tercihleri & Mobilite Alışkanlıkları",
            ownerName: "Ford Turkey",
            profileScoreReward: 50,
            rewardPoolText: "1.000 TL Ödül Havuzu",
            estimatedDurationMinutes: 2,
            isProfileSurvey: false
        ),
        SurveyMock(
            id: "srv-2",
            title: "Hızlı Restoran Tüketim Alışkanlıkları",
            ownerName: "McDonald's",
            profileScoreReward: 35,
            rewardPoolText: "500 TL Ödül Havuzu",
            estimatedDurationMinutes: 3,
            isProfileSurvey: false
        ),
        SurveyMock(
            id: "srv-3",
            title: "PAG Profil Güncelleme: Teknoloji & İlgi Alanları",
            ownerName: "PAG",
            profileScoreReward: 75,
            rewardPoolText: nil,
            estimatedDurationMinutes: 1,
            isProfileSurvey: true
        )
    ]
}

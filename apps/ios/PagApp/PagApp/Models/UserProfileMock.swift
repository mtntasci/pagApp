import Foundation

public struct UserProfileMock: Identifiable {
    public let id: String = UUID().uuidString
    public let name: String
    public let profileScore: Int
    public let rankingAdvantageText: String
    public let rankingPercentileText: String
    
    public static let sample = UserProfileMock(
        name: "Metin",
        profileScore: 12480,
        rankingAdvantageText: "Öncelikli Sıra",
        rankingPercentileText: "İlk %8"
    )
}

import Foundation

public enum StoryType: String, Hashable, Equatable {
    case survey = "SURVEY"
    case earnProfileScore = "EARN_PROFILE_SCORE"
}

public struct StoryMock: Identifiable, Hashable, Equatable {
    public let id: String
    public let type: StoryType
    public let surveyId: String?
    public let image: String
    public let imageUrl: String?
    public let shortLabel: String
    public let position: Int
    public let isActive: Bool
    public let startAt: Date?
    public let endAt: Date?
    
    public init(id: String, type: StoryType, surveyId: String? = nil, image: String, imageUrl: String? = nil, shortLabel: String, position: Int, isActive: Bool = true, startAt: Date? = nil, endAt: Date? = nil) {
        self.id = id
        self.type = type
        self.surveyId = surveyId
        self.image = image
        self.imageUrl = imageUrl
        self.shortLabel = shortLabel
        self.position = position
        self.isActive = isActive
        self.startAt = startAt
        self.endAt = endAt
    }
    
    public static let sampleList: [StoryMock] = [
        StoryMock(id: "st-1", type: .survey, surveyId: "srv-2", image: "story_coffee", shortLabel: "Kahve", position: 1),
        StoryMock(id: "st-2", type: .survey, surveyId: "srv-3", image: "story_auto", shortLabel: "Otomotiv", position: 2),
        StoryMock(id: "st-3", type: .earnProfileScore, image: "story_score", shortLabel: "Puan Kazan", position: 3),
        StoryMock(id: "st-4", type: .survey, surveyId: "srv-1", image: "story_tech", shortLabel: "Teknoloji", position: 4)
    ]
}

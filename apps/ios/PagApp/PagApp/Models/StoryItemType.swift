import Foundation

public enum StoryItemType: Hashable {
    case home
    case survey(SurveyMock)
    case earnProfileScore
}

import Foundation
import FirebaseFunctions
import Combine

@MainActor
public class StoryService: ObservableObject {
    public static let shared = StoryService()
    
    @Published public private(set) var stories: [StoryMock] = []
    @Published public private(set) var isLoading: Bool = false
    
    private init() {}
    
    public func fetchStories() async {
        self.isLoading = true
        do {
            if let response = try? await PAGApiClient.shared.get(endpoint: "/home"),
               let success = response["success"] as? Bool, success,
               let dataDict = response["data"] as? [String: Any],
               let rawList = dataDict["stories"] as? [[String: Any]] {
                
                var parsed: [StoryMock] = []
                for (idx, item) in rawList.enumerated() {
                    let sid = (item["surveyId"] as? String) ?? UUID().uuidString
                    let surveyId = item["surveyId"] as? String
                    let label = (item["label"] as? String) ?? (item["title"] as? String) ?? "Anket"
                    let imageCategory = (item["category"] as? String) ?? "story_tech"
                    
                    parsed.append(StoryMock(
                        id: sid,
                        type: .survey,
                        surveyId: surveyId,
                        image: imageCategory,
                        imageUrl: nil,
                        shortLabel: label,
                        position: idx + 1,
                        isActive: true
                    ))
                }
                self.stories = parsed
            } else {
                self.stories = []
            }
        } catch {
            print("[StoryService] fetchStories error: \(error.localizedDescription)")
            self.stories = []
        }
        self.isLoading = false
    }
}

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
            // 1. Try High-Speed REST API (~10ms)
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
                self.isLoading = false
                return
            }

            // 2. Fallback to Firebase Callable
            let result = try await Functions.functions().httpsCallable("getEligibleStories").call()
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success,
                  let dataDict = dict["data"] as? [String: Any],
                  let rawList = dataDict["stories"] as? [[String: Any]] else {
                self.stories = []
                self.isLoading = false
                return
            }
            
            var parsed: [StoryMock] = []
            for item in rawList {
                let sid = (item["storyId"] as? String) ?? (item["id"] as? String) ?? UUID().uuidString
                let surveyId = item["surveyId"] as? String
                let label = (item["shortLabel"] as? String) ?? (item["label"] as? String) ?? "Anket"
                let imageUrl = item["imageUrl"] as? String
                let imageCategory = (item["imageCategory"] as? String) ?? "story_tech"
                let pos = item["position"] as? Int ?? 1
                let isActive = item["isActive"] as? Bool ?? true
                
                parsed.append(StoryMock(
                    id: sid,
                    type: .survey,
                    surveyId: surveyId,
                    image: imageCategory,
                    imageUrl: imageUrl,
                    shortLabel: label,
                    position: pos,
                    isActive: isActive
                ))
            }
            self.stories = parsed
        } catch {
            print("[StoryService] fetchStories error: \(error.localizedDescription)")
            self.stories = []
        }
        self.isLoading = false
    }
}

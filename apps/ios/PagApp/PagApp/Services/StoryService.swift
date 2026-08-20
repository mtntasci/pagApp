import Foundation
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
            let response = try await PAGApiClient.shared.get(endpoint: "/home")
            if let success = response["success"] as? Bool, success,
               let dataDict = response["data"] as? [String: Any],
               let rawList = dataDict["stories"] as? [[String: Any]] {
                
                var parsed: [StoryMock] = []
                for (idx, item) in rawList.enumerated() {
                    let sid = (item["surveyId"] as? String) ?? (item["id"] as? String) ?? UUID().uuidString
                    let surveyId = item["surveyId"] as? String ?? item["id"] as? String
                    let label = (item["label"] as? String) ?? (item["shortLabel"] as? String) ?? (item["title"] as? String) ?? "Anket"
                    let imageCategory = (item["category"] as? String) ?? (item["imageCategory"] as? String) ?? "Genel"
                    let imageUrl = item["imageUrl"] as? String
                    let pos = (item["position"] as? Int) ?? (item["sortOrder"] as? Int) ?? (idx + 1)
                    
                    parsed.append(StoryMock(
                        id: sid,
                        type: .survey,
                        surveyId: surveyId,
                        image: imageCategory,
                        imageUrl: imageUrl,
                        shortLabel: label,
                        position: pos,
                        isActive: true
                    ))
                }
                self.stories = parsed.sorted { $0.position < $1.position }
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

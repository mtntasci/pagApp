import Foundation
import Combine

public struct PendingVerificationSurvey: Identifiable {
    public var id: String { assignmentId }
    public let assignmentId: String
    public let verificationSurveyId: String
    public let masterSurveyId: String
    public let masterSurveyTitle: String
    public let title: String
    public let description: String
    public let rewardSummary: String
    public let questionCount: Int
    public let questions: [PAGQuestion]
}

@MainActor
public class VerificationService: ObservableObject {
    public static let shared = VerificationService()
    
    @Published public private(set) var pendingVerification: PendingVerificationSurvey? = nil
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var isSubmitting: Bool = false
    @Published public private(set) var errorMessage: String? = nil
    
    private init() {}
    
    public func checkPendingVerification() async {
        self.isLoading = false
        self.pendingVerification = nil
    }
    
    public func submitVerificationAnswer(surveyId: String, questionId: String, optionId: String) async throws -> Bool {
        self.isSubmitting = true
        self.errorMessage = nil
        
        do {
            let payload: [String: Any] = [
                "answers": [
                    ["questionId": questionId, "optionId": optionId]
                ]
            ]
            let result = try await PAGApiClient.shared.post(endpoint: "/surveys/\(surveyId)/submit", body: payload)
            guard let success = result["success"] as? Bool, success else {
                throw NSError(domain: "VerificationService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Yanıt kaydedilemedi."])
            }
            
            self.pendingVerification = nil
            self.isSubmitting = false
            return true
        } catch {
            self.isSubmitting = false
            self.errorMessage = error.localizedDescription
            throw error
        }
    }
    
    public func dismissForNow() {
        self.pendingVerification = nil
    }
}

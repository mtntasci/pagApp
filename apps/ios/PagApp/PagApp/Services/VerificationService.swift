import Foundation
import FirebaseFunctions
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
        self.isLoading = true
        self.errorMessage = nil
        
        do {
            let result = try await Functions.functions().httpsCallable("getPendingVerificationSurvey").call()
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success,
                  let dataDict = dict["data"] as? [String: Any] else {
                self.isLoading = false
                return
            }
            
            let hasPending = dataDict["hasPendingVerification"] as? Bool ?? false
            if hasPending, let pendingData = dataDict["pendingSurvey"] as? [String: Any] {
                var questionsList: [PAGQuestion] = []
                if let rawQuestions = pendingData["questions"] as? [[String: Any]] {
                    for qItem in rawQuestions {
                        var parsedOptions: [PAGQuestionOption] = []
                        if let rawOptions = qItem["options"] as? [[String: Any]] {
                            for optItem in rawOptions {
                                parsedOptions.append(PAGQuestionOption(
                                    optionId: optItem["optionId"] as? String ?? optItem["id"] as? String ?? "opt_1",
                                    label: optItem["label"] as? String ?? "",
                                    order: optItem["order"] as? Int ?? 1
                                ))
                            }
                        }
                        questionsList.append(PAGQuestion(
                            questionId: qItem["questionId"] as? String ?? qItem["id"] as? String ?? "vq1",
                            order: qItem["order"] as? Int ?? 1,
                            type: qItem["type"] as? String ?? "SINGLE_SELECT",
                            text: qItem["text"] as? String ?? qItem["questionText"] as? String ?? "",
                            options: parsedOptions
                        ))
                    }
                }
                
                self.pendingVerification = PendingVerificationSurvey(
                    assignmentId: pendingData["assignmentId"] as? String ?? "",
                    verificationSurveyId: pendingData["verificationSurveyId"] as? String ?? "",
                    masterSurveyId: pendingData["masterSurveyId"] as? String ?? "",
                    masterSurveyTitle: pendingData["masterSurveyTitle"] as? String ?? "Anket",
                    title: pendingData["title"] as? String ?? "Kalite Doğrulama",
                    description: pendingData["description"] as? String ?? "",
                    rewardSummary: pendingData["rewardSummary"] as? String ?? "250 TL Hediye Çeki",
                    questionCount: pendingData["questionCount"] as? Int ?? 1,
                    questions: questionsList
                )
            } else {
                self.pendingVerification = nil
            }
            self.isLoading = false
        } catch {
            print("[VerificationService] Check pending error: \(error.localizedDescription)")
            self.pendingVerification = nil
            self.isLoading = false
        }
    }
    
    public func submitVerificationAnswer(surveyId: String, questionId: String, optionId: String) async throws -> Bool {
        self.isSubmitting = true
        self.errorMessage = nil
        
        do {
            let payload: [String: Any] = [
                "surveyId": surveyId,
                "answers": [
                    ["questionId": questionId, "optionId": optionId]
                ]
            ]
            let result = try await Functions.functions().httpsCallable("submitSurveyResponse").call(payload)
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success else {
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

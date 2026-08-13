import Foundation
import Combine
import FirebaseFunctions

public struct PAGProfileQuestionOption: Identifiable, Codable {
    public var id: String { optionId }
    public let optionId: String
    public let label: String
    public let order: Int
}

public struct PAGProfileQuestion: Identifiable, Codable {
    public let id: String
    public let questionText: String
    public let categoryId: String
    public let categoryName: String
    public let targetingGender: String
    public let options: [PAGProfileQuestionOption]
    public let profileScoreReward: Int
    public let status: String
    public let showOnHome: Bool
}

public struct PAGProfileQuestionAnswer: Identifiable, Codable {
    public var id: String { questionId }
    public let questionId: String
    public let questionText: String
    public let categoryId: String
    public let categoryName: String
    public let options: [PAGProfileQuestionOption]
    public var selectedOptionId: String
    public var selectedOptionLabel: String
    public let updatedAt: String
}

@MainActor
public class ProfileSurveyService: ObservableObject {
    public static let shared = ProfileSurveyService()
    
    @Published public private(set) var unansweredQuestions: [PAGProfileQuestion] = []
    @Published public private(set) var answeredQuestions: [PAGProfileQuestionAnswer] = []
    @Published public private(set) var availableScoreX: Int = 0
    @Published public private(set) var hasPromotedQuestion: Bool = false
    @Published public private(set) var hasMoreUnanswered: Bool = false
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var isSubmitting: Bool = false
    @Published public private(set) var lastBatchScoreAwarded: Int = 0
    @Published public private(set) var errorMessage: String? = nil
    
    private init() {}
    
    public func fetchProfileQuestions(batchSize: Int = 3) async {
        self.isLoading = true
        self.errorMessage = nil
        
        do {
            let result = try await Functions.functions().httpsCallable("getProfileQuestions").call(["batchSize": batchSize])
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success,
                  let dataDict = dict["data"] as? [String: Any] else {
                throw NSError(domain: "ProfileSurveyService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Profil soruları alınamadı."])
            }
            
            self.availableScoreX = dataDict["availableScoreX"] as? Int ?? 0
            self.hasPromotedQuestion = dataDict["hasPromotedQuestion"] as? Bool ?? false
            self.hasMoreUnanswered = dataDict["hasMoreUnanswered"] as? Bool ?? false
            
            var parsedQuestions: [PAGProfileQuestion] = []
            if let rawArr = dataDict["unansweredQuestions"] as? [[String: Any]] {
                for item in rawArr {
                    var opts: [PAGProfileQuestionOption] = []
                    if let rawOpts = item["options"] as? [[String: Any]] {
                        for o in rawOpts {
                            opts.append(PAGProfileQuestionOption(
                                optionId: o["optionId"] as? String ?? "",
                                label: o["label"] as? String ?? "",
                                order: o["order"] as? Int ?? 1
                            ))
                        }
                    }
                    
                    parsedQuestions.append(PAGProfileQuestion(
                        id: item["id"] as? String ?? "",
                        questionText: item["questionText"] as? String ?? "",
                        categoryId: item["categoryId"] as? String ?? "",
                        categoryName: item["categoryName"] as? String ?? "Genel",
                        targetingGender: item["targetingGender"] as? String ?? "ALL",
                        options: opts,
                        profileScoreReward: item["profileScoreReward"] as? Int ?? 10,
                        status: item["status"] as? String ?? "ACTIVE",
                        showOnHome: item["showOnHome"] as? Bool ?? false
                    ))
                }
            }
            
            self.unansweredQuestions = parsedQuestions
            self.isLoading = false
        } catch {
            print("[ProfileSurveyService] Fetch questions error: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            self.isLoading = false
        }
    }
    
    public func submitBatchAnswers(answers: [String: String]) async -> Bool {
        guard !answers.isEmpty else { return false }
        self.isSubmitting = true
        self.errorMessage = nil
        
        var payloadArr: [[String: String]] = []
        for (qId, optId) in answers {
            payloadArr.append(["questionId": qId, "optionId": optId])
        }
        
        do {
            let result = try await Functions.functions().httpsCallable("submitProfileQuestionAnswers").call(["answers": payloadArr])
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success,
                  let dataDict = dict["data"] as? [String: Any] else {
                throw NSError(domain: "ProfileSurveyService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Cevaplar kaydedilemedi."])
            }
            
            self.lastBatchScoreAwarded = dataDict["batchScoreAwarded"] as? Int ?? 0
            _ = dataDict["currentProfileScore"] as? Int ?? 0
            
            // Update RewardService profile score
            await RewardService.shared.fetchUserRewards()
            
            // Re-fetch remaining questions & answered list
            await fetchProfileQuestions(batchSize: 3)
            await fetchAnsweredQuestions()
            
            self.isSubmitting = false
            return true
        } catch {
            print("[ProfileSurveyService] Submit batch error: \(error.localizedDescription)")
            self.errorMessage = "Cevaplar gönderilirken hata oluştu."
            self.isSubmitting = false
            return false
        }
    }
    
    public func fetchAnsweredQuestions() async {
        do {
            let result = try await Functions.functions().httpsCallable("getAnsweredProfileQuestions").call()
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success,
                  let dataDict = dict["data"] as? [String: Any] else { return }
            
            var parsedAnswered: [PAGProfileQuestionAnswer] = []
            if let rawArr = dataDict["answeredQuestions"] as? [[String: Any]] {
                for item in rawArr {
                    var opts: [PAGProfileQuestionOption] = []
                    if let rawOpts = item["options"] as? [[String: Any]] {
                        for o in rawOpts {
                            opts.append(PAGProfileQuestionOption(
                                optionId: o["optionId"] as? String ?? "",
                                label: o["label"] as? String ?? "",
                                order: o["order"] as? Int ?? 1
                            ))
                        }
                    }
                    
                    parsedAnswered.append(PAGProfileQuestionAnswer(
                        questionId: item["questionId"] as? String ?? "",
                        questionText: item["questionText"] as? String ?? "",
                        categoryId: item["categoryId"] as? String ?? "",
                        categoryName: item["categoryName"] as? String ?? "Genel",
                        options: opts,
                        selectedOptionId: item["selectedOptionId"] as? String ?? "",
                        selectedOptionLabel: item["selectedOptionLabel"] as? String ?? "",
                        updatedAt: item["updatedAt"] as? String ?? ""
                    ))
                }
            }
            
            self.answeredQuestions = parsedAnswered
        } catch {
            print("[ProfileSurveyService] Fetch answered error: \(error.localizedDescription)")
        }
    }
    
    public func updateAnswer(questionId: String, selectedOptionId: String) async -> Bool {
        do {
            let result = try await Functions.functions().httpsCallable("updateProfileQuestionAnswer").call([
                "questionId": questionId,
                "selectedOptionId": selectedOptionId
            ])
            
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success else { return false }
            
            await fetchAnsweredQuestions()
            return true
        } catch {
            print("[ProfileSurveyService] Update answer error: \(error.localizedDescription)")
            return false
        }
    }
}

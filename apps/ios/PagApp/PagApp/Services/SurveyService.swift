import Foundation
import Combine

@MainActor
public class SurveyService: ObservableObject {
    public static let shared = SurveyService()
    
    @Published public private(set) var eligibleSurveys: [PAGSurvey] = []
    @Published public private(set) var completedSurveys: [PAGSurvey] = []
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var errorMessage: String? = nil
    
    private init() {}
    
    public func fetchEligibleSurveys() async {
        self.isLoading = true
        self.errorMessage = nil
        
        do {
            let response = try await PAGApiClient.shared.get(endpoint: "/home")
            if let success = response["success"] as? Bool, success,
               let data = response["data"] as? [String: Any],
               let rawSurveys = data["surveys"] as? [[String: Any]] {
                
                var parsedList: [PAGSurvey] = []
                for item in rawSurveys {
                    if let surveyId = item["id"] as? String ?? item["surveyId"] as? String,
                       let title = item["title"] as? String {
                        
                        var qList: [PAGQuestion] = []
                        if let rawQs = item["questions"] as? [[String: Any]] {
                            for (qIdx, q) in rawQs.enumerated() {
                                let qId = q["questionId"] as? String ?? "q\(qIdx + 1)"
                                let qText = q["text"] as? String ?? ""
                                var options: [PAGQuestionOption] = []
                                if let rawOpts = q["options"] as? [String] {
                                    for (oIdx, optText) in rawOpts.enumerated() {
                                        options.append(PAGQuestionOption(optionId: "opt_\(oIdx + 1)", label: optText, order: oIdx + 1))
                                    }
                                } else if let rawOptObjects = q["options"] as? [[String: Any]] {
                                    for (oIdx, optObj) in rawOptObjects.enumerated() {
                                        let oId = optObj["optionId"] as? String ?? optObj["id"] as? String ?? "opt_\(oIdx + 1)"
                                        let oLabel = optObj["label"] as? String ?? optObj["text"] as? String ?? "Seçenek \(oIdx + 1)"
                                        let oOrder = optObj["order"] as? Int ?? (oIdx + 1)
                                        options.append(PAGQuestionOption(optionId: oId, label: oLabel, order: oOrder))
                                    }
                                } else if let rawOptAny = q["options"] as? [Any] {
                                    for (oIdx, item) in rawOptAny.enumerated() {
                                        if let str = item as? String {
                                            options.append(PAGQuestionOption(optionId: "opt_\(oIdx + 1)", label: str, order: oIdx + 1))
                                        } else if let dict = item as? [String: Any] {
                                            let oId = dict["optionId"] as? String ?? dict["id"] as? String ?? "opt_\(oIdx + 1)"
                                            let oLabel = dict["label"] as? String ?? dict["text"] as? String ?? "Seçenek \(oIdx + 1)"
                                            let oOrder = dict["order"] as? Int ?? (oIdx + 1)
                                            options.append(PAGQuestionOption(optionId: oId, label: oLabel, order: oOrder))
                                        }
                                    }
                                }
                                
                                if options.isEmpty {
                                    options = [
                                        PAGQuestionOption(optionId: "opt_1", label: "Evet / Katılıyorum", order: 1),
                                        PAGQuestionOption(optionId: "opt_2", label: "Hayır / Katılmıyorum", order: 2)
                                    ]
                                }
                                
                                qList.append(PAGQuestion(questionId: qId, order: qIdx + 1, type: "SINGLE_SELECT", text: qText, options: options))
                            }
                        }
                        
                        let survey = PAGSurvey(
                            surveyId: surveyId,
                            ownerType: item["ownerType"] as? String ?? "PAG",
                            organizationId: item["organizationId"] as? String,
                            surveyType: item["surveyType"] as? String ?? "PAG",
                            title: title,
                            description: item["description"] as? String ?? "",
                            status: item["status"] as? String ?? "ACTIVE",
                            questionCount: qList.count > 0 ? qList.count : 3,
                            questions: qList,
                            profileScoreReward: item["profileScoreReward"] as? Int ?? 50,
                            isCompleted: false,
                            isHighlighted: item["isHighlighted"] as? Bool ?? false
                        )
                        parsedList.append(survey)
                    }
                }
                
                self.eligibleSurveys = parsedList
            } else {
                self.eligibleSurveys = []
            }
            self.isLoading = false
        } catch {
            print("[SurveyService] Fetch eligible surveys error: \(error.localizedDescription)")
            self.eligibleSurveys = []
            self.isLoading = false
        }
    }

    public func fetchCompletedSurveys() async {
        do {
            if let response = try? await PAGApiClient.shared.get(endpoint: "/surveys/completed"),
               let success = response["success"] as? Bool, success,
               let data = response["data"] as? [String: Any],
               let rawSurveys = data["completedSurveys"] as? [[String: Any]] {
                
                var parsedList: [PAGSurvey] = []
                for item in rawSurveys {
                    if let surveyId = item["surveyId"] as? String ?? item["id"] as? String,
                       let title = item["title"] as? String {
                        let survey = PAGSurvey(
                            surveyId: surveyId,
                            ownerType: item["ownerType"] as? String ?? "PAG",
                            organizationId: item["organizationId"] as? String,
                            surveyType: item["surveyType"] as? String ?? "PAG",
                            title: title,
                            description: item["description"] as? String ?? "",
                            status: "COMPLETED",
                            questionCount: item["questionCount"] as? Int ?? 3,
                            questions: [],
                            profileScoreReward: item["profileScoreReward"] as? Int ?? 50,
                            isCompleted: true,
                            isHighlighted: false
                        )
                        parsedList.append(survey)
                    }
                }
                self.completedSurveys = parsedList
            }
        } catch {
            print("[SurveyService] Fetch completed error: \(error.localizedDescription)")
        }
    }
    
    public func getSurveyById(surveyId: String) throws -> PAGSurvey {
        if let found = eligibleSurveys.first(where: { $0.surveyId == surveyId }) {
            return found
        }
        if let found = completedSurveys.first(where: { $0.surveyId == surveyId }) {
            return found
        }
        throw NSError(domain: "SurveyService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Anket bulunamadı veya pasif durumda."])
    }
    
    public func fetchSurveyDetail(surveyId: String) async throws -> PAGSurvey {
        if let found = eligibleSurveys.first(where: { $0.surveyId == surveyId }) {
            return found
        }
        if let found = completedSurveys.first(where: { $0.surveyId == surveyId }) {
            return found
        }
        await fetchEligibleSurveys()
        return try getSurveyById(surveyId: surveyId)
    }
    
    public func submitSurveyResponse(surveyId: String, answers: [PAGAnswerInput], isProfile: Bool = false) async throws -> PAGSurveyCompletionResult {
        let answerDicts = answers.map { ["questionId": $0.questionId, "optionId": $0.optionId] }
        
        let apiResult = try await PAGApiClient.shared.post(
            endpoint: "/surveys/\(surveyId)/submit",
            body: ["answers": Array(answerDicts.prefix(3))]
        )
        
        guard let success = apiResult["success"] as? Bool, success,
              let dataDict = apiResult["data"] as? [String: Any] else {
            let errMsg = apiResult["error"] as? String ?? "Tamamlama işlemi başarısız."
            throw NSError(domain: "SurveyService", code: 400, userInfo: [NSLocalizedDescriptionKey: errMsg])
        }
        
        let scoreAwarded = dataDict["earnedScore"] as? Int ?? 50
        let currentScore = dataDict["profileScore"] as? Int
        let earnedReward = dataDict["earnedReward"] as? [String: Any]
        let prizeAmount = earnedReward?["amount"] as? Int
        let prizeType = earnedReward?["type"] as? String
        let vCode = earnedReward?["code"] as? String
        let vTitle = earnedReward?["poolName"] as? String
        let currentRewardBalance = Int(Double(dataDict["rewardBalance"] as? String ?? "0") ?? 0)
        
        await fetchEligibleSurveys()
        await UserService.shared.bootstrapCurrentUser()
        
        return PAGSurveyCompletionResult(
            responseId: "\(surveyId)_submitted",
            surveyId: surveyId,
            completedAt: ISO8601DateFormatter().string(from: Date()),
            isDuplicate: false,
            profileScorePotential: scoreAwarded,
            currentProfileScore: currentScore,
            rewardAwarded: prizeAmount,
            rewardType: prizeType,
            voucherCode: vCode,
            voucherTitle: vTitle,
            currentRewardBalance: currentRewardBalance
        )
    }
}

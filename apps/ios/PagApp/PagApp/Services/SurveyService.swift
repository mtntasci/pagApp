import Foundation
import FirebaseFunctions
import Combine

@MainActor
public class SurveyService: ObservableObject {
    public static let shared = SurveyService()
    
    @Published public private(set) var eligibleSurveys: [PAGSurvey] = []
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var errorMessage: String? = nil
    
    private init() {}
    
    public func fetchEligibleSurveys() async {
        self.isLoading = true
        self.errorMessage = nil
        
        do {
            let result = try await Functions.functions().httpsCallable("getEligibleSurveys").call()
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success,
                  let dataDict = dict["data"] as? [String: Any],
                  let rawSurveys = dataDict["surveys"] as? [[String: Any]] else {
                throw NSError(domain: "SurveyService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Sunucudan geçersiz yanıt alındı."])
            }
            
            var parsedList: [PAGSurvey] = []
            for item in rawSurveys {
                if let surveyId = item["surveyId"] as? String,
                   let title = item["title"] as? String,
                   let description = item["description"] as? String {
                    let survey = PAGSurvey(
                        surveyId: surveyId,
                        ownerType: item["ownerType"] as? String ?? "PAG",
                        organizationId: item["organizationId"] as? String,
                        surveyType: item["surveyType"] as? String ?? "PAG",
                        title: title,
                        description: description,
                        status: item["status"] as? String ?? "ACTIVE",
                        questionCount: item["questionCount"] as? Int ?? 3,
                        profileScoreReward: item["profileScoreReward"] as? Int ?? 50,
                        isCompleted: item["isCompleted"] as? Bool ?? false
                    )
                    parsedList.append(survey)
                }
            }
            
            self.eligibleSurveys = parsedList
            self.isLoading = false
        } catch {
            print("[SurveyService] Fetch eligible surveys error: \(error.localizedDescription)")
            self.errorMessage = "Anketler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
            self.eligibleSurveys = []
            self.isLoading = false
        }
    }
    
    public func fetchSurveyDetail(surveyId: String) async throws -> PAGSurvey {
        let result = try await Functions.functions().httpsCallable("getSurveyDetail").call(["surveyId": surveyId])
        guard let dict = result.data as? [String: Any],
              let success = dict["success"] as? Bool, success,
              let dataDict = dict["data"] as? [String: Any] else {
            throw NSError(domain: "SurveyService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Anket bulunamadı veya pasif durumda."])
        }
        
        let id = dataDict["surveyId"] as? String ?? surveyId
        let title = dataDict["title"] as? String ?? "Anket"
        let description = dataDict["description"] as? String ?? ""
        let ownerType = dataDict["ownerType"] as? String ?? "PAG"
        let orgId = dataDict["organizationId"] as? String
        let surveyType = dataDict["surveyType"] as? String ?? "PAG"
        let isCompleted = dataDict["isCompleted"] as? Bool ?? false
        let reward = dataDict["profileScoreReward"] as? Int ?? 50
        
        var questions: [PAGQuestion] = []
        if let rawQuestions = dataDict["questions"] as? [[String: Any]] {
            for q in rawQuestions {
                let qId = q["questionId"] as? String ?? UUID().uuidString
                let text = q["text"] as? String ?? ""
                let order = q["order"] as? Int ?? 1
                let type = q["type"] as? String ?? "SINGLE_SELECT"
                
                var options: [PAGQuestionOption] = []
                if let rawOpts = q["options"] as? [[String: Any]] {
                    for opt in rawOpts {
                        let optId = opt["optionId"] as? String ?? UUID().uuidString
                        let label = opt["label"] as? String ?? ""
                        let optOrder = opt["order"] as? Int ?? 1
                        options.append(PAGQuestionOption(optionId: optId, label: label, order: optOrder))
                    }
                }
                questions.append(PAGQuestion(questionId: qId, order: order, type: type, text: text, options: options))
            }
        }
        
        return PAGSurvey(
            surveyId: id,
            ownerType: ownerType,
            organizationId: orgId,
            surveyType: surveyType,
            title: title,
            description: description,
            status: "ACTIVE",
            questionCount: questions.count,
            questions: Array(questions.prefix(3)),
            profileScoreReward: reward,
            isCompleted: isCompleted
        )
    }
    
    public func submitSurveyResponse(surveyId: String, answers: [PAGAnswerInput], isProfile: Bool = false) async throws -> PAGSurveyCompletionResult {
        let functionName = isProfile ? "updateProfileSurveyResponse" : "submitSurveyResponse"
        let answerDicts = answers.map { ["questionId": $0.questionId, "optionId": $0.optionId] }
        let payload: [String: Any] = [
            "surveyId": surveyId,
            "answers": Array(answerDicts.prefix(3))
        ]
        
        let result = try await Functions.functions().httpsCallable(functionName).call(payload)
        guard let dict = result.data as? [String: Any],
              let success = dict["success"] as? Bool, success,
              let dataDict = dict["data"] as? [String: Any] else {
            throw NSError(domain: "SurveyService", code: 400, userInfo: [NSLocalizedDescriptionKey: "Tamamlama işlemi başarısız."])
        }
        
        let resId = dataDict["responseId"] as? String ?? "\(surveyId)_submitted"
        let completedAt = dataDict["completedAt"] as? String ?? ISO8601DateFormatter().string(from: Date())
        let isDuplicate = dataDict["isDuplicate"] as? Bool
        let scoreAwarded = dataDict["profileScoreAwarded"] as? Int ?? dataDict["profileScorePotential"] as? Int
        let currentScore = dataDict["currentProfileScore"] as? Int
        let rewardAwarded = dataDict["rewardAwarded"] as? Int
        let rewardType = dataDict["rewardType"] as? String
        let voucherCode = dataDict["voucherCode"] as? String
        let voucherTitle = dataDict["voucherTitle"] as? String
        let currentRewardBalance = dataDict["currentRewardBalance"] as? Int
        
        await fetchEligibleSurveys()
        
        return PAGSurveyCompletionResult(
            responseId: resId,
            surveyId: surveyId,
            completedAt: completedAt,
            isDuplicate: isDuplicate,
            profileScorePotential: scoreAwarded,
            currentProfileScore: currentScore,
            rewardAwarded: rewardAwarded,
            rewardType: rewardType,
            voucherCode: voucherCode,
            voucherTitle: voucherTitle,
            currentRewardBalance: currentRewardBalance
        )
    }
    
    // Preview/Test Fixtures ONLY (Not used in runtime error paths)
    public static var previewDemoSurveys: [PAGSurvey] = [
        PAGSurvey(
            surveyId: "srv_pag_01",
            ownerType: "PAG",
            surveyType: "PAG",
            title: "Mobil Uygulama Kullanım Alışkanlıkları",
            description: "Günlük mobil uygulama tercihlerinizi değerlendirin ve profil puanınızı yükseltin.",
            questionCount: 3,
            questions: [
                PAGQuestion(questionId: "q1", order: 1, text: "Günlük ortalama akıllı telefon kullanım süreniz nedir?", options: [
                    PAGQuestionOption(optionId: "opt_1", label: "1 saatten az", order: 1),
                    PAGQuestionOption(optionId: "opt_2", label: "1-3 saat arası", order: 2),
                    PAGQuestionOption(optionId: "opt_3", label: "3 saatten fazla", order: 3)
                ]),
                PAGQuestion(questionId: "q2", order: 2, text: "En sık kullandığınız mobil uygulama kategorisi hangisidir?", options: [
                    PAGQuestionOption(optionId: "opt_1", label: "Sosyal Medya", order: 1),
                    PAGQuestionOption(optionId: "opt_2", label: "Finans & Bankacılık", order: 2),
                    PAGQuestionOption(optionId: "opt_3", label: "Oyun & Eğlence", order: 3)
                ]),
                PAGQuestion(questionId: "q3", order: 3, text: "Mobil anket uygulamalarından en büyük beklentiniz nedir?", options: [
                    PAGQuestionOption(optionId: "opt_1", label: "Hızlı Ödül Kazancı", order: 1),
                    PAGQuestionOption(optionId: "opt_2", label: "Kısa ve Eğlenceli Sorular", order: 2),
                    PAGQuestionOption(optionId: "opt_3", label: "Marka Kampanyaları", order: 3)
                ])
            ],
            profileScoreReward: 50
        )
    ]
}

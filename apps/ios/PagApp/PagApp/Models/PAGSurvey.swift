import Foundation

public struct PAGQuestionOption: Codable, Identifiable, Equatable, Hashable {
    public var id: String { optionId }
    public let optionId: String
    public let label: String
    public let order: Int
    
    public init(optionId: String, label: String, order: Int) {
        self.optionId = optionId
        self.label = label
        self.order = order
    }
}

public struct PAGQuestion: Codable, Identifiable, Equatable, Hashable {
    public var id: String { questionId }
    public let questionId: String
    public let order: Int
    public let type: String
    public let text: String
    public let options: [PAGQuestionOption]
    
    public init(questionId: String, order: Int, type: String = "SINGLE_SELECT", text: String, options: [PAGQuestionOption]) {
        self.questionId = questionId
        self.order = order
        self.type = type
        self.text = text
        self.options = options
    }
}

public struct PAGSurvey: Codable, Identifiable, Equatable {
    public var id: String { surveyId }
    
    public let surveyId: String
    public let ownerType: String // "PAG" | "ORGANIZATION"
    public let organizationId: String?
    public let surveyType: String // "PROFILE" | "PAG" | "ORGANIZATION"
    public let title: String
    public let description: String
    public let status: String
    public let startAt: String?
    public let endAt: String?
    public let questionCount: Int
    public let questions: [PAGQuestion]?
    public let profileScoreReward: Int
    public let isCompleted: Bool
    
    public init(
        surveyId: String,
        ownerType: String = "PAG",
        organizationId: String? = nil,
        surveyType: String = "PAG",
        title: String,
        description: String,
        status: String = "ACTIVE",
        startAt: String? = nil,
        endAt: String? = nil,
        questionCount: Int = 3,
        questions: [PAGQuestion]? = nil,
        profileScoreReward: Int = 50,
        isCompleted: Bool = false
    ) {
        self.surveyId = surveyId
        self.ownerType = ownerType
        self.organizationId = organizationId
        self.surveyType = surveyType
        self.title = title
        self.description = description
        self.status = status
        self.startAt = startAt
        self.endAt = endAt
        self.questionCount = questionCount
        self.questions = questions
        self.profileScoreReward = profileScoreReward
        self.isCompleted = isCompleted
    }
    
    public var ownerDisplayName: String {
        if ownerType == "ORGANIZATION" {
            if organizationId?.contains("ford") == true {
                return "Ford Turkey"
            } else if organizationId?.contains("mcd") == true {
                return "McDonald's Turkey"
            }
            return "Kurumsal Ortak"
        }
        return "PAG Özel"
    }
    
    public var estimatedDurationText: String {
        return "\(questionCount * 1) Dakika"
    }
}

public struct PAGAnswerInput: Codable {
    public let questionId: String
    public let optionId: String
    
    public init(questionId: String, optionId: String) {
        self.questionId = questionId
        self.optionId = optionId
    }
}

public struct PAGSurveyCompletionResult: Codable {
    public let responseId: String
    public let surveyId: String
    public let completedAt: String
    public let isDuplicate: Bool?
    public let profileScorePotential: Int?
    public let currentProfileScore: Int?
    public let rewardAwarded: Int?
    public let rewardType: String?
    public let voucherCode: String?
    public let voucherTitle: String?
    public let currentRewardBalance: Int?
    
    public init(
        responseId: String,
        surveyId: String,
        completedAt: String,
        isDuplicate: Bool? = nil,
        profileScorePotential: Int? = nil,
        currentProfileScore: Int? = nil,
        rewardAwarded: Int? = nil,
        rewardType: String? = nil,
        voucherCode: String? = nil,
        voucherTitle: String? = nil,
        currentRewardBalance: Int? = nil
    ) {
        self.responseId = responseId
        self.surveyId = surveyId
        self.completedAt = completedAt
        self.isDuplicate = isDuplicate
        self.profileScorePotential = profileScorePotential
        self.currentProfileScore = currentProfileScore
        self.rewardAwarded = rewardAwarded
        self.rewardType = rewardType
        self.voucherCode = voucherCode
        self.voucherTitle = voucherTitle
        self.currentRewardBalance = currentRewardBalance
    }
}

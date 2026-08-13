import Foundation

public struct PAGRewardLedgerEntry: Identifiable, Codable {
    public let id: String
    public let surveyId: String
    public let type: String
    public let amount: Int
    public let reason: String
    public let createdAt: String
    
    public var formattedAmount: String {
        return "+\(amount) TL"
    }
}

public struct PAGVoucher: Identifiable, Codable {
    public var id: String { voucherId }
    public let voucherId: String
    public let poolId: String
    public let title: String
    public let code: String
    public let valueAmount: Int
    public let status: String
    public let assignedAt: String
    public let expiresAt: String?
    
    public var formattedValue: String {
        return "\(valueAmount) TL"
    }
}

public struct PAGScoreLedgerEntry: Identifiable, Codable {
    public let id: String
    public let userId: String
    public let sourceType: String // "VIDEO" | "PROFILE" | "SURVEY" | "BASIC_PROFILE" | "VERIFICATION"
    public let sourceId: String
    public let amount: Int
    public let reason: String
    public let createdAt: String
    
    public var formattedAmount: String {
        return "+\(amount) Puan"
    }
}

public struct PAGUserRewardsSummary: Codable {
    public let rewardBalance: Int
    public let profileScore: Int
    public let rewards: [PAGRewardLedgerEntry]
    public let vouchers: [PAGVoucher]
    public let scoreLedgers: [PAGScoreLedgerEntry]
}

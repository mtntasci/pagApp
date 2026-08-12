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

public struct PAGUserRewardsSummary: Codable {
    public let rewardBalance: Int
    public let ledgers: [PAGRewardLedgerEntry]
    public let vouchers: [PAGVoucher]
}

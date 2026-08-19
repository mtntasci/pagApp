import Foundation
import Combine
import FirebaseFunctions

@MainActor
public class RewardService: ObservableObject {
    public static let shared = RewardService()
    
    @Published public private(set) var rewardBalance: Int = 0
    @Published public private(set) var profileScore: Int = 0
    @Published public private(set) var rewards: [PAGRewardLedgerEntry] = []
    @Published public private(set) var vouchers: [PAGVoucher] = []
    @Published public private(set) var scoreLedgers: [PAGScoreLedgerEntry] = []
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var errorMessage: String? = nil
    
    private init() {}
    
    public func fetchUserRewards() async {
        if rewards.isEmpty && vouchers.isEmpty && scoreLedgers.isEmpty {
            self.isLoading = true
        }
        self.errorMessage = nil
        
        do {
            // 1. Try High-Speed REST API (~10ms)
            if let response = try? await PAGApiClient.shared.get(endpoint: "/wallet"),
               let success = response["success"] as? Bool, success,
               let dataDict = response["data"] as? [String: Any] {
                
                self.rewardBalance = Int(Double(dataDict["rewardBalance"] as? String ?? "0") ?? 0)
                self.profileScore = dataDict["profileScore"] as? Int ?? 0
                
                var parsedRewards: [PAGRewardLedgerEntry] = []
                if let rawRewards = dataDict["rewardHistory"] as? [[String: Any]] {
                    for r in rawRewards {
                        let entry = PAGRewardLedgerEntry(
                            id: r["id"] as? String ?? UUID().uuidString,
                            surveyId: r["surveyId"] as? String ?? "",
                            type: r["rewardType"] as? String ?? "MONEY",
                            amount: Int(Double(r["amount"] as? String ?? "0") ?? 0),
                            reason: "Anket Ödülü",
                            createdAt: r["createdAt"] as? String ?? ""
                        )
                        parsedRewards.append(entry)
                    }
                }
                self.rewards = parsedRewards
                
                var parsedVouchers: [PAGVoucher] = []
                if let rawVouchers = dataDict["vouchers"] as? [[String: Any]] {
                    for v in rawVouchers {
                        let voucher = PAGVoucher(
                            voucherId: v["id"] as? String ?? UUID().uuidString,
                            poolId: v["surveyId"] as? String ?? "",
                            title: v["poolName"] as? String ?? "Hediye Çeki",
                            code: v["code"] as? String ?? "",
                            valueAmount: Int(Double(v["amount"] as? String ?? "0") ?? 0),
                            status: v["status"] as? String ?? "ASSIGNED",
                            assignedAt: v["assignedAt"] as? String ?? "",
                            expiresAt: nil
                        )
                        parsedVouchers.append(voucher)
                    }
                }
                self.vouchers = parsedVouchers
                
                var parsedScoreLedgers: [PAGScoreLedgerEntry] = []
                if let rawScores = dataDict["scoreHistory"] as? [[String: Any]] {
                    for s in rawScores {
                        let entry = PAGScoreLedgerEntry(
                            id: s["id"] as? String ?? UUID().uuidString,
                            userId: s["userId"] as? String ?? "",
                            sourceType: s["sourceType"] as? String ?? "SURVEY",
                            sourceId: s["sourceId"] as? String ?? "",
                            amount: s["scoreDelta"] as? Int ?? 0,
                            reason: "Profil Puanı",
                            createdAt: s["createdAt"] as? String ?? ""
                        )
                        parsedScoreLedgers.append(entry)
                    }
                }
                self.scoreLedgers = parsedScoreLedgers
            } else {
                self.rewardBalance = 0
                self.profileScore = 0
                self.rewards = []
                self.vouchers = []
                self.scoreLedgers = []
            }
            self.isLoading = false
        } catch {
            print("[RewardService] Fetch rewards error: \(error.localizedDescription)")
            self.rewardBalance = 0
            self.profileScore = 0
            self.rewards = []
            self.vouchers = []
            self.scoreLedgers = []
            self.isLoading = false
        }
    }
}

import Foundation
import Combine
import FirebaseFunctions

@MainActor
public class RewardService: ObservableObject {
    public static let shared = RewardService()
    
    @Published public private(set) var rewardBalance: Int = 0
    @Published public private(set) var rewardLedgers: [PAGRewardLedgerEntry] = []
    @Published public private(set) var vouchers: [PAGVoucher] = []
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var errorMessage: String? = nil
    
    private init() {}
    
    public func fetchUserRewards() async {
        self.isLoading = true
        self.errorMessage = nil
        
        do {
            let result = try await Functions.functions().httpsCallable("getUserRewards").call()
            guard let dict = result.data as? [String: Any],
                  let success = dict["success"] as? Bool, success,
                  let dataDict = dict["data"] as? [String: Any] else {
                throw NSError(domain: "RewardService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Ödüller yüklenemedi."])
            }
            
            self.rewardBalance = dataDict["rewardBalance"] as? Int ?? 0
            
            var parsedLedgers: [PAGRewardLedgerEntry] = []
            if let rawLedgers = dataDict["ledgers"] as? [[String: Any]] {
                for l in rawLedgers {
                    let entry = PAGRewardLedgerEntry(
                        id: l["id"] as? String ?? UUID().uuidString,
                        surveyId: l["surveyId"] as? String ?? "",
                        type: l["type"] as? String ?? "MONEY",
                        amount: l["amount"] as? Int ?? 0,
                        reason: l["reason"] as? String ?? "Anket Ödülü",
                        createdAt: l["createdAt"] as? String ?? ""
                    )
                    parsedLedgers.append(entry)
                }
            }
            self.rewardLedgers = parsedLedgers
            
            var parsedVouchers: [PAGVoucher] = []
            if let rawVouchers = dataDict["vouchers"] as? [[String: Any]] {
                for v in rawVouchers {
                    let voucher = PAGVoucher(
                        voucherId: v["voucherId"] as? String ?? UUID().uuidString,
                        poolId: v["poolId"] as? String ?? "",
                        title: v["title"] as? String ?? "Hediye Çeki",
                        code: v["code"] as? String ?? "",
                        valueAmount: v["valueAmount"] as? Int ?? 0,
                        status: v["status"] as? String ?? "ASSIGNED",
                        assignedAt: v["assignedAt"] as? String ?? "",
                        expiresAt: v["expiresAt"] as? String
                    )
                    parsedVouchers.append(voucher)
                }
            }
            self.vouchers = parsedVouchers
            self.isLoading = false
        } catch {
            print("[RewardService] Fetch rewards error: \(error.localizedDescription)")
            self.errorMessage = "Ödül verileri yüklenirken bir sorun oluştu."
            self.isLoading = false
        }
    }
}

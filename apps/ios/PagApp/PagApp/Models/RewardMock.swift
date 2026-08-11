import Foundation

public enum RewardType {
    case profileScoreOnly
    case money
    case voucher
    case profileScoreAndMoney
    case profileScoreAndVoucher
}

public struct RewardResultMock {
    public let type: RewardType
    public let profileScore: Int?
    public let moneyAmount: Double?
    public let voucherInfo: String?
    
    public static let sampleMoney = RewardResultMock(type: .profileScoreAndMoney, profileScore: 50, moneyAmount: 20.0, voucherInfo: nil)
    public static let sampleVoucher = RewardResultMock(type: .profileScoreAndVoucher, profileScore: 35, moneyAmount: nil, voucherInfo: "Menü Kazandınız")
    public static let sampleProfileOnly = RewardResultMock(type: .profileScoreOnly, profileScore: 75, moneyAmount: nil, voucherInfo: nil)
}

public struct VoucherMock: Identifiable {
    public let id: String
    public let organization: String
    public let title: String
    public let status: String
    public let assignedDate: Date
    public let code: String
    
    public static let sampleList = [
        VoucherMock(id: "v-1", organization: "McDonald's", title: "Ücretsiz Big Mac Menü", status: "Kullanılabilir", assignedDate: Date(), code: "DEMO-PAG-MCD1"),
        VoucherMock(id: "v-2", organization: "Starbucks", title: "1 Adet Tall Boy Kahve", status: "Kullanıldı", assignedDate: Date().addingTimeInterval(-86400*3), code: "DEMO-PAG-STB2")
    ]
}

public struct RewardHistoryMock: Identifiable {
    public let id: String
    public let title: String
    public let amountText: String
    public let date: Date
    public let isVoucher: Bool
    
    public static let sampleList = [
        RewardHistoryMock(id: "h-1", title: "Ford Araştırması", amountText: "+₺20", date: Date(), isVoucher: false),
        RewardHistoryMock(id: "h-2", title: "PAG Genel Araştırması", amountText: "+₺50", date: Date().addingTimeInterval(-86400), isVoucher: false),
        RewardHistoryMock(id: "h-3", title: "McDonald's", amountText: "Hediye Çeki", date: Date().addingTimeInterval(-86400*2), isVoucher: true)
    ]
}

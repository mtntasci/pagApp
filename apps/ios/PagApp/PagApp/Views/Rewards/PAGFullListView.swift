import SwiftUI

public enum PAGListType: String {
    case rewards = "Kazanılan Ödüller"
    case vouchers = "Hediye Çekleri"
    case scoreHistory = "Profil Puanı Geçmişi"
}

public struct PAGFullListView: View {
    public let listType: PAGListType
    public let rewards: [PAGRewardLedgerEntry]
    public let vouchers: [PAGVoucher]
    public let scoreLedgers: [PAGScoreLedgerEntry]
    
    @State private var currentPage: Int = 1
    private let pageSize: Int = 100
    
    public init(
        listType: PAGListType,
        rewards: [PAGRewardLedgerEntry] = [],
        vouchers: [PAGVoucher] = [],
        scoreLedgers: [PAGScoreLedgerEntry] = []
    ) {
        self.listType = listType
        self.rewards = rewards
        self.vouchers = vouchers
        self.scoreLedgers = scoreLedgers
    }
    
    private var totalItemsCount: Int {
        switch listType {
        case .rewards: return rewards.count
        case .vouchers: return vouchers.count
        case .scoreHistory: return scoreLedgers.count
        }
    }
    
    private var totalPages: Int {
        return max(1, Int(ceil(Double(totalItemsCount) / Double(pageSize))))
    }
    
    private var startIndex: Int {
        return (currentPage - 1) * pageSize
    }
    
    private var pageRewards: [PAGRewardLedgerEntry] {
        guard startIndex < rewards.count else { return [] }
        let endIndex = min(startIndex + pageSize, rewards.count)
        return Array(rewards[startIndex..<endIndex])
    }
    
    private var pageVouchers: [PAGVoucher] {
        guard startIndex < vouchers.count else { return [] }
        let endIndex = min(startIndex + pageSize, vouchers.count)
        return Array(vouchers[startIndex..<endIndex])
    }
    
    private var pageScoreLedgers: [PAGScoreLedgerEntry] {
        guard startIndex < scoreLedgers.count else { return [] }
        let endIndex = min(startIndex + pageSize, scoreLedgers.count)
        return Array(scoreLedgers[startIndex..<endIndex])
    }
    
    // Turkish Date Formatter helper
    private func formatDateStr(_ isoStr: String) -> String {
        guard !isoStr.isEmpty else { return "" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        if let d = formatter.date(from: isoStr) ?? DateFormatter().date(from: isoStr) {
            let trFormatter = DateFormatter()
            trFormatter.locale = Locale(identifier: "tr_TR")
            trFormatter.dateFormat = "d MMMM yyyy, HH:mm"
            return trFormatter.string(from: d)
        }
        return isoStr.prefix(10).description
    }

    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Total Summary Bar
                HStack {
                    Text("Toplam \(totalItemsCount) Kayıt")
                        .font(PAGTypography.heading)
                        .foregroundColor(PAGTheme.textPrimary)
                    Spacer()
                    Text("Sayfa \(currentPage) / \(totalPages)")
                        .font(PAGTypography.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(PAGTheme.brandLime)
                }
                .padding()
                .background(PAGTheme.surfacePrimary)
                
                Divider().background(PAGTheme.borderDefault)
                
                // Item List
                ScrollView {
                    VStack(spacing: 12) {
                        switch listType {
                        case .rewards:
                            ForEach(pageRewards) { history in
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(history.reason)
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Text(formatDateStr(history.createdAt))
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.textMuted)
                                    }
                                    Spacer()
                                    Text(history.formattedAmount)
                                        .font(PAGTypography.heading)
                                        .foregroundColor(PAGTheme.brandLime)
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                            }
                            
                        case .vouchers:
                            ForEach(pageVouchers) { voucher in
                                VStack(alignment: .leading, spacing: 10) {
                                    HStack {
                                        PAGBadge(title: voucher.title, iconName: "gift.fill", style: .tag)
                                        Spacer()
                                        Text(voucher.status == "ASSIGNED" ? "Aktif" : voucher.status)
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.success)
                                    }
                                    Text("\(voucher.valueAmount) TL Hediye Çeki")
                                        .font(PAGTypography.heading)
                                        .foregroundColor(PAGTheme.textPrimary)
                                    
                                    HStack {
                                        Text("KOD: \(voucher.code)")
                                            .font(PAGTypography.bodyLarge)
                                            .foregroundColor(PAGTheme.brandLime)
                                        Spacer()
                                        Button(action: {
                                            UIPasteboard.general.string = voucher.code
                                        }) {
                                            Image(systemName: "doc.on.doc")
                                                .foregroundColor(PAGTheme.textSecondary)
                                        }
                                    }
                                    .padding(10)
                                    .background(PAGTheme.surfaceSecondary)
                                    .cornerRadius(6)
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                            }
                            
                        case .scoreHistory:
                            ForEach(pageScoreLedgers) { entry in
                                scoreRow(entry)
                            }
                        }
                    }
                    .padding(PAGSpacing.md)
                }
                
                // Pagination Controls
                if totalPages > 1 {
                    Divider().background(PAGTheme.borderDefault)
                    HStack {
                        Button(action: {
                            if currentPage > 1 { currentPage -= 1 }
                        }) {
                            HStack {
                                Image(systemName: "chevron.left")
                                Text("Önceki 100")
                            }
                            .font(PAGTypography.body)
                            .foregroundColor(currentPage > 1 ? PAGTheme.brandLime : PAGTheme.textMuted)
                            .padding(.vertical, 10)
                            .padding(.horizontal, 16)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(8)
                        }
                        .disabled(currentPage <= 1)
                        
                        Spacer()
                        
                        Button(action: {
                            if currentPage < totalPages { currentPage += 1 }
                        }) {
                            HStack {
                                Text("Sonraki 100")
                                Image(systemName: "chevron.right")
                            }
                            .font(PAGTypography.body)
                            .foregroundColor(currentPage < totalPages ? PAGTheme.brandLime : PAGTheme.textMuted)
                            .padding(.vertical, 10)
                            .padding(.horizontal, 16)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(8)
                        }
                        .disabled(currentPage >= totalPages)
                    }
                    .padding()
                    .background(PAGTheme.surfacePrimary)
                }
            }
        }
        .navigationTitle(listType.rawValue)
        .navigationBarTitleDisplayMode(.inline)
    }
    
    @ViewBuilder
    private func scoreRow(_ entry: PAGScoreLedgerEntry) -> some View {
        let (badgeText, badgeIcon, badgeBg, badgeFg) = scoreSourceMetadata(entry.sourceType)
        
        HStack(spacing: 12) {
            Circle()
                .fill(badgeBg.opacity(0.18))
                .frame(width: 42, height: 42)
                .overlay(
                    Image(systemName: badgeIcon)
                        .font(.system(size: 18))
                        .foregroundColor(badgeBg)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(badgeText)
                        .font(.system(size: 11, weight: .bold))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(badgeBg.opacity(0.15))
                        .foregroundColor(badgeBg)
                        .cornerRadius(4)
                    
                    Spacer()
                }
                
                Text(entry.reason)
                    .font(PAGTypography.heading)
                    .foregroundColor(PAGTheme.textPrimary)
                
                Text(formatDateStr(entry.createdAt))
                    .font(PAGTypography.caption)
                    .foregroundColor(PAGTheme.textMuted)
            }
            
            Spacer()
            
            Text("+\(entry.amount)")
                .font(PAGTypography.heading)
                .foregroundColor(badgeBg)
        }
        .padding()
        .background(PAGTheme.surfacePrimary)
        .cornerRadius(PAGRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: PAGRadius.medium)
                .stroke(badgeBg.opacity(0.3), lineWidth: 1)
        )
    }
    
    private func scoreSourceMetadata(_ sourceType: String) -> (text: String, icon: String, bg: Color, fg: Color) {
        switch sourceType.uppercased() {
        case "VIDEO":
            // 🎥 Video izleyen daha çok puan kazanacak -> Özel Mor/Siyan Renk
            return ("VİDEO ÖDÜLÜ", "play.tv.fill", Color(red: 0.65, green: 0.25, blue: 0.95), .white)
        case "PROFILE":
            // 📋 Profil Anketleri -> Özel Turuncu/Altın Renk
            return ("PROFİL ANKETİ", "person.badge.shield.checkmark.fill", Color(red: 0.95, green: 0.55, blue: 0.10), .white)
        case "SURVEY":
            // 📊 Normal Anketler (PAG veya Organizasyon) -> Özel Mavi Renk
            return ("ANKET", "doc.text.fill", Color(red: 0.20, green: 0.55, blue: 0.95), .white)
        default:
            // 👤 Temel Profil / Doğrulama -> Yeşil
            return ("TEMEL PROFİL", "checkmark.seal.fill", Color(red: 0.10, green: 0.70, blue: 0.45), .white)
        }
    }
}

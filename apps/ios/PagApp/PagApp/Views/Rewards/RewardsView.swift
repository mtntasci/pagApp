import SwiftUI

public struct RewardsView: View {
    @StateObject private var rewardService = RewardService.shared
    
    // Accordion default closed states as requested by user
    @State private var isRewardsExpanded: Bool = false
    @State private var isVouchersExpanded: Bool = false
    @State private var isScoreHistoryExpanded: Bool = false // Default closed
    
    public init() {}
    
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

    private func displayReason(_ reason: String) -> String {
        if reason == "Temel Profil Tamamlama Ödülü" {
            return "Tamamlama Ödülü"
        }
        return reason
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                PAGTheme.backgroundPrimary.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAGSpacing.lg) {
                        
                        // Top Balance Summary Area
                        HStack(spacing: 12) {
                            // Monetary Reward Balance Box
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Ödül Bakiyen")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(PAGTheme.textMuted)
                                Text("₺\(rewardService.rewardBalance)")
                                    .font(PAGTypography.display)
                                    .foregroundColor(PAGTheme.brandLime)
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.brandLime.opacity(0.3), lineWidth: 1))
                            
                            // Profile Score Box
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Profil Puanın")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(PAGTheme.textMuted)
                                Text("\(rewardService.profileScore)")
                                    .font(PAGTypography.display)
                                    .foregroundColor(Color(red: 0.65, green: 0.25, blue: 0.95))
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(Color(red: 0.65, green: 0.25, blue: 0.95).opacity(0.3), lineWidth: 1))
                        }
                        .padding(.horizontal, PAGSpacing.md)
                        .padding(.top, PAGSpacing.md)
                        
                        // Withdrawal CTA Button
                        PAGButton(
                            title: "Para Çek (Yakında)",
                            iconName: "arrow.up.right",
                            style: .secondary,
                            action: {}
                        )
                        .disabled(true)
                        .opacity(0.5)
                        .padding(.horizontal, PAGSpacing.md)
                        
                        Divider().background(PAGTheme.borderDefault)
                        
                        // ==================================================
                        // 1. KAZANILAN ÖDÜLLER ACCORDION (Varsayılan Kapalı)
                        // ==================================================
                        VStack(spacing: 0) {
                            Button(action: {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                    isRewardsExpanded.toggle()
                                }
                            }) {
                                HStack {
                                    Image(systemName: "banknote.fill")
                                        .foregroundColor(PAGTheme.brandLime)
                                        .font(.system(size: 20))
                                    
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Kazanılan Ödüller")
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Text("\(rewardService.rewards.count) Kayıt")
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.textMuted)
                                    }
                                    
                                    Spacer()
                                    
                                    Image(systemName: isRewardsExpanded ? "chevron.up" : "chevron.down")
                                        .foregroundColor(PAGTheme.textMuted)
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: PAGRadius.medium)
                                        .stroke(PAGTheme.borderDefault, lineWidth: 1)
                                )
                            }
                            
                            if isRewardsExpanded {
                                VStack(spacing: 10) {
                                    if rewardService.rewards.isEmpty {
                                        Text("Henüz kazanılmış bir finansal ödül bulunmuyor.")
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.textMuted)
                                            .padding()
                                    } else {
                                        // Display LAST 5 RECORDS
                                        ForEach(Array(rewardService.rewards.prefix(5))) { history in
                                            HStack {
                                                VStack(alignment: .leading, spacing: 4) {
                                                    Text(displayReason(history.reason))
                                                        .font(PAGTypography.heading)
                                                        .lineLimit(1)
                                                        .truncationMode(.tail)
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
                                            .padding(12)
                                            .background(PAGTheme.surfaceSecondary)
                                            .cornerRadius(PAGRadius.small)
                                        }
                                        
                                        // "Tüm Ödül Geçmişini Gör" Button
                                        NavigationLink(destination: PAGFullListView(listType: .rewards, rewards: rewardService.rewards)) {
                                            HStack {
                                                Text("Tüm Ödül Geçmişini Gör (\(rewardService.rewards.count))")
                                                    .font(PAGTypography.caption)
                                                    .fontWeight(.bold)
                                                    .foregroundColor(PAGTheme.brandLime)
                                                Spacer()
                                                Image(systemName: "arrow.right")
                                                    .font(.system(size: 12))
                                                    .foregroundColor(PAGTheme.brandLime)
                                            }
                                            .padding(10)
                                            .background(PAGTheme.brandLime.opacity(0.12))
                                            .cornerRadius(PAGRadius.small)
                                        }
                                    }
                                }
                                .padding(12)
                                .background(PAGTheme.surfacePrimary.opacity(0.6))
                                .cornerRadius(PAGRadius.medium)
                                .padding(.top, 4)
                            }
                        }
                        .padding(.horizontal, PAGSpacing.md)
                        
                        // ==================================================
                        // 2. HEDİYE ÇEKLERİ ACCORDION (Varsayılan Kapalı)
                        // ==================================================
                        VStack(spacing: 0) {
                            Button(action: {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                    isVouchersExpanded.toggle()
                                }
                            }) {
                                HStack {
                                    Image(systemName: "gift.fill")
                                        .foregroundColor(PAGTheme.warning)
                                        .font(.system(size: 20))
                                    
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Hediye Çekleri")
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Text("\(rewardService.vouchers.count) Aktif Çek")
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.textMuted)
                                    }
                                    
                                    Spacer()
                                    
                                    Image(systemName: isVouchersExpanded ? "chevron.up" : "chevron.down")
                                        .foregroundColor(PAGTheme.textMuted)
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: PAGRadius.medium)
                                        .stroke(PAGTheme.borderDefault, lineWidth: 1)
                                )
                            }
                            
                            if isVouchersExpanded {
                                VStack(spacing: 12) {
                                    if rewardService.vouchers.isEmpty {
                                        Text("Henüz tanımlı hediye çekiniz bulunmuyor.")
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.textMuted)
                                            .padding()
                                    } else {
                                        // Display LAST 5 RECORDS
                                        ForEach(Array(rewardService.vouchers.prefix(5))) { voucher in
                                            VStack(alignment: .leading, spacing: 8) {
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
                                                .padding(8)
                                                .background(PAGTheme.surfaceSecondary)
                                                .cornerRadius(6)
                                            }
                                            .padding(12)
                                            .background(PAGTheme.surfaceSecondary)
                                            .cornerRadius(PAGRadius.small)
                                        }
                                        
                                        // "Tüm Hediye Çeklerini Gör" Button
                                        NavigationLink(destination: PAGFullListView(listType: .vouchers, vouchers: rewardService.vouchers)) {
                                            HStack {
                                                Text("Tüm Hediye Çeklerini Gör (\(rewardService.vouchers.count))")
                                                    .font(PAGTypography.caption)
                                                    .fontWeight(.bold)
                                                    .foregroundColor(PAGTheme.brandLime)
                                                Spacer()
                                                Image(systemName: "arrow.right")
                                                    .font(.system(size: 12))
                                                    .foregroundColor(PAGTheme.brandLime)
                                            }
                                            .padding(10)
                                            .background(PAGTheme.brandLime.opacity(0.12))
                                            .cornerRadius(PAGRadius.small)
                                        }
                                    }
                                }
                                .padding(12)
                                .background(PAGTheme.surfacePrimary.opacity(0.6))
                                .cornerRadius(PAGRadius.medium)
                                .padding(.top, 4)
                            }
                        }
                        .padding(.horizontal, PAGSpacing.md)
                        
                        // ==================================================
                        // 3. PROFİL PUANLARI ACCORDION (Varsayılan Kapalı)
                        // ==================================================
                        VStack(spacing: 0) {
                            Button(action: {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                    isScoreHistoryExpanded.toggle()
                                }
                            }) {
                                HStack {
                                    Image(systemName: "bolt.fill")
                                        .foregroundColor(Color(red: 0.65, green: 0.25, blue: 0.95))
                                        .font(.system(size: 20))
                                    
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Profil Puanları Geçmişi")
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Text("\(rewardService.scoreLedgers.count) Kayıt")
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.textMuted)
                                    }
                                    
                                    Spacer()
                                    
                                    Image(systemName: isScoreHistoryExpanded ? "chevron.up" : "chevron.down")
                                        .foregroundColor(PAGTheme.textMuted)
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: PAGRadius.medium)
                                        .stroke(PAGTheme.borderDefault, lineWidth: 1)
                                )
                            }
                            
                            if isScoreHistoryExpanded {
                                VStack(spacing: 10) {
                                    if rewardService.scoreLedgers.isEmpty {
                                        Text("Henüz kazanılmış Profil Puanı kaydı bulunmuyor.")
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.textMuted)
                                            .padding()
                                    } else {
                                        // Display LAST 5 RECORDS
                                        ForEach(Array(rewardService.scoreLedgers.prefix(5))) { entry in
                                            scoreRow(entry)
                                        }
                                        
                                        // "Tüm Profil Puanı Geçmişini Gör" Button (100 kayıtlık liste)
                                        NavigationLink(destination: PAGFullListView(listType: .scoreHistory, scoreLedgers: rewardService.scoreLedgers)) {
                                            HStack {
                                                Text("Tüm Profil Puanı Geçmişini Gör (\(rewardService.scoreLedgers.count) Kayıt)")
                                                    .font(PAGTypography.caption)
                                                    .fontWeight(.bold)
                                                    .foregroundColor(PAGTheme.brandLime)
                                                Spacer()
                                                Image(systemName: "arrow.right")
                                                    .font(.system(size: 12))
                                                    .foregroundColor(PAGTheme.brandLime)
                                            }
                                            .padding(10)
                                            .background(PAGTheme.brandLime.opacity(0.12))
                                            .cornerRadius(PAGRadius.small)
                                        }
                                    }
                                }
                                .padding(12)
                                .background(PAGTheme.surfacePrimary.opacity(0.6))
                                .cornerRadius(PAGRadius.medium)
                                .padding(.top, 4)
                            }
                        }
                        .padding(.horizontal, PAGSpacing.md)
                        
                        Spacer().frame(height: 40)
                    }
                }
            }
            .navigationTitle("Ödüller")
            .onAppear {
                Task {
                    await rewardService.fetchUserRewards()
                }
            }
        }
    }
    
    // Categorized Color Coding helper for Profile Score sources
    @ViewBuilder
    private func scoreRow(_ entry: PAGScoreLedgerEntry) -> some View {
        let (badgeText, badgeIcon, badgeBg, _) = scoreSourceMetadata(entry.sourceType)
        
        HStack(spacing: 12) {
            Circle()
                .fill(badgeBg.opacity(0.18))
                .frame(width: 40, height: 40)
                .overlay(
                    Image(systemName: badgeIcon)
                        .font(.system(size: 16))
                        .foregroundColor(badgeBg)
                )
            
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(badgeText)
                        .font(.system(size: 10, weight: .bold))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(badgeBg.opacity(0.15))
                        .foregroundColor(badgeBg)
                        .cornerRadius(4)
                    
                    Spacer()
                }
                
                // Single line truncation (...)
                Text(displayReason(entry.reason))
                    .font(PAGTypography.heading)
                    .lineLimit(1)
                    .truncationMode(.tail)
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
        .padding(12)
        .background(PAGTheme.surfaceSecondary)
        .cornerRadius(PAGRadius.small)
    }
    
    private func scoreSourceMetadata(_ sourceType: String) -> (text: String, icon: String, bg: Color, fg: Color) {
        switch sourceType.uppercased() {
        case "VIDEO":
            // 🎥 Video İzleme -> Özel Mor/Siyan Renk
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

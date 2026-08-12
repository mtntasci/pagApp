import SwiftUI

public struct RewardsView: View {
    @StateObject private var rewardService = RewardService.shared
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ZStack {
                PAGTheme.backgroundPrimary.ignoresSafeArea()
                
                if rewardService.isLoading {
                    ProgressView()
                        .tint(PAGTheme.brandLime)
                } else {
                    ScrollView {
                        VStack(spacing: PAGSpacing.lg) {
                            
                            // Top Balance Area
                            VStack(spacing: PAGSpacing.xs) {
                                Text("Ödül Bakiyen")
                                    .font(PAGTypography.bodyLarge)
                                    .foregroundColor(PAGTheme.textSecondary)
                                Text("₺\(rewardService.rewardBalance)")
                                    .font(PAGTypography.display)
                                    .foregroundColor(PAGTheme.brandLime)
                            }
                            .padding(.top, PAGSpacing.lg)
                            
                            // Withdrawal Foundation CTA (Disabled as instructed)
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
                            
                            // History Section
                            VStack(alignment: .leading, spacing: PAGSpacing.md) {
                                Text("Kazanılan Ödüller")
                                    .font(PAGTypography.title)
                                    .foregroundColor(PAGTheme.textPrimary)
                                    .padding(.horizontal, PAGSpacing.md)
                                
                                if rewardService.rewardLedgers.isEmpty {
                                    Text("Henüz finansal ödül geçmişiniz bulunmuyor.")
                                        .font(PAGTypography.bodySmall)
                                        .foregroundColor(PAGTheme.textMuted)
                                        .padding(.horizontal, PAGSpacing.md)
                                } else {
                                    ForEach(rewardService.rewardLedgers) { history in
                                        HStack {
                                            VStack(alignment: .leading, spacing: 4) {
                                                Text(history.reason)
                                                    .font(PAGTypography.heading)
                                                    .foregroundColor(PAGTheme.textPrimary)
                                                Text(history.createdAt)
                                                    .font(PAGTypography.bodySmall)
                                                    .foregroundColor(PAGTheme.textMuted)
                                            }
                                            Spacer()
                                            Text(history.formattedAmount)
                                                .font(PAGTypography.heading)
                                                .foregroundColor(history.type == "VOUCHER" ? PAGTheme.warning : PAGTheme.brandLime)
                                        }
                                        .padding()
                                        .background(PAGTheme.surfacePrimary)
                                        .cornerRadius(PAGRadius.medium)
                                        .padding(.horizontal, PAGSpacing.md)
                                    }
                                }
                            }
                            
                            Divider().background(PAGTheme.borderDefault)
                            
                            // Vouchers Section
                            VStack(alignment: .leading, spacing: PAGSpacing.md) {
                                Text("Hediye Çekleri")
                                    .font(PAGTypography.title)
                                    .foregroundColor(PAGTheme.textPrimary)
                                    .padding(.horizontal, PAGSpacing.md)
                                
                                if rewardService.vouchers.isEmpty {
                                    Text("Henüz tanımlı hediye çekiniz bulunmuyor.")
                                        .font(PAGTypography.bodySmall)
                                        .foregroundColor(PAGTheme.textMuted)
                                        .padding(.horizontal, PAGSpacing.md)
                                } else {
                                    ForEach(rewardService.vouchers) { voucher in
                                        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                                            HStack {
                                                PAGBadge(title: voucher.title, iconName: "gift", style: .tag)
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
                                            .padding()
                                            .background(PAGTheme.surfaceSecondary)
                                            .cornerRadius(PAGRadius.small)
                                        }
                                        .padding()
                                        .background(PAGTheme.surfacePrimary)
                                        .cornerRadius(PAGRadius.medium)
                                        .padding(.horizontal, PAGSpacing.md)
                                    }
                                }
                            }
                            
                            Spacer().frame(height: 40)
                        }
                    }
                }
            }
            .navigationTitle("Ödüller")
            .task {
                await rewardService.fetchUserRewards()
            }
        }
    }
}

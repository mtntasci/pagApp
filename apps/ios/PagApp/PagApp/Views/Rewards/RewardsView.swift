import SwiftUI

public struct RewardsView: View {
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ZStack {
                PAGTheme.backgroundPrimary.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAGSpacing.lg) {
                        
                        // Top Balance Area
                        VStack(spacing: PAGSpacing.xs) {
                            Text("Ödül Bakiyen")
                                .font(PAGTypography.bodyLarge)
                                .foregroundColor(PAGTheme.textSecondary)
                            Text("₺320")
                                .font(PAGTypography.display)
                                .foregroundColor(PAGTheme.brandLime)
                        }
                        .padding(.top, PAGSpacing.lg)
                        
                        // Withdrawal Foundation CTA
                        PAGButton(
                            title: "Para Çek (Yakında)",
                            iconName: "arrow.up.right",
                            style: .secondary,
                            action: {
                                // Withdrawal UI Foundation - TBD
                            }
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
                            
                            ForEach(RewardHistoryMock.sampleList) { history in
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(history.title)
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Text(history.date.formatted(date: .abbreviated, time: .omitted))
                                            .font(PAGTypography.bodySmall)
                                            .foregroundColor(PAGTheme.textMuted)
                                    }
                                    Spacer()
                                    Text(history.amountText)
                                        .font(PAGTypography.heading)
                                        .foregroundColor(history.isVoucher ? PAGTheme.warning : PAGTheme.brandBlue)
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                                .padding(.horizontal, PAGSpacing.md)
                            }
                        }
                        
                        Divider().background(PAGTheme.borderDefault)
                        
                        // Vouchers Section
                        VStack(alignment: .leading, spacing: PAGSpacing.md) {
                            Text("Hediye Çekleri")
                                .font(PAGTypography.title)
                                .foregroundColor(PAGTheme.textPrimary)
                                .padding(.horizontal, PAGSpacing.md)
                            
                            ForEach(VoucherMock.sampleList) { voucher in
                                VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                                    HStack {
                                        PAGBadge(title: voucher.organization, iconName: "gift", style: .tag)
                                        Spacer()
                                        Text(voucher.status)
                                            .font(PAGTypography.caption)
                                            .foregroundColor(voucher.status == "Kullanıldı" ? PAGTheme.textMuted : PAGTheme.success)
                                    }
                                    
                                    Text(voucher.title)
                                        .font(PAGTypography.heading)
                                        .foregroundColor(PAGTheme.textPrimary)
                                    
                                    HStack {
                                        Text("KOD: \(voucher.code)")
                                            .font(PAGTypography.bodyLarge)
                                            .foregroundColor(PAGTheme.brandLime)
                                        Spacer()
                                        Button(action: {}) {
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
                        
                        Spacer().frame(height: 40)
                    }
                }
            }
            .navigationTitle("Ödüller")
        }
    }
}

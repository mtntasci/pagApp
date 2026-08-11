import SwiftUI

public struct SurveyResultView: View {
    public let survey: SurveyMock
    public let onBackToHome: () -> Void
    
    public init(survey: SurveyMock, onBackToHome: @escaping () -> Void) {
        self.survey = survey
        self.onBackToHome = onBackToHome
    }
    
    public var body: some View {
        let mockResult = getMockResult(for: survey)
        
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            VStack(spacing: PAGSpacing.xl) {
                Spacer()
                
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(PAGTheme.success)
                
                Text("Anket Tamamlandı")
                    .font(PAGTypography.display)
                    .foregroundColor(PAGTheme.textPrimary)
                
                VStack(spacing: PAGSpacing.md) {
                    if let score = mockResult.profileScore {
                        Text("+\(score) Profil Puanı")
                            .font(PAGTypography.display)
                            .foregroundColor(PAGTheme.brandLime)
                    }
                    
                    if let money = mockResult.moneyAmount {
                        Text("\(String(format: "%.0f", money)) TL kazandın")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.brandBlue)
                    }
                    
                    if let voucher = mockResult.voucherInfo {
                        Text("Hediye çeki kazandın:\n\(voucher)")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.warning)
                            .multilineTextAlignment(.center)
                    }
                }
                
                Spacer()
                
                PAGButton(
                    title: "ANA SAYFAYA DÖN",
                    iconName: "arrow.right",
                    style: .primary,
                    action: onBackToHome
                )
            }
            .padding(PAGSpacing.lg)
        }
        .navigationBarHidden(true)
    }
    
    private func getMockResult(for survey: SurveyMock) -> RewardResultMock {
        if let pool = survey.rewardPoolText, pool.contains("Hediye Çeki") {
            return .sampleVoucher
        } else if survey.rewardPoolText != nil {
            return .sampleMoney
        } else {
            return .sampleProfileOnly
        }
    }
}

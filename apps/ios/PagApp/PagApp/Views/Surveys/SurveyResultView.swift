import SwiftUI

public struct SurveyResultView: View {
    public let survey: PAGSurvey
    public let result: PAGSurveyCompletionResult?
    public let onBackToHome: () -> Void
    
    public init(survey: PAGSurvey, result: PAGSurveyCompletionResult? = nil, onBackToHome: @escaping () -> Void) {
        self.survey = survey
        self.result = result
        self.onBackToHome = onBackToHome
    }
    
    public var body: some View {
        let scoreAwarded = result?.profileScorePotential ?? 0
        let isDuplicateOrZero = (result?.isDuplicate == true)
        
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            VStack(spacing: PAGSpacing.xl) {
                Spacer()
                
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(PAGTheme.success)
                
                Text(isDuplicateOrZero ? "Yanıtınız Güncellendi" : "Anket Tamamlandı")
                    .font(PAGTypography.display)
                    .foregroundColor(PAGTheme.textPrimary)
                
                VStack(spacing: PAGSpacing.md) {
                    Text("Cevaplarınız güvenli şekilde kaydedildi.")
                        .font(PAGTypography.bodyLarge)
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                    
                    if scoreAwarded > 0 {
                        Text("+\(scoreAwarded) Profil Puanı Kazanıldı!")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.brandLime)
                    }
                    
                    if let rewardAmount = result?.rewardAwarded, rewardAmount > 0, result?.rewardType == "MONEY" {
                        Text("\(rewardAmount) TL Kazandınız!")
                            .font(PAGTypography.display)
                            .foregroundColor(PAGTheme.brandLime)
                    } else if result?.rewardType == "VOUCHER", let vCode = result?.voucherCode {
                        VStack(spacing: 4) {
                            Text("Hediye Çekiniz Hazır!")
                                .font(PAGTypography.heading)
                                .foregroundColor(PAGTheme.warning)
                            Text("KOD: \(vCode)")
                                .font(PAGTypography.bodyLarge)
                                .foregroundColor(PAGTheme.brandLime)
                        }
                    }
                }
                .padding()
                .background(PAGTheme.surfaceSecondary)
                .cornerRadius(PAGRadius.medium)
                
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
        .onAppear {
            if let newScore = result?.currentProfileScore {
                UserService.shared.updateUserProfileScore(newScore: newScore)
                Task {
                    await UserService.shared.fetchUserRanking()
                    await RewardService.shared.fetchUserRewards()
                }
            }
        }
    }
}

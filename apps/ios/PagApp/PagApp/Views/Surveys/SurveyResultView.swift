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
        let awardedScore = result?.profileScorePotential ?? 0
        let isDuplicateOrZero = (result?.isDuplicate == true) || (awardedScore <= 0)
        
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
                    
                    if awardedScore > 0 {
                        Text("+\(awardedScore) Profil Puanı Kazanıldı!")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.brandLime)
                    } else {
                        Text("Profil cevaplarınız güncellendi. Daha önce kazanılan puanınız korundu.")
                            .font(PAGTypography.bodySmall)
                            .foregroundColor(PAGTheme.textSecondary)
                            .multilineTextAlignment(.center)
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
                }
            }
        }
    }
}

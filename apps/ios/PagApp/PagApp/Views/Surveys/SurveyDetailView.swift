import SwiftUI

public struct SurveyDetailView: View {
    public let surveyId: String
    @Binding public var navPath: NavigationPath
    
    @StateObject private var surveyService = SurveyService.shared
    @State private var survey: PAGSurvey? = nil
    @State private var isLoading: Bool = true
    @State private var errorMessage: String? = nil
    
    public init(surveyId: String, navPath: Binding<NavigationPath>) {
        self.surveyId = surveyId
        self._navPath = navPath
    }
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            if isLoading {
                ProgressView("Anket Yükleniyor...")
                    .tint(PAGTheme.brandLime)
            } else if let error = errorMessage {
                VStack(spacing: PAGSpacing.md) {
                    Text(error)
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.error)
                        .multilineTextAlignment(.center)
                    
                    Button("Tekrar Dene") {
                        Task {
                            await loadDetail()
                        }
                    }
                    .font(PAGTypography.heading)
                    .foregroundColor(PAGTheme.brandLime)
                }
                .padding(PAGSpacing.lg)
            } else if let survey = survey {
                ScrollView {
                    VStack(alignment: .leading, spacing: PAGSpacing.lg) {
                        
                        // Header
                        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                            PAGBadge(
                                title: survey.ownerDisplayName,
                                iconName: survey.surveyType == "PROFILE" ? "person.crop.circle" : "building.2",
                                style: .tag
                            )
                            
                            Text(survey.title)
                                .font(PAGTypography.display)
                                .foregroundColor(PAGTheme.textPrimary)
                                .fixedSize(horizontal: false, vertical: true)
                            
                            Text(survey.description)
                                .font(PAGTypography.body)
                                .foregroundColor(PAGTheme.textSecondary)
                        }
                        
                        Divider().background(PAGTheme.borderDefault)
                        
                        // Details Grid
                        VStack(spacing: PAGSpacing.md) {
                            DetailRow(icon: "list.bullet.clipboard", title: "Soru Sayısı", value: "\(survey.questionCount) Soru (Max 3)")
                            DetailRow(icon: "clock", title: "Yaklaşık Süre", value: survey.estimatedDurationText)
                            DetailRow(icon: "shield.checkmark", title: "Anket Tipi", value: survey.surveyType == "PROFILE" ? "Profil Anketi (Güncellenebilir)" : "Standart Anket")
                        }
                        
                        Divider().background(PAGTheme.borderDefault)
                        
                        // Rewards
                        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                            Text("Potansiyel Kazanım")
                                .font(PAGTypography.title)
                                .foregroundColor(PAGTheme.textPrimary)
                            
                            HStack(spacing: PAGSpacing.md) {
                                RewardBox(
                                    title: "Profil Puanı Potansiyeli",
                                    value: "+\(survey.profileScoreReward)",
                                    color: PAGTheme.brandLime,
                                    icon: "bolt.fill"
                                )
                            }
                        }
                        
                        Spacer().frame(height: 100)
                    }
                    .padding(PAGSpacing.md)
                }
                
                // Bottom Action
                VStack {
                    Spacer()
                    VStack(spacing: PAGSpacing.sm) {
                        Text(survey.isCompleted ? "Bu anketi daha önce tamamladınız." : "Hızlı tamamla, profil puanı sıralamasında öne geç.")
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.textMuted)
                        
                        NavigationLink(destination: SurveyFlowView(survey: survey, navPath: $navPath)) {
                            Text(survey.surveyType == "PROFILE" && survey.isCompleted ? "ANKETİ GÜNCELLE" : "ANKETE BAŞLA")
                                .font(PAGTypography.heading)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(survey.status == "ACTIVE" ? PAGTheme.brandLime : PAGTheme.borderDefault)
                                .foregroundColor(survey.status == "ACTIVE" ? PAGTheme.brandMidnight : PAGTheme.textMuted)
                                .cornerRadius(PAGRadius.medium)
                        }
                        .disabled(survey.status != "ACTIVE" || (survey.isCompleted && survey.surveyType != "PROFILE"))
                    }
                    .padding()
                    .background(PAGTheme.surfacePrimary.opacity(0.95))
                    .shadow(color: Color.black.opacity(0.05), radius: 10, y: -5)
                }
            }
        }
        .navigationTitle("Anket Detayı")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadDetail()
        }
    }
    
    private func loadDetail() async {
        self.isLoading = true
        self.errorMessage = nil
        do {
            self.survey = try await surveyService.fetchSurveyDetail(surveyId: surveyId)
            self.isLoading = false
        } catch {
            self.errorMessage = "Anket detayları alınamadı."
            self.isLoading = false
        }
    }
}

private struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 24)
                .foregroundColor(PAGTheme.textMuted)
            Text(title)
                .font(PAGTypography.body)
                .foregroundColor(PAGTheme.textSecondary)
            Spacer()
            Text(value)
                .font(PAGTypography.bodyLarge)
                .foregroundColor(PAGTheme.textPrimary)
        }
    }
}

private struct RewardBox: View {
    let title: String
    let value: String
    let color: Color
    let icon: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(color)
            Text(value)
                .font(PAGTypography.heading)
                .foregroundColor(color)
                .fixedSize(horizontal: false, vertical: true)
            Text(title)
                .font(PAGTypography.bodySmall)
                .foregroundColor(PAGTheme.textSecondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(PAGTheme.surfaceSecondary)
        .cornerRadius(PAGRadius.large)
    }
}

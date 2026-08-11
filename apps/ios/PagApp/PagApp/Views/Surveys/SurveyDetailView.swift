import SwiftUI

public struct SurveyDetailView: View {
    public let survey: SurveyMock
    @Environment(\.dismiss) private var dismiss
    
    public init(survey: SurveyMock) {
        self.survey = survey
    }
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            ScrollView {
                VStack(alignment: .leading, spacing: PAGSpacing.lg) {
                    
                    // Header
                    VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                        PAGBadge(
                            title: survey.ownerName,
                            iconName: survey.isProfileSurvey ? "person.crop.circle" : "building.2",
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
                        DetailRow(icon: "list.bullet.clipboard", title: "Soru Sayısı", value: "\(survey.questions.count) Soru")
                        DetailRow(icon: "clock", title: "Yaklaşık Süre", value: "\(survey.estimatedDurationMinutes) Dakika")
                        if let date = survey.endDate {
                            DetailRow(icon: "calendar", title: "Son Katılım", value: date.formatted(date: .numeric, time: .omitted))
                        }
                    }
                    
                    Divider().background(PAGTheme.borderDefault)
                    
                    // Rewards
                    VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                        Text("Kazanımlar")
                            .font(PAGTypography.title)
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        HStack(spacing: PAGSpacing.md) {
                            RewardBox(
                                title: "Profil Puanı",
                                value: "+\(survey.profileScoreReward)",
                                color: PAGTheme.brandLime,
                                icon: "bolt.fill"
                            )
                            
                            if let rewardPool = survey.rewardPoolText {
                                RewardBox(
                                    title: "Ödül Havuzu",
                                    value: rewardPool,
                                    color: PAGTheme.brandBlue,
                                    icon: "gift.fill"
                                )
                            }
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
                    Text("Hızlı tamamla, ödül sıralamasında öne geç.")
                        .font(PAGTypography.caption)
                        .foregroundColor(PAGTheme.textMuted)
                    
                    NavigationLink(destination: SurveyFlowView(survey: survey)) {
                        Text("ANKETE BAŞLA")
                            .font(PAGTypography.heading)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(survey.status == .active ? PAGTheme.brandLime : PAGTheme.borderDefault)
                            .foregroundColor(survey.status == .active ? PAGTheme.brandMidnight : PAGTheme.textMuted)
                            .cornerRadius(PAGRadius.medium)
                    }
                    .disabled(survey.status != .active)
                }
                .padding()
                .background(PAGTheme.surfacePrimary.opacity(0.95))
                .shadow(color: Color.black.opacity(0.05), radius: 10, y: -5)
            }
        }
        .navigationTitle("Anket Detayı")
        .navigationBarTitleDisplayMode(.inline)
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

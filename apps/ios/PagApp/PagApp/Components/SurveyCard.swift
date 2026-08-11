import SwiftUI

public struct SurveyCard: View {
    private let survey: SurveyMock
    private let onTakeSurvey: () -> Void
    
    public init(
        survey: SurveyMock,
        onTakeSurvey: @escaping () -> Void = {}
    ) {
        self.survey = survey
        self.onTakeSurvey = onTakeSurvey
    }
    
    public var body: some View {
        PAGCard(
            backgroundColor: PAGTheme.surfacePrimary,
            borderColor: PAGTheme.borderDefault,
            cornerRadius: PAGRadius.xl
        ) {
            VStack(alignment: .leading, spacing: PAGSpacing.xs) {
                // Header: Owner & Duration
                HStack {
                    PAGBadge(
                        title: survey.ownerName,
                        iconName: survey.surveyType == .profile ? "person.crop.circle" : "building.2",
                        style: .tag
                    )
                    
                    Spacer()
                    
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.system(size: 12))
                            .foregroundColor(PAGTheme.textMuted)
                        Text("\(survey.estimatedDurationMinutes) dk")
                            .font(PAGTypography.bodySmall)
                            .foregroundColor(PAGTheme.textMuted)
                    }
                }
                
                // Title
                Text(survey.title)
                    .font(PAGTypography.heading)
                    .foregroundColor(PAGTheme.textPrimary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                
                // Badges row: Profile Score & Reward Pool
                HStack(spacing: PAGSpacing.xxs) {
                    PAGBadge(
                        title: "+\(survey.profileScoreReward) Profil Puanı",
                        iconName: "bolt.fill",
                        style: .profileScore
                    )
                    
                    
                    if survey.surveyType == .profile {
                        PAGBadge(
                            title: "Profil",
                            iconName: "person.fill",
                            style: .info
                        )
                    } else {
                        if let amount = survey.rewardAmount {
                            PAGBadge(
                                title: "\(Int(amount)) TL Ödül Havuzu",
                                iconName: "gift.fill",
                                style: .rewardPool
                            )
                        } else if let voucher = survey.voucherTitle {
                            PAGBadge(
                                title: voucher,
                                iconName: "gift.fill",
                                style: .rewardPool
                            )
                        }
                    }
                }
                .padding(.top, 2)
                
                Spacer().frame(height: 2)
                
                // CTA Button
                PAGButton(
                    title: "Ankete Katıl",
                    iconName: "arrow.right",
                    style: .primary,
                    action: onTakeSurvey
                )
            }
        }
    }
}

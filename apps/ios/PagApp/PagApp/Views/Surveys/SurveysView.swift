import SwiftUI

public struct SurveysView: View {
    @StateObject private var surveyService = SurveyService.shared
    @State private var selectedTab: Int = 0 // 0: Bekleyen Anketler, 1: Tamamlanan Anketler
    @State private var navPath = NavigationPath()
    
    public init() {}
    
    public var body: some View {
        NavigationStack(path: $navPath) {
            ZStack {
                PAGTheme.backgroundPrimary.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // ==================================================
                    // CORPORATE SEGMENTED TAB BUTTONS
                    // ==================================================
                    HStack(spacing: 0) {
                        // Bekleyen Anketler Tab
                        Button(action: {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                selectedTab = 0
                            }
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 14))
                                Text("Bekleyen")
                                    .font(PAGTypography.heading)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(selectedTab == 0 ? PAGTheme.surfacePrimary : Color.clear)
                            .foregroundColor(selectedTab == 0 ? PAGTheme.brandLime : PAGTheme.textMuted)
                            .cornerRadius(PAGRadius.small)
                        }

                        // Tamamlanan Anketler Tab
                        Button(action: {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                selectedTab = 1
                            }
                            Task {
                                await surveyService.fetchCompletedSurveys()
                            }
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.system(size: 14))
                                Text("Tamamlanan")
                                    .font(PAGTypography.heading)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(selectedTab == 1 ? PAGTheme.surfacePrimary : Color.clear)
                            .foregroundColor(selectedTab == 1 ? PAGTheme.brandLime : PAGTheme.textMuted)
                            .cornerRadius(PAGRadius.small)
                        }
                    }
                    .padding(4)
                    .background(PAGTheme.surfaceSecondary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(
                        RoundedRectangle(cornerRadius: PAGRadius.medium)
                            .stroke(PAGTheme.borderDefault, lineWidth: 1)
                    )
                    .padding(.horizontal, PAGSpacing.md)
                    .padding(.vertical, PAGSpacing.md)
                    
                    // ==================================================
                    // SURVEY LIST CONTENT
                    // ==================================================
                    if surveyService.isLoading {
                        Spacer()
                        ProgressView()
                            .tint(PAGTheme.brandLime)
                        Spacer()
                    } else if let errorMsg = surveyService.errorMessage {
                        Spacer()
                        VStack(spacing: PAGSpacing.md) {
                            Text(errorMsg)
                                .font(PAGTypography.body)
                                .foregroundColor(PAGTheme.error)
                                .multilineTextAlignment(.center)
                            
                            Button(action: {
                                Task {
                                    await surveyService.fetchEligibleSurveys()
                                    await surveyService.fetchCompletedSurveys()
                                }
                            }) {
                                Text("Yeniden Dene")
                                    .font(PAGTypography.heading)
                                    .foregroundColor(PAGTheme.brandMidnight)
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 12)
                                    .background(PAGTheme.brandLime)
                                    .cornerRadius(PAGRadius.medium)
                            }
                        }
                        .padding(PAGSpacing.lg)
                        Spacer()
                    } else {
                        ScrollView {
                            VStack(spacing: PAGSpacing.md) {
                                let currentList = selectedTab == 0 ? surveyService.eligibleSurveys : surveyService.completedSurveys
                                
                                if currentList.isEmpty {
                                    VStack(spacing: 12) {
                                        Image(systemName: selectedTab == 0 ? "tray.fill" : "checkmark.circle.trianglebadge.exclamationmark")
                                            .font(.system(size: 44))
                                            .foregroundColor(PAGTheme.textMuted)
                                        Text(selectedTab == 0 ? "Henüz bekleyen anket bulunmuyor." : "Henüz tamamlanmış anketiniz bulunmuyor.")
                                            .font(PAGTypography.body)
                                            .foregroundColor(PAGTheme.textMuted)
                                            .multilineTextAlignment(.center)
                                    }
                                    .padding(.top, 60)
                                } else {
                                    ForEach(currentList) { survey in
                                        if selectedTab == 0 {
                                            Button(action: {
                                                navPath.append(survey.surveyId)
                                            }) {
                                                PAGSurveyCardView(survey: survey)
                                            }
                                            .buttonStyle(PlainButtonStyle())
                                        } else {
                                            PAGCompletedSurveyCardView(survey: survey)
                                        }
                                    }
                                }
                            }
                            .padding(PAGSpacing.md)
                        }
                    }
                }
            }
            .navigationTitle("Anketler")
            .navigationDestination(for: String.self) { surveyId in
                SurveyDetailView(surveyId: surveyId, navPath: $navPath)
            }
            .task {
                await surveyService.fetchEligibleSurveys()
                await surveyService.fetchCompletedSurveys()
            }
        }
    }
}

public struct PAGCompletedSurveyCardView: View {
    public let survey: PAGSurvey
    
    public init(survey: PAGSurvey) {
        self.survey = survey
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
            HStack {
                PAGBadge(
                    title: survey.ownerDisplayName,
                    iconName: survey.surveyType == "PROFILE" ? "person.crop.circle" : "building.2",
                    style: .tag
                )
                Spacer()
                PAGBadge(
                    title: "Tamamlandı",
                    iconName: "checkmark.circle.fill",
                    style: .info
                )
            }
            
            Text(survey.title)
                .font(PAGTypography.heading)
                .foregroundColor(PAGTheme.textPrimary)
                .lineLimit(1)
                .truncationMode(.tail)
                .multilineTextAlignment(.leading)
            
            Text(survey.description)
                .font(PAGTypography.bodySmall)
                .foregroundColor(PAGTheme.textSecondary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
            
            HStack {
                Text("Kazanılan Ödül:")
                    .font(PAGTypography.caption)
                    .foregroundColor(PAGTheme.textMuted)
                Text("+\(survey.profileScoreReward) Profil Puanı")
                    .font(PAGTypography.caption)
                    .fontWeight(.bold)
                    .foregroundColor(PAGTheme.brandLime)
            }
            .padding(.top, 4)
        }
        .padding(PAGSpacing.md)
        .background(PAGTheme.surfacePrimary)
        .cornerRadius(PAGRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: PAGRadius.medium)
                .stroke(PAGTheme.success.opacity(0.3), lineWidth: 1)
        )
    }
}

public struct PAGSurveyCardView: View {
    public let survey: PAGSurvey
    
    public init(survey: PAGSurvey) {
        self.survey = survey
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
            HStack {
                HStack(spacing: 6) {
                    PAGBadge(
                        title: survey.ownerDisplayName,
                        iconName: survey.surveyType == "PROFILE" ? "person.crop.circle" : "building.2",
                        style: .tag
                    )
                    if survey.isHighlighted {
                        PAGBadge(
                            title: "⭐ Öne Çıkan",
                            iconName: "star.fill",
                            style: .rewardPool
                        )
                    }
                }
                Spacer()
                PAGBadge(
                    title: "+\(survey.profileScoreReward) Puan",
                    iconName: "bolt.fill",
                    style: .profileScore
                )
            }
            
            Text(survey.title)
                .font(PAGTypography.heading)
                .foregroundColor(PAGTheme.textPrimary)
                .lineLimit(1)
                .truncationMode(.tail)
                .multilineTextAlignment(.leading)
            
            if !survey.description.isEmpty {
                Text(survey.description)
                    .font(PAGTypography.bodySmall)
                    .foregroundColor(PAGTheme.textSecondary)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            HStack {
                Label("\(survey.questionCount > 0 ? survey.questionCount : 3) Soru", systemImage: "questionmark.circle")
                    .font(PAGTypography.caption)
                    .foregroundColor(PAGTheme.textMuted)
                Spacer()
                Text("Katıl →")
                    .font(PAGTypography.caption)
                    .fontWeight(.bold)
                    .foregroundColor(PAGTheme.brandLime)
            }
            .padding(.top, 4)
        }
        .padding(PAGSpacing.md)
        .background(PAGTheme.surfacePrimary)
        .cornerRadius(PAGRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: PAGRadius.medium)
                .stroke(survey.isHighlighted ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: survey.isHighlighted ? 1.5 : 1)
        )
    }
}

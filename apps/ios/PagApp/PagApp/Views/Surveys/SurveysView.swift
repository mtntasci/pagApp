import SwiftUI

public struct SurveysView: View {
    @StateObject private var surveyService = SurveyService.shared
    @State private var selectedCategory: String = "Sana Uygun"
    @State private var navPath = NavigationPath()
    
    public init() {}
    
    public var body: some View {
        NavigationStack(path: $navPath) {
            ZStack {
                PAGTheme.backgroundPrimary.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: PAGSpacing.sm) {
                            ForEach(["Sana Uygun", "Yeni", "Tamamlanan"], id: \.self) { category in
                                Button(action: {
                                    withAnimation {
                                        selectedCategory = category
                                    }
                                }) {
                                    Text(category)
                                        .font(PAGTypography.bodyLarge)
                                        .padding(.vertical, 8)
                                        .padding(.horizontal, 16)
                                        .background(selectedCategory == category ? PAGTheme.brandMidnight : Color.clear)
                                        .foregroundColor(selectedCategory == category ? PAGTheme.brandLime : PAGTheme.textSecondary)
                                        .cornerRadius(PAGRadius.pill)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: PAGRadius.pill)
                                                .stroke(selectedCategory == category ? Color.clear : PAGTheme.borderDefault, lineWidth: 1)
                                        )
                                }
                            }
                        }
                        .padding(.horizontal, PAGSpacing.md)
                        .padding(.vertical, PAGSpacing.sm)
                    }
                    
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
                                let filtered = filteredSurveys(category: selectedCategory)
                                if filtered.isEmpty {
                                    Text("Bu kategoride anket bulunmuyor.")
                                        .font(PAGTypography.body)
                                        .foregroundColor(PAGTheme.textMuted)
                                        .padding(.top, 40)
                                } else {
                                    ForEach(filtered) { survey in
                                        Button(action: {
                                            navPath.append(survey.surveyId)
                                        }) {
                                            PAGSurveyCardView(survey: survey)
                                        }
                                        .buttonStyle(PlainButtonStyle())
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
            }
        }
    }
    
    private func filteredSurveys(category: String) -> [PAGSurvey] {
        switch category {
        case "Tamamlanan":
            return surveyService.eligibleSurveys.filter { $0.isCompleted }
        case "Yeni":
            return surveyService.eligibleSurveys.filter { !$0.isCompleted && $0.surveyType != "PROFILE" }
        default: // Sana Uygun
            return surveyService.eligibleSurveys.filter { !$0.isCompleted }
        }
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
                PAGBadge(
                    title: survey.ownerDisplayName,
                    iconName: survey.surveyType == "PROFILE" ? "person.crop.circle" : "building.2",
                    style: .tag
                )
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
                .multilineTextAlignment(.leading)
            
            Text(survey.description)
                .font(PAGTypography.bodySmall)
                .foregroundColor(PAGTheme.textSecondary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
            
            HStack {
                Image(systemName: "clock")
                    .foregroundColor(PAGTheme.textMuted)
                Text(survey.estimatedDurationText)
                    .font(PAGTypography.caption)
                    .foregroundColor(PAGTheme.textMuted)
                
                Spacer()
                
                Text(survey.isCompleted ? "Tamamlandı" : "Katıl")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(survey.isCompleted ? PAGTheme.textMuted : PAGTheme.brandLime)
            }
            .padding(.top, 4)
        }
        .padding(PAGSpacing.md)
        .background(PAGTheme.surfacePrimary)
        .cornerRadius(PAGRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: PAGRadius.medium)
                .stroke(PAGTheme.borderDefault, lineWidth: 1)
        )
    }
}

#Preview {
    SurveysView()
}

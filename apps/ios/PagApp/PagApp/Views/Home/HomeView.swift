import SwiftUI

public struct HomeView: View {
    @StateObject private var userService = UserService.shared
    @StateObject private var surveyService = SurveyService.shared
    @StateObject private var profileSurveyService = ProfileSurveyService.shared
    @StateObject private var basicProfileService = BasicProfileService.shared
    @StateObject private var storyService = StoryService.shared
    @StateObject private var verificationService = VerificationService.shared
    @State private var navPath = NavigationPath()
    @State private var targetFlowSurvey: PAGSurvey? = nil
    public var onNavigateToSurveys: (() -> Void)? = nil
    
    public init(onNavigateToSurveys: (() -> Void)? = nil) {
        self.onNavigateToSurveys = onNavigateToSurveys
    }
    
    private var storyItems: [StoryItemType] {
        var items: [StoryItemType] = [.home]
        let sortedStories = storyService.stories
            .filter { $0.isActive }
            .sorted { $0.position < $1.position }
        items.append(contentsOf: sortedStories.map { .story($0) })
        return items
    }
    
    public var body: some View {
        Group {
            if let pending = verificationService.pendingVerification {
                PendingVerificationView(pending: pending) {
                    verificationService.dismissForNow()
                }
            } else {
                NavigationStack(path: $navPath) {
                    ZStack {
                        PAGTheme.backgroundPrimary
                            .ignoresSafeArea()
                
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 0) {
                        PAGStoryBar(items: storyItems) { item in
                            switch item {
                            case .home:
                                if !navPath.isEmpty {
                                    navPath = NavigationPath()
                                }
                            case .story(let story):
                                if story.type == .survey, let sid = story.surveyId {
                                    Task {
                                        if let detail = try? await surveyService.fetchSurveyDetail(surveyId: sid) {
                                            self.targetFlowSurvey = detail
                                            navPath.append(HomeRoute.surveyFlow(sid))
                                        }
                                    }
                                } else if story.type == .earnProfileScore {
                                    navPath.append(HomeRoute.earnProfileScore)
                                }
                            }
                        }
                        
                        VStack(spacing: PAGSpacing.lg) {
                            
                            // ==================================================
                            // HOME PROMOTION CARD: "Profili Güçlendir" (Appears ONLY IF Basic Profile is Complete)
                            // ==================================================
                            let isBasicComplete = (userService.currentUser?.profileCompleted ?? false) || basicProfileService.basicProfile.completionPercentage == 100
                            
                            if isBasicComplete && profileSurveyService.hasPromotedQuestion {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text("Puan kazanmak ister misin?")
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Spacer()
                                        Image(systemName: "sparkles")
                                            .foregroundColor(PAGTheme.brandLime)
                                    }
                                    
                                    Text("Hadi profilini güçlendirelim.")
                                        .font(PAGTypography.body)
                                        .foregroundColor(PAGTheme.textMuted)
                                    
                                    NavigationLink(destination: ProfileSurveysView()) {
                                        HStack {
                                            Text("Profili Güçlendir")
                                                .font(PAGTypography.heading)
                                                .foregroundColor(PAGTheme.brandMidnight)
                                            Spacer()
                                            Image(systemName: "arrow.right")
                                                .foregroundColor(PAGTheme.brandMidnight)
                                        }
                                        .padding(.vertical, 12)
                                        .padding(.horizontal, 16)
                                        .background(PAGTheme.brandLime)
                                        .cornerRadius(PAGRadius.medium)
                                    }
                                    .padding(.top, 4)
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: PAGRadius.medium)
                                        .stroke(PAGTheme.brandLime, lineWidth: 1.5)
                                )
                            }
                            
                            ProfileScoreCard()
                            
                            VStack(alignment: .leading, spacing: PAGSpacing.md) {
                                HStack {
                                    Text("Aktif Anketler")
                                        .font(PAGTypography.title)
                                        .foregroundColor(PAGTheme.textPrimary)
                                    Spacer()
                                }
                                
                                if surveyService.isLoading {
                                    ProgressView()
                                        .tint(PAGTheme.brandLime)
                                } else if surveyService.eligibleSurveys.isEmpty {
                                    Text("Şu an için katılabileceğiniz aktif anket bulunmuyor.")
                                        .font(PAGTypography.bodySmall)
                                        .foregroundColor(PAGTheme.textMuted)
                                } else {
                                    ForEach(surveyService.eligibleSurveys.prefix(5)) { survey in
                                        Button(action: {
                                            navPath.append(HomeRoute.surveyDetail(survey.surveyId))
                                        }) {
                                            PAGSurveyCardView(survey: survey)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                    
                                    if !surveyService.eligibleSurveys.isEmpty {
                                        Button(action: {
                                            onNavigateToSurveys?()
                                        }) {
                                            HStack {
                                                Text("Tüm Bekleyen Anketleri Gör (\(surveyService.eligibleSurveys.count))")
                                                    .font(PAGTypography.heading)
                                                    .foregroundColor(PAGTheme.brandLime)
                                                Spacer()
                                                Image(systemName: "arrow.right")
                                                    .foregroundColor(PAGTheme.brandLime)
                                            }
                                            .padding(.vertical, 14)
                                            .padding(.horizontal, 16)
                                            .background(PAGTheme.surfaceSecondary)
                                            .cornerRadius(PAGRadius.medium)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: PAGRadius.medium)
                                                    .stroke(PAGTheme.borderDefault, lineWidth: 1)
                                            )
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, PAGSpacing.sm)
                        .padding(.vertical, PAGSpacing.md)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationBarHidden(true)
            .navigationDestination(for: HomeRoute.self) { route in
                switch route {
                case .surveyDetail(let surveyId):
                    SurveyDetailView(surveyId: surveyId, navPath: $navPath)
                case .surveyFlow(let surveyId):
                    if let target = targetFlowSurvey, target.surveyId == surveyId {
                        SurveyFlowView(survey: target, navPath: $navPath)
                    } else {
                        SurveyDetailView(surveyId: surveyId, navPath: $navPath)
                    }
                case .earnProfileScore:
                    EarnProfileScoreView()
                }
            }
            .task {
                await verificationService.checkPendingVerification()
                await basicProfileService.fetchBasicProfile()
                await storyService.fetchStories()
                await surveyService.fetchEligibleSurveys()
                await profileSurveyService.fetchProfileQuestions(batchSize: 3)
            }
        }
    }
}
}
}

#Preview {
    HomeView()
}

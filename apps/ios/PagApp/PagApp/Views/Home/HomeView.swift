import SwiftUI

public struct HomeView: View {
    @StateObject private var userService = UserService.shared
    @StateObject private var surveyService = SurveyService.shared
    @State private var navPath = NavigationPath()
    @State private var targetFlowSurvey: PAGSurvey? = nil
    
    public init() {}
    
    private var storyItems: [StoryItemType] {
        var items: [StoryItemType] = [.home]
        let sortedStories = StoryMock.sampleList
            .filter { $0.isActive }
            .sorted { $0.position < $1.position }
        items.append(contentsOf: sortedStories.map { .story($0) })
        return items
    }
    
    public var body: some View {
        NavigationStack(path: $navPath) {
            ZStack {
                PAGTheme.backgroundPrimary
                    .ignoresSafeArea()
                
                ScrollView {
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
                                }
                            }
                        }
                        .padding(.horizontal, PAGSpacing.sm)
                        .padding(.vertical, PAGSpacing.md)
                    }
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
                await surveyService.fetchEligibleSurveys()
            }
        }
    }
}

#Preview {
    HomeView()
}

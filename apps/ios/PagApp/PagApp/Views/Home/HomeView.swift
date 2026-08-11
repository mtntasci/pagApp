import SwiftUI

public struct HomeView: View {
    private let user: UserProfileMock = .sample
    private let surveys: [SurveyMock] = SurveyMock.sampleList
    
    public init() {}
    @State private var navPath = NavigationPath()
    
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
                                // Already at home root, maybe clear path if not empty
                                if !navPath.isEmpty {
                                    navPath = NavigationPath()
                                }
                            case .story(let story):
                                if story.type == .survey {
                                    if let sid = story.surveyId {
                                        navPath.append(HomeRoute.surveyFlow(sid))
                                    }
                                } else if story.type == .earnProfileScore {
                                    navPath.append(HomeRoute.earnProfileScore)
                                }
                            }
                        }
                        
                        VStack(spacing: PAGSpacing.lg) {
                            // Profile Score & Advantage Card
                            ProfileScoreCard(user: user)
                        
                        ActiveSurveysSection(
                            surveys: surveys,
                            onSelectSurvey: { survey in
                                navPath.append(HomeRoute.surveyDetail(survey.id))
                            }
                        )
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
                    if let survey = surveys.first(where: { $0.id == surveyId }) {
                        SurveyDetailView(survey: survey, navPath: $navPath)
                    }
                case .surveyFlow(let surveyId):
                    if let survey = surveys.first(where: { $0.id == surveyId }) {
                        SurveyFlowView(survey: survey, navPath: $navPath)
                    }
                case .earnProfileScore:
                    EarnProfileScoreView()
                }
            }
        }
    }
}

#Preview {
    HomeView()
}

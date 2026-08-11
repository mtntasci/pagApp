import SwiftUI

public struct HomeView: View {
    private let user: UserProfileMock = .sample
    private let surveys: [SurveyMock] = SurveyMock.sampleList
    
    public init() {}
    @State private var navPath = NavigationPath()
    
    private var storyItems: [StoryItemType] {
        var items: [StoryItemType] = [.home]
        
        // Mock order: Home -> 2 Surveys -> Earn -> 2 Surveys
        if surveys.count > 0 { items.append(.survey(surveys[0])) }
        if surveys.count > 1 { items.append(.survey(surveys[1])) }
        items.append(.earnProfileScore)
        if surveys.count > 2 { items.append(.survey(surveys[2])) }
        if surveys.count > 3 { items.append(.survey(surveys[3])) }
        
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
                            case .survey(let survey):
                                navPath.append(HomeRoute.surveyFlow(survey.id))
                            case .earnProfileScore:
                                navPath.append(HomeRoute.earnProfileScore)
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

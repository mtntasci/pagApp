import SwiftUI

public struct HomeView: View {
    private let user: UserProfileMock = .sample
    private let surveys: [SurveyMock] = SurveyMock.sampleList
    
    public init() {}
    @State private var navPath = NavigationPath()
    
    public var body: some View {
        NavigationStack(path: $navPath) {
            ZStack {
                PAGTheme.backgroundPrimary
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAGSpacing.lg) {
                        // Profile Score & Advantage Card
                        ProfileScoreCard(user: user)
                        
                        ActiveSurveysSection(
                            surveys: surveys,
                            onSelectSurvey: { survey in
                                navPath.append(survey.id)
                            }
                        )
                    }
                    .padding(.horizontal, PAGSpacing.sm)
                    .padding(.vertical, PAGSpacing.md)
                }
            }
            .navigationTitle("PAG")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "bell")
                            .foregroundColor(PAGTheme.textPrimary)
                    }
                }
            }
            .navigationDestination(for: String.self) { surveyId in
                if let survey = surveys.first(where: { $0.id == surveyId }) {
                    SurveyDetailView(survey: survey, navPath: $navPath)
                }
            }
        }
    }
}

#Preview {
    HomeView()
}

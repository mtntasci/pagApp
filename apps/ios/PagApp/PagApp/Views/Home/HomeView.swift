import SwiftUI

public struct HomeView: View {
    private let user: UserProfileMock = .sample
    private let surveys: [SurveyMock] = SurveyMock.sampleList
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ZStack {
                PAGTheme.backgroundPrimary
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: PAGSpacing.lg) {
                        // Profile Score & Advantage Card
                        ProfileScoreCard(user: user)
                        
                        // Active Surveys Section
                        ActiveSurveysSection(
                            surveys: surveys,
                            onSelectSurvey: { survey in
                                // CTA action preview
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
        }
    }
}

#Preview {
    HomeView()
}

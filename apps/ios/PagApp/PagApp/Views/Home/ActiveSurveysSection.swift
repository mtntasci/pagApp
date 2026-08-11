import SwiftUI

public struct ActiveSurveysSection: View {
    private let surveys: [SurveyMock]
    private let onSelectSurvey: (SurveyMock) -> Void
    
    public init(
        surveys: [SurveyMock] = SurveyMock.sampleList,
        onSelectSurvey: @escaping (SurveyMock) -> Void = { _ in }
    ) {
        self.surveys = surveys
        self.onSelectSurvey = onSelectSurvey
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Sana Özel Aktif Anketler")
                        .font(PAGTypography.title)
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    Text("Profil skorun sayesinde öncelikli erişim sağlandı")
                        .font(PAGTypography.bodySmall)
                        .foregroundColor(PAGTheme.textSecondary)
                }
                
                Spacer()
                
                PAGBadge(
                    title: "\(surveys.count) Aktif",
                    style: .info
                )
            }
            
            // Survey Cards List
            VStack(spacing: PAGSpacing.sm) {
                ForEach(surveys) { survey in
                    SurveyCard(
                        survey: survey,
                        onTakeSurvey: {
                            onSelectSurvey(survey)
                        }
                    )
                }
            }
        }
    }
}

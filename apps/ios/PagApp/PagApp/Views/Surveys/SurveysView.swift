import SwiftUI

public struct SurveysView: View {
    @State private var selectedCategory: SurveyCategory = .forYou
    
    public init() {}
    @State private var navPath = NavigationPath()
    
    public var body: some View {
        NavigationStack(path: $navPath) {
            ZStack {
                PAGTheme.backgroundPrimary.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: PAGSpacing.sm) {
                            ForEach([SurveyCategory.forYou, .new, .completed], id: \.self) { category in
                                Button(action: {
                                    withAnimation {
                                        selectedCategory = category
                                    }
                                }) {
                                    Text(category.rawValue)
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
                    
                    ScrollView {
                        VStack(spacing: PAGSpacing.md) {
                            let filtered = SurveyMock.sampleList.filter { $0.category == selectedCategory }
                            if filtered.isEmpty {
                                Text("Bu kategoride anket bulunmuyor.")
                                    .font(PAGTypography.body)
                                    .foregroundColor(PAGTheme.textMuted)
                                    .padding(.top, 40)
                            } else {
                                ForEach(filtered) { survey in
                                    Button(action: {
                                        navPath.append(survey.id)
                                    }) {
                                        SurveyCard(survey: survey)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                        }
                        .padding(PAGSpacing.md)
                    }
                }
            }
            .navigationTitle("Anketler")
            .navigationDestination(for: String.self) { surveyId in
                if let survey = SurveyMock.sampleList.first(where: { $0.id == surveyId }) {
                    SurveyDetailView(survey: survey, navPath: $navPath)
                }
            }
        }
    }
}

#Preview {
    SurveysView()
}

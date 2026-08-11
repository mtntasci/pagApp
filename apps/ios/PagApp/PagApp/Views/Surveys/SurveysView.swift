import SwiftUI

public struct SurveysView: View {
    @State private var selectedCategory: SurveyCategory = .forYou
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
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
                                    NavigationLink(destination: SurveyDetailView(survey: survey)) {
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
        }
    }
}

#Preview {
    SurveysView()
}

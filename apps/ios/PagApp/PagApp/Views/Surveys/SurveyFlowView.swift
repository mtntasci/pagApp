import SwiftUI

public struct SurveyFlowView: View {
    public let survey: SurveyMock
    
    @Environment(\.dismiss) private var dismiss
    @State private var currentIndex: Int = 0
    @State private var selectedOption: String? = nil
    @State private var showResult = false
    
    public init(survey: SurveyMock) {
        self.survey = survey
    }
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            if showResult {
                SurveyResultView(survey: survey, onBackToHome: {
                    // In a real app with proper NavigationStack, we would pop to root.
                    // For now, dismiss twice or handle navigation state.
                    dismiss()
                })
            } else if let question = survey.questions[safe: currentIndex] {
                VStack(alignment: .leading, spacing: PAGSpacing.xl) {
                    
                    // Progress
                    ProgressView(value: Double(currentIndex + 1), total: Double(survey.questions.count))
                        .progressViewStyle(.linear)
                        .tint(PAGTheme.brandLime)
                    
                    Text(question.text)
                        .font(PAGTypography.display)
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    VStack(spacing: PAGSpacing.sm) {
                        ForEach(question.options, id: \.self) { option in
                            let isSelected = selectedOption == option
                            Button(action: {
                                selectedOption = option
                            }) {
                                HStack {
                                    Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                                        .foregroundColor(isSelected ? PAGTheme.brandLime : PAGTheme.textMuted)
                                    Text(option)
                                        .font(PAGTypography.bodyLarge)
                                        .foregroundColor(isSelected ? PAGTheme.textPrimary : PAGTheme.textSecondary)
                                    Spacer()
                                }
                                .padding(PAGSpacing.md)
                                .background(isSelected ? PAGTheme.surfaceSecondary : PAGTheme.backgroundPrimary)
                                .cornerRadius(PAGRadius.medium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: PAGRadius.medium)
                                        .stroke(isSelected ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: 1)
                                )
                            }
                        }
                    }
                    
                    Spacer()
                    
                    // Bottom CTA
                    PAGButton(
                        title: currentIndex == survey.questions.count - 1 ? "ANKETİ TAMAMLA" : "DEVAM",
                        iconName: currentIndex == survey.questions.count - 1 ? "checkmark" : "arrow.right",
                        style: .primary,
                        action: {
                            if currentIndex < survey.questions.count - 1 {
                                currentIndex += 1
                                selectedOption = nil
                            } else {
                                showResult = true
                            }
                        }
                    )
                    .disabled(selectedOption == nil)
                    .opacity(selectedOption == nil ? 0.5 : 1.0)
                }
                .padding(PAGSpacing.md)
            }
        }
        .navigationTitle("Soru \(currentIndex + 1)/\(survey.questions.count)")
        .navigationBarTitleDisplayMode(.inline)
    }
}

extension Array {
    subscript(safe index: Int) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}

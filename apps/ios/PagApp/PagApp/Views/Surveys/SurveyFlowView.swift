import SwiftUI

public struct SurveyFlowView: View {
    public let survey: PAGSurvey
    @Binding public var navPath: NavigationPath
    
    @StateObject private var surveyService = SurveyService.shared
    @State private var currentIndex: Int = 0
    @State private var selectedOptionId: String? = nil
    @State private var answersMap: [String: String] = [:] // questionId -> optionId
    @State private var isSubmitting: Bool = false
    @State private var submitError: String? = nil
    @State private var completionResult: PAGSurveyCompletionResult? = nil
    
    public init(survey: PAGSurvey, navPath: Binding<NavigationPath>) {
        self.survey = survey
        self._navPath = navPath
    }
    
    private var questions: [PAGQuestion] {
        return Array((survey.questions ?? []).prefix(3))
    }
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            if let result = completionResult {
                SurveyResultView(survey: survey, result: result, onBackToHome: {
                    navPath = NavigationPath()
                })
            } else if questions.isEmpty {
                VStack(spacing: PAGSpacing.md) {
                    Text("Bu ankete ait soru bulunamadı.")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textMuted)
                    Button("Geri Dön") {
                        navPath = NavigationPath()
                    }
                    .font(PAGTypography.heading)
                    .foregroundColor(PAGTheme.brandLime)
                }
            } else if currentIndex < questions.count {
                let question = questions[currentIndex]
                
                VStack(spacing: 0) {
                    // Top Progress Bar
                    ProgressView(value: Double(currentIndex + 1), total: Double(questions.count))
                        .progressViewStyle(.linear)
                        .tint(PAGTheme.brandLime)
                        .padding(.horizontal, PAGSpacing.md)
                        .padding(.top, PAGSpacing.sm)
                        .padding(.bottom, PAGSpacing.md)
                    
                    // Scrollable Question Text & Options
                    ScrollView(.vertical, showsIndicators: false) {
                        VStack(alignment: .leading, spacing: PAGSpacing.lg) {
                            Text(question.text)
                                .font(PAGTypography.display)
                                .foregroundColor(PAGTheme.textPrimary)
                                .multilineTextAlignment(.leading)
                                .fixedSize(horizontal: false, vertical: true)
                            
                            VStack(spacing: PAGSpacing.sm) {
                                ForEach(question.options) { option in
                                    let isSelected = selectedOptionId == option.optionId
                                    Button(action: {
                                        selectedOptionId = option.optionId
                                        answersMap[question.questionId] = option.optionId
                                    }) {
                                        HStack(alignment: .top, spacing: PAGSpacing.sm) {
                                            Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                                                .foregroundColor(isSelected ? PAGTheme.brandLime : PAGTheme.textMuted)
                                                .padding(.top, 2)
                                            Text(option.label)
                                                .font(PAGTypography.bodyLarge)
                                                .foregroundColor(isSelected ? PAGTheme.textPrimary : PAGTheme.textSecondary)
                                                .multilineTextAlignment(.leading)
                                                .fixedSize(horizontal: false, vertical: true)
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
                            
                            if let err = submitError {
                                Text(err)
                                    .font(PAGTypography.caption)
                                    .foregroundColor(PAGTheme.error)
                            }
                            
                            Spacer().frame(height: 120)
                        }
                        .padding(.horizontal, PAGSpacing.md)
                    }
                }
                
                // Bottom Fixed Floating Action Bar (Identical to SurveyDetailView!)
                VStack {
                    Spacer()
                    VStack(spacing: PAGSpacing.xs) {
                        PAGButton(
                            title: isSubmitting ? "GÖNDERİLİYOR..." : (currentIndex == questions.count - 1 ? "ANKETİ TAMAMLA" : "DEVAM"),
                            iconName: currentIndex == questions.count - 1 ? "checkmark" : "arrow.right",
                            style: .primary,
                            action: {
                                if currentIndex < questions.count - 1 {
                                    currentIndex += 1
                                    let nextQId = currentIndex < questions.count ? questions[currentIndex].questionId : ""
                                    selectedOptionId = answersMap[nextQId]
                                } else {
                                    Task {
                                        await performSubmission()
                                    }
                                }
                            }
                        )
                        .disabled(selectedOptionId == nil || isSubmitting)
                        .opacity((selectedOptionId == nil || isSubmitting) ? 0.5 : 1.0)
                    }
                    .padding(.horizontal, PAGSpacing.md)
                    .padding(.top, 12)
                    .padding(.bottom, 24)
                    .background(PAGTheme.surfacePrimary.opacity(0.95))
                    .shadow(color: Color.black.opacity(0.15), radius: 10, y: -5)
                }
            }
        }
        .navigationTitle("Soru \(currentIndex + 1)/\(questions.count)")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func performSubmission() async {
        self.isSubmitting = true
        self.submitError = nil
        
        let answerInputs = answersMap.map { PAGAnswerInput(questionId: $0.key, optionId: $0.value) }
        do {
            let res = try await surveyService.submitSurveyResponse(
                surveyId: survey.surveyId,
                answers: answerInputs,
                isProfile: survey.surveyType == "PROFILE"
            )
            self.completionResult = res
            self.isSubmitting = false
        } catch {
            self.submitError = "Gönderim sırasında hata oluştu. Lütfen tekrar deneyin."
            self.isSubmitting = false
        }
    }
}

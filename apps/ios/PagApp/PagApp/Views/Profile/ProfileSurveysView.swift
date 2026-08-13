import SwiftUI

public struct ProfileSurveysView: View {
    @StateObject private var service = ProfileSurveyService.shared
    @State private var selectedAnswers: [String: String] = [:] // questionId -> optionId
    @State private var showBatchResultModal: Bool = false
    @State private var batchScoreEarned: Int = 0
    @State private var editingAnswerQuestionId: String? = nil
    
    public init() {}

    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: PAGSpacing.lg) {
                    
                    // ==================================================
                    // SECTION 1: YENİ PROFİL SORULARI (MAX 3 BATCH)
                    // ==================================================
                    VStack(alignment: .leading, spacing: PAGSpacing.md) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Profilini Güçlendir")
                                    .font(PAGTypography.title)
                                    .foregroundColor(PAGTheme.textPrimary)
                                Text("Ek soruları yanıtlayarak Profile Score kazan")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(PAGTheme.textMuted)
                            }
                            Spacer()
                            if service.availableScoreX > 0 {
                                Text("+\(service.availableScoreX) Puan Avantajı")
                                    .font(PAGTypography.caption)
                                    .fontWeight(.bold)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(PAGTheme.brandLime)
                                    .foregroundColor(PAGTheme.brandMidnight)
                                    .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal, PAGSpacing.md)
                        
                        if service.isLoading {
                            ProgressView()
                                .frame(maxWidth: .infinity, minHeight: 120)
                        } else if service.unansweredQuestions.isEmpty {
                            // All new questions completed notice
                            VStack(spacing: 12) {
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(PAGTheme.brandLime)
                                Text("Tebrikler! Tüm Profil Sorularını Tamamladınız.")
                                    .font(PAGTypography.heading)
                                    .foregroundColor(PAGTheme.textPrimary)
                                    .multilineTextAlignment(.center)
                                Text("Aşağıdaki 'Daha Önce Yanıtladıklarım' bölümünden yanıtlarınızı istediğiniz zaman güncelleyebilirsiniz.")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(PAGTheme.textMuted)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(24)
                            .frame(maxWidth: .infinity)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .padding(.horizontal, PAGSpacing.md)
                        } else {
                            // Display Batch of Unanswered Questions (Max 3)
                            VStack(spacing: 16) {
                                ForEach(Array(service.unansweredQuestions.enumerated()), id: \.element.id) { index, q in
                                    unansweredQuestionCard(question: q, questionIndex: index + 1)
                                }
                                
                                // Batch Submit Button
                                Button(action: {
                                    Task {
                                        let success = await service.submitBatchAnswers(answers: selectedAnswers)
                                        if success {
                                            batchScoreEarned = service.lastBatchScoreAwarded
                                            selectedAnswers.removeAll()
                                            showBatchResultModal = true
                                        }
                                    }
                                }) {
                                    HStack {
                                        if service.isSubmitting {
                                            ProgressView().progressViewStyle(CircularProgressViewStyle(tint: PAGTheme.brandMidnight))
                                        } else {
                                            Text("Cevapları Gönder & Puan Kazan")
                                                .font(PAGTypography.heading)
                                                .foregroundColor(PAGTheme.brandMidnight)
                                            Image(systemName: "arrow.right")
                                                .foregroundColor(PAGTheme.brandMidnight)
                                        }
                                    }
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 52)
                                    .background(selectedAnswers.count == service.unansweredQuestions.count ? PAGTheme.brandLime : PAGTheme.surfaceSecondary)
                                    .cornerRadius(PAGRadius.medium)
                                }
                                .disabled(selectedAnswers.count != service.unansweredQuestions.count || service.isSubmitting)
                                .opacity(selectedAnswers.count == service.unansweredQuestions.count ? 1.0 : 0.5)
                                .padding(.horizontal, PAGSpacing.md)
                            }
                        }
                    }
                    .padding(.top, PAGSpacing.md)
                    
                    Divider().background(PAGTheme.borderDefault)
                    
                    // ==================================================
                    // SECTION 2: DAHA ÖNCE YANITLADIKLARIM (EDITABLE)
                    // ==================================================
                    VStack(alignment: .leading, spacing: PAGSpacing.md) {
                        HStack {
                            Text("Daha Önce Yanıtladıklarım")
                                .font(PAGTypography.title)
                                .foregroundColor(PAGTheme.textPrimary)
                            Spacer()
                            Text("\(service.answeredQuestions.count) Yanıt")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)
                        }
                        .padding(.horizontal, PAGSpacing.md)
                        
                        if service.answeredQuestions.isEmpty {
                            Text("Henüz önceden yanıtladığınız bir profil sorusu yok.")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)
                                .padding(.horizontal, PAGSpacing.md)
                        } else {
                            ForEach(service.answeredQuestions) { item in
                                answeredQuestionCard(item)
                            }
                        }
                    }
                    
                    Spacer().frame(height: 40)
                }
            }
            
            // ==================================================
            // BATCH SUBMISSION RESULT MODAL ("Yorulmadım, Devam")
            // ==================================================
            if showBatchResultModal {
                Color.black.opacity(0.6).ignoresSafeArea()
                
                VStack(spacing: 20) {
                    Image(systemName: "star.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(PAGTheme.brandLime)
                    
                    Text("Tebrikler!")
                        .font(PAGTypography.display)
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    Text("Bu oturumda +\(batchScoreEarned) Profil Puanı kazandınız!")
                        .font(PAGTypography.heading)
                        .foregroundColor(PAGTheme.brandLime)
                        .multilineTextAlignment(.center)
                    
                    if service.hasMoreUnanswered {
                        Text("Yanıtlayabileceğiniz yeni profil soruları bulunmaktadır.")
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.textMuted)
                            .multilineTextAlignment(.center)
                        
                        // "Yorulmadım, Devam" CTA Button
                        Button(action: {
                            showBatchResultModal = false
                            Task {
                                await service.fetchProfileQuestions(batchSize: 3)
                            }
                        }) {
                            Text("Yorulmadım, Devam")
                                .font(PAGTypography.heading)
                                .foregroundColor(PAGTheme.brandMidnight)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(PAGTheme.brandLime)
                                .cornerRadius(PAGRadius.medium)
                        }
                    }
                    
                    Button(action: {
                        showBatchResultModal = false
                    }) {
                        Text("Şimdilik Tamam")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)
                    }
                }
                .padding(24)
                .background(PAGTheme.surfacePrimary)
                .cornerRadius(PAGRadius.large)
                .padding(.horizontal, 32)
                .shadow(radius: 20)
            }
        }
        .navigationTitle("Ek Profil Soruları")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            Task {
                await service.fetchProfileQuestions(batchSize: 3)
                await service.fetchAnsweredQuestions()
            }
        }
    }
    
    // Unanswered Question Card UI
    @ViewBuilder
    private func unansweredQuestionCard(question: PAGProfileQuestion, questionIndex: Int) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Soru \(questionIndex) / \(service.unansweredQuestions.count)")
                    .font(PAGTypography.caption)
                    .fontWeight(.bold)
                    .foregroundColor(PAGTheme.brandLime)
                Spacer()
                Text("+\(question.profileScoreReward) Puan")
                    .font(PAGTypography.caption)
                    .foregroundColor(PAGTheme.textMuted)
            }
            
            Text(question.questionText)
                .font(PAGTypography.heading)
                .foregroundColor(PAGTheme.textPrimary)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)
            
            VStack(spacing: 8) {
                ForEach(question.options) { opt in
                    let isSelected = selectedAnswers[question.id] == opt.optionId
                    Button(action: {
                        selectedAnswers[question.id] = opt.optionId
                    }) {
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                                .foregroundColor(isSelected ? PAGTheme.brandLime : PAGTheme.textMuted)
                                .padding(.top, 2)
                            Text(opt.label)
                                .font(PAGTypography.body)
                                .foregroundColor(PAGTheme.textPrimary)
                                .multilineTextAlignment(.leading)
                                .fixedSize(horizontal: false, vertical: true)
                            Spacer()
                        }
                        .padding(12)
                        .background(isSelected ? PAGTheme.brandLime.opacity(0.12) : PAGTheme.surfaceSecondary)
                        .cornerRadius(PAGRadius.small)
                        .overlay(
                            RoundedRectangle(cornerRadius: PAGRadius.small)
                                .stroke(isSelected ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: 1)
                        )
                    }
                }
            }
        }
        .padding(16)
        .background(PAGTheme.surfacePrimary)
        .cornerRadius(PAGRadius.medium)
        .padding(.horizontal, PAGSpacing.md)
    }
    
    // Answered Question Card UI (Editable for future changes, ZERO score awarded)
    @ViewBuilder
    private func answeredQuestionCard(_ item: PAGProfileQuestionAnswer) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                PAGBadge(title: item.categoryName, iconName: "folder", style: .tag)
                Spacer()
                Text("Cevaplandı")
                    .font(PAGTypography.caption)
                    .foregroundColor(PAGTheme.success)
            }
            
            Text(item.questionText)
                .font(PAGTypography.heading)
                .foregroundColor(PAGTheme.textPrimary)
            
            VStack(spacing: 6) {
                ForEach(item.options) { opt in
                    let isSelected = item.selectedOptionId == opt.optionId
                    Button(action: {
                        Task {
                            let _ = await service.updateAnswer(questionId: item.questionId, selectedOptionId: opt.optionId)
                        }
                    }) {
                        HStack {
                            Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(isSelected ? PAGTheme.success : PAGTheme.textMuted)
                            Text(opt.label)
                                .font(PAGTypography.body)
                                .foregroundColor(PAGTheme.textPrimary)
                            Spacer()
                        }
                        .padding(10)
                        .background(isSelected ? PAGTheme.success.opacity(0.12) : PAGTheme.surfaceSecondary)
                        .cornerRadius(6)
                    }
                }
            }
        }
        .padding(16)
        .background(PAGTheme.surfacePrimary)
        .cornerRadius(PAGRadius.medium)
        .padding(.horizontal, PAGSpacing.md)
    }
}

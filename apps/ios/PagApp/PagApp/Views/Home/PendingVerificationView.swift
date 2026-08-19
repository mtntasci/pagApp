import SwiftUI

public struct PendingVerificationView: View {
    @ObservedObject private var verificationService = VerificationService.shared
    @State private var isStarted: Bool = false
    @State private var selectedOptionId: String? = nil
    @State private var isCompleted: Bool = false
    @State private var isSubmitting: Bool = false
    @State private var errorText: String? = nil
    
    public let pending: PendingVerificationSurvey
    public var onDismiss: () -> Void
    
    public init(pending: PendingVerificationSurvey, onDismiss: @escaping () -> Void) {
        self.pending = pending
        self.onDismiss = onDismiss
    }
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary
                .ignoresSafeArea()
            
            if isCompleted {
                // Success Completion View
                VStack(spacing: 24) {
                    Spacer()
                    
                    ZStack {
                        Circle()
                            .fill(PAGTheme.brandLime.opacity(0.15))
                            .frame(width: 100, height: 100)
                        
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 52))
                            .foregroundColor(PAGTheme.brandLime)
                    }
                    
                    VStack(spacing: 8) {
                        Text("Tebrikler!")
                            .font(PAGTypography.titleLarge)
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        Text("Kalite doğrulama sorusunu tamamladınız.")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    
                    VStack(spacing: 6) {
                        Text("Kazanılan Ödül")
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.textMuted)
                            .textCase(.uppercase)
                        
                        Text(pending.rewardSummary)
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.brandLime)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(
                        RoundedRectangle(cornerRadius: PAGRadius.medium)
                            .stroke(PAGTheme.borderDefault, lineWidth: 1)
                    )
                    .padding(.horizontal)
                    
                    Spacer()
                    
                    Button(action: {
                        verificationService.dismissForNow()
                        onDismiss()
                    }) {
                        Text("Ana Sayfaya Dön")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.brandMidnight)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(PAGTheme.brandLime)
                            .cornerRadius(PAGRadius.medium)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 20)
                }
            } else if !isStarted {
                // Intro "Bir Son Adım" Page
                VStack(spacing: 24) {
                    // Top Bar
                    HStack {
                        Spacer()
                        Button(action: {
                            verificationService.dismissForNow()
                            onDismiss()
                        }) {
                            Text("Daha Sonra")
                                .font(PAGTypography.bodySmall)
                                .foregroundColor(PAGTheme.textMuted)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 10)
                    
                    Spacer()
                    
                    // Icon
                    ZStack {
                        Circle()
                            .fill(PAGTheme.brandLime.opacity(0.12))
                            .frame(width: 90, height: 90)
                        
                        Image(systemName: "sparkles.rectangle.stack.fill")
                            .font(.system(size: 44))
                            .foregroundColor(PAGTheme.brandLime)
                    }
                    
                    // Main Title & Description
                    VStack(spacing: 12) {
                        Text("Bir Son Adım")
                            .font(PAGTypography.titleLarge)
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        VStack(spacing: 4) {
                            Text("Ana Anket:")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)
                            
                            Text(pending.masterSurveyTitle)
                                .font(PAGTypography.heading)
                                .foregroundColor(PAGTheme.brandLime)
                                .multilineTextAlignment(.center)
                        }
                        
                        Text("Katıldığınız anket için tek soruluk kalite doğrulaması sizi bekliyor.")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }
                    
                    // Reward Highlight Card
                    VStack(spacing: 6) {
                        HStack {
                            Image(systemName: "gift.fill")
                                .foregroundColor(PAGTheme.brandLime)
                            Text("Doğrulama Ödülü")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)
                                .textCase(.uppercase)
                        }
                        
                        Text("Tamamladığınızda \(pending.rewardSummary) kazanacaksınız.")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.textPrimary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(
                        RoundedRectangle(cornerRadius: PAGRadius.medium)
                            .stroke(PAGTheme.brandLime.opacity(0.6), lineWidth: 1.5)
                    )
                    .padding(.horizontal)
                    
                    Spacer()
                    
                    // CTA: "Başla"
                    VStack(spacing: 12) {
                        Button(action: {
                            isStarted = true
                        }) {
                            Text("Başla")
                                .font(PAGTypography.heading)
                                .foregroundColor(PAGTheme.brandMidnight)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(PAGTheme.brandLime)
                                .cornerRadius(PAGRadius.medium)
                        }
                        
                        Button(action: {
                            verificationService.dismissForNow()
                            onDismiss()
                        }) {
                            Text("Şimdilik Geç")
                                .font(PAGTypography.bodySmall)
                                .foregroundColor(PAGTheme.textMuted)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 20)
                }
            } else {
                // 1-Question Verification Survey Flow
                let question = pending.questions.first
                
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        Button(action: {
                            isStarted = false
                        }) {
                            Image(systemName: "chevron.left")
                                .foregroundColor(PAGTheme.textPrimary)
                        }
                        
                        Spacer()
                        
                        Text("Kalite Doğrulama (1/1)")
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.textMuted)
                        
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 10)
                    
                    ScrollView {
                        VStack(alignment: .leading, spacing: 20) {
                            Text(question?.text ?? "Anket yanıtlarınızı onaylıyor musunuz?")
                                .font(PAGTypography.title)
                                .foregroundColor(PAGTheme.textPrimary)
                                .padding(.horizontal)
                            
                            VStack(spacing: 12) {
                                ForEach(question?.options ?? []) { opt in
                                    let isSelected = selectedOptionId == opt.optionId
                                    Button(action: {
                                        selectedOptionId = opt.optionId
                                    }) {
                                        HStack {
                                            Text(opt.label)
                                                .font(PAGTypography.body)
                                                .foregroundColor(isSelected ? PAGTheme.brandMidnight : PAGTheme.textPrimary)
                                            
                                            Spacer()
                                            
                                            if isSelected {
                                                Image(systemName: "checkmark.circle.fill")
                                                    .foregroundColor(PAGTheme.brandMidnight)
                                            }
                                        }
                                        .padding()
                                        .background(isSelected ? PAGTheme.brandLime : PAGTheme.surfacePrimary)
                                        .cornerRadius(PAGRadius.medium)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: PAGRadius.medium)
                                                .stroke(isSelected ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: 1)
                                        )
                                    }
                                }
                            }
                            .padding(.horizontal)
                            
                            if let err = errorText {
                                Text(err)
                                    .font(PAGTypography.caption)
                                    .foregroundColor(Color.red)
                                    .padding(.horizontal)
                            }
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        guard let optId = selectedOptionId, let qId = question?.questionId else { return }
                        Task {
                            isSubmitting = true
                            errorText = nil
                            do {
                                _ = try await verificationService.submitVerificationAnswer(
                                    surveyId: pending.verificationSurveyId,
                                    questionId: qId,
                                    optionId: optId
                                )
                                isCompleted = true
                            } catch {
                                errorText = "Yanıt gönderilirken hata oluştu: \(error.localizedDescription)"
                            }
                            isSubmitting = false
                        }
                    }) {
                        if isSubmitting {
                            ProgressView()
                                .tint(PAGTheme.brandMidnight)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(PAGTheme.brandLime)
                                .cornerRadius(PAGRadius.medium)
                        } else {
                            Text("Tamamla & Ödülü Kazan")
                                .font(PAGTypography.heading)
                                .foregroundColor(selectedOptionId == nil ? PAGTheme.textMuted : PAGTheme.brandMidnight)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(selectedOptionId == nil ? PAGTheme.surfaceSecondary : PAGTheme.brandLime)
                                .cornerRadius(PAGRadius.medium)
                        }
                    }
                    .disabled(selectedOptionId == nil || isSubmitting)
                    .padding(.horizontal)
                    .padding(.bottom, 20)
                }
            }
        }
    }
}

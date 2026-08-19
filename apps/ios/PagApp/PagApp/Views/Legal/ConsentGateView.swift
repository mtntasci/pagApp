import SwiftUI
import UserNotifications

public struct ConsentGateView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var legalService = LegalService.shared
    @StateObject private var userService = UserService.shared
    
    var onConsentApproved: (() -> Void)? = nil
    
    // Accepted documents tracking in local state during the gate flow
    @State private var acceptedDocs: [String: LegalDocument] = [:]
    
    // Single Unified Commercial Communication Preference (SMS, E-Posta, Telefon)
    @State private var allowCommunication: Bool = false
    
    // 18+ Age Verification & Birth Year Selection (handled via popup upon reading TERMS)
    @State private var selectedBirthYear: Int = 2000
    @State private var isAgeConfirmed: Bool = false
    
    // Active document selection for full-screen reader
    @State private var selectedDocumentForReading: LegalDocument? = nil
    @State private var pendingTermsDoc: LegalDocument? = nil
    @State private var showAgeVerificationPopup: Bool = false
    @State private var showUnderageAlert: Bool = false
    @State private var underageAlertMessage: String = ""
    
    @State private var isSubmitting: Bool = false
    @State private var submissionError: String? = nil
    
    public init(onConsentApproved: (() -> Void)? = nil) {
        self.onConsentApproved = onConsentApproved
    }
    
    private var availableBirthYears: [Int] {
        let currentYear = Calendar.current.component(.year, from: Date())
        return Array((1940...currentYear).reversed())
    }
    
    private var requiredDocuments: [LegalDocument] {
        if let missing = userService.currentUser?.missingDocuments, !missing.isEmpty {
            return missing
        }
        if !legalService.activeDocuments.isEmpty {
            return legalService.activeDocuments.filter { $0.isRequired }
        }
        return [
            LegalDocument(
                documentId: "TERMS",
                type: "TERMS",
                version: "1.0",
                title: "Kullanım Koşulları ve Üyelik Sözleşmesi",
                url: "https://www.pagapp.com.tr/terms",
                contentHash: "PAG_TERMS_V1.0",
                isRequired: true
            ),
            LegalDocument(
                documentId: "KVKK_NOTICE",
                type: "KVKK_NOTICE",
                version: "1.0",
                title: "Kullanıcı Gizliliği ve KVKK Aydınlatma Metni",
                url: "https://www.pagapp.com.tr/user-privacy",
                contentHash: "PAG_KVKK_NOTICE_V1.0",
                isRequired: true
            ),
            LegalDocument(
                documentId: "REWARD_TERMS",
                type: "REWARD_TERMS",
                version: "1.0",
                title: "Ödül ve Kampanya Katılım Koşulları",
                url: "https://www.pagapp.com.tr/reward-terms",
                contentHash: "PAG_REWARD_TERMS_V1.0",
                isRequired: true
            )
        ]
    }
    
    private var areAllRequiredDocsAccepted: Bool {
        for doc in requiredDocuments {
            if acceptedDocs[doc.documentId] == nil {
                return false
            }
        }
        return !requiredDocuments.isEmpty
    }
    
    private var isFormValidToContinue: Bool {
        return areAllRequiredDocsAccepted && !isSubmitting
    }
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Top Header
                VStack(spacing: 8) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("PAG Yasal Onaylar")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(PAGTheme.brandLime)
                                .textCase(.uppercase)
                            
                            Text("Sözleşmeler ve İzinler")
                                .font(.system(size: 24, weight: .black))
                                .foregroundColor(PAGTheme.textPrimary)
                        }
                        Spacer()
                        
                        Button(action: {
                            dismiss()
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 26))
                                .foregroundColor(PAGTheme.textSecondary)
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    .padding(.bottom, 8)
                    
                    Text("PAG deneyiminize başlamadan önce yasal sözleşmeleri incelemeniz ve iletişim tercihlerinizi belirlemeniz gerekmektedir.")
                        .font(.system(size: 13))
                        .foregroundColor(PAGTheme.textSecondary)
                        .lineSpacing(3)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 24)
                        .padding(.bottom, 12)
                    
                    Divider()
                        .background(PAGTheme.borderColor)
                }
                .background(PAGTheme.surfacePrimary)
                
                // Scrollable Content
                ScrollView {
                    VStack(spacing: 24) {
                        
                        // 1. Required Legal Documents Section
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Zorunlu Sözleşme ve Metinler")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(PAGTheme.textPrimary)
                                
                                Spacer()
                                
                                Text("\(acceptedDocs.count)/\(requiredDocuments.count) Onaylandı")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(areAllRequiredDocsAccepted ? PAGTheme.brandLime : PAGTheme.textSecondary)
                            }
                            
                            VStack(spacing: 10) {
                                ForEach(requiredDocuments) { doc in
                                    LegalDocumentRow(
                                        document: doc,
                                        isAccepted: acceptedDocs[doc.documentId] != nil,
                                        onTap: {
                                            selectedDocumentForReading = doc
                                        }
                                    )
                                }
                            }
                        }
                        
                        // 2. Optional Commercial Communication Section
                        VStack(alignment: .leading, spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("İletişim Tercihleri (İsteğe Bağlı)")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(PAGTheme.textPrimary)
                                
                                Text("Kampanya, fırsat ve anket duyurularını almak istediğiniz kanalları seçebilirsiniz. İstediğiniz zaman ayarlardan değiştirebilirsiniz.")
                                    .font(.system(size: 12))
                                    .foregroundColor(PAGTheme.textSecondary)
                                    .lineSpacing(2)
                            }
                            
                            VStack(spacing: 0) {
                                HStack(spacing: 14) {
                                    Image(systemName: "bell.badge.fill")
                                        .font(.system(size: 20))
                                        .foregroundColor(allowCommunication ? PAGTheme.brandLime : PAGTheme.textSecondary)
                                        .frame(width: 28)
                                    
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text("İletişime İzin Veriyorum")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(PAGTheme.textPrimary)
                                        
                                        Text("Sms, E-Posta ve Telefon ile Fırsat, Bildirim almayı kabul ediyorum")
                                            .font(.system(size: 12))
                                            .foregroundColor(PAGTheme.textSecondary)
                                            .lineSpacing(2)
                                    }
                                    
                                    Spacer()
                                    
                                    Toggle("", isOn: $allowCommunication)
                                        .labelsHidden()
                                        .tint(PAGTheme.brandLime)
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                            }
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(14)
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(allowCommunication ? PAGTheme.brandLime.opacity(0.3) : PAGTheme.borderColor, lineWidth: 1)
                            )
                        }
                        
                        // Error message if any
                        if let error = submissionError {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(PAGTheme.brandOrange)
                                Text(error)
                                    .font(.system(size: 13))
                                    .foregroundColor(PAGTheme.brandOrange)
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(PAGTheme.brandOrange.opacity(0.1))
                            .cornerRadius(10)
                        }
                    }
                    .padding(20)
                }
                
                // Bottom Action Bar
                VStack(spacing: 8) {
                    Divider()
                        .background(PAGTheme.borderColor)
                    
                    Button(action: {
                        Task {
                            await handleContinue()
                        }
                    }) {
                        HStack(spacing: 8) {
                            if isSubmitting {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: PAGTheme.brandMidnight))
                            }
                            Text(isSubmitting ? "Kaydediliyor..." : "Onayla ve Devam Et")
                                .font(.system(size: 16, weight: .bold))
                        }
                        .foregroundColor(isFormValidToContinue ? PAGTheme.brandMidnight : PAGTheme.textMuted)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(isFormValidToContinue ? PAGTheme.brandLime : PAGTheme.surfaceSecondary)
                        .cornerRadius(14)
                    }
                    .disabled(!isFormValidToContinue)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 12)
                }
                .background(PAGTheme.surfacePrimary)
            }
            
            // 18+ Age Verification Popup Modal Overlay
            if showAgeVerificationPopup {
                AgeVerificationPopupView(
                    selectedBirthYear: $selectedBirthYear,
                    isAgeConfirmed: $isAgeConfirmed,
                    availableBirthYears: availableBirthYears,
                    onConfirm: {
                        let currentYear = Calendar.current.component(.year, from: Date())
                        let calculatedAge = currentYear - selectedBirthYear
                        
                        if calculatedAge < 18 {
                            // Underage rejected!
                            underageAlertMessage = "PAG platformuna ve para ödüllerine katılabilmek için 18 yaşından büyük (18+) olmanız gerekmektedir. Kullanım Koşulları sözleşmesi onaylanmadı. Lütfen tekrar inceleyip doğru doğum yılınızı seçiniz."
                            showUnderageAlert = true
                            pendingTermsDoc = nil
                            showAgeVerificationPopup = false
                        } else if !isAgeConfirmed {
                            // Age confirmation checkbox missing
                            underageAlertMessage = "Lütfen 18 yaşından büyük olduğunuzu teyit eden kutucuğu işaretleyiniz."
                            showUnderageAlert = true
                        } else {
                            // Valid +18 -> Accept TERMS document
                            if let doc = pendingTermsDoc {
                                acceptedDocs[doc.documentId] = doc
                            }
                            pendingTermsDoc = nil
                            showAgeVerificationPopup = false
                        }
                    },
                    onCancel: {
                        pendingTermsDoc = nil
                        showAgeVerificationPopup = false
                    }
                )
                .transition(.opacity.combined(with: .scale(scale: 0.95)))
            }
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.8), value: showAgeVerificationPopup)
        .sheet(item: $selectedDocumentForReading) { doc in
            FullScreenDocumentReaderView(
                document: doc,
                isAlreadyAccepted: acceptedDocs[doc.documentId] != nil,
                onAccept: { acceptedDoc in
                    if acceptedDoc.type == "TERMS" || acceptedDoc.documentId == "TERMS" {
                        // Prompt +18 verification popup for TERMS
                        pendingTermsDoc = acceptedDoc
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                            showAgeVerificationPopup = true
                        }
                    } else {
                        acceptedDocs[acceptedDoc.documentId] = acceptedDoc
                    }
                }
            )
        }
        .alert("Yaş Uygunluğu Uyarısı", isPresented: $showUnderageAlert) {
            Button("Tamam", role: .cancel) {}
        } message: {
            Text(underageAlertMessage)
        }
        .task {
            _ = await legalService.fetchActiveLegalDocuments()
        }
    }
    
    private func handleContinue() async {
        guard isFormValidToContinue else { return }
        
        isSubmitting = true
        submissionError = nil
        
        let acceptedList = Array(acceptedDocs.values)
        let commPrefs = CommunicationPreferences(
            pushMarketing: false, // Push is handled natively by Apple system prompt
            smsMarketing: allowCommunication,
            emailMarketing: allowCommunication,
            phoneMarketing: allowCommunication
        )
        
        if userService.currentUser != nil {
            let success = await legalService.recordLegalAcceptances(
                acceptedDocuments: acceptedList,
                preferences: commPrefs,
                birthYear: selectedBirthYear
            )
            
            if success {
                // Request native Apple Push Notification dialog after login
                let center = UNUserNotificationCenter.current()
                let settings = await center.notificationSettings()
                if settings.authorizationStatus == .notDetermined {
                    do {
                        _ = try await center.requestAuthorization(options: [.alert, .sound, .badge])
                    } catch {
                        print("Apple Push authorization request error: \(error.localizedDescription)")
                    }
                }
                
                // Mark consent complete in memory
                userService.completeLegalConsent(preferences: commPrefs)
                onConsentApproved?()
                dismiss()
            } else {
                submissionError = legalService.errorMessage ?? "Sözleşmeler kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz."
            }
        } else {
            // Guest mode / before login: mark approved in memory and dismiss sheet
            onConsentApproved?()
            dismiss()
        }
        
        isSubmitting = false
    }
}

/**
 * Sleek 18+ Age & Birth Year Verification Popup
 */
struct AgeVerificationPopupView: View {
    @Binding var selectedBirthYear: Int
    @Binding var isAgeConfirmed: Bool
    let availableBirthYears: [Int]
    let onConfirm: () -> Void
    let onCancel: () -> Void
    
    var body: some View {
        ZStack {
            // Backdrop Blur
            Color.black.opacity(0.7)
                .ignoresSafeArea()
                .onTapGesture {
                    onCancel()
                }
            
            // Modal Card
            VStack(spacing: 20) {
                // Header Icon & Title
                VStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(PAGTheme.brandLime.opacity(0.15))
                            .frame(width: 60, height: 60)
                        
                        Image(systemName: "person.badge.shield.checkmark.fill")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(PAGTheme.brandLime)
                    }
                    
                    Text("18+ Yaş Doğrulaması")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    Text("PAG platformunda nakit ve hediye çeki para ödülleri dağıtıldığından yasal olarak 18 yaşını doldurmuş olmanız gerekmektedir.")
                        .font(.system(size: 13))
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3)
                        .padding(.horizontal, 8)
                }
                
                // Birth Year Picker Card
                VStack(spacing: 12) {
                    HStack {
                        Text("Doğum Yılınız:")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        Spacer()
                        
                        Picker("Doğum Yılı", selection: $selectedBirthYear) {
                            ForEach(availableBirthYears, id: \.self) { year in
                                Text("\(String(year))")
                                    .tag(year)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(PAGTheme.surfaceSecondary)
                        .cornerRadius(10)
                        .accentColor(PAGTheme.brandLime)
                    }
                    
                    Divider()
                        .background(PAGTheme.borderColor)
                    
                    Button(action: {
                        isAgeConfirmed.toggle()
                    }) {
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: isAgeConfirmed ? "checkmark.square.fill" : "square")
                                .font(.system(size: 20))
                                .foregroundColor(isAgeConfirmed ? PAGTheme.brandLime : PAGTheme.textSecondary)
                            
                            Text("18 yaşından büyük olduğumu ve ödül kazanımı için doğum yılımın doğruluğunu beyan ederim.")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(PAGTheme.textPrimary)
                                .multilineTextAlignment(.leading)
                                .lineSpacing(2)
                            
                            Spacer()
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .padding(16)
                .background(PAGTheme.surfacePrimary)
                .cornerRadius(14)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(isAgeConfirmed ? PAGTheme.brandLime.opacity(0.4) : PAGTheme.borderColor, lineWidth: 1)
                )
                
                // Action Buttons
                VStack(spacing: 10) {
                    Button(action: onConfirm) {
                        Text("Yaşımı Onaylıyorum ve Sözleşmeyi Kabul Et")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(PAGTheme.brandMidnight)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(PAGTheme.brandLime)
                            .cornerRadius(12)
                    }
                    
                    Button(action: onCancel) {
                        Text("Vazgeç")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(PAGTheme.textSecondary)
                    }
                    .padding(.top, 2)
                }
            }
            .padding(24)
            .background(PAGTheme.surfacePrimary)
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(PAGTheme.borderColor, lineWidth: 1)
            )
            .padding(.horizontal, 24)
            .shadow(color: Color.black.opacity(0.4), radius: 24, x: 0, y: 12)
        }
    }
}

/**
 * Row item for a legal document in the consent checklist.
 */
struct LegalDocumentRow: View {
    let document: LegalDocument
    let isAccepted: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                // Status Icon
                ZStack {
                    Circle()
                        .fill(isAccepted ? PAGTheme.brandLime.opacity(0.2) : PAGTheme.surfaceSecondary)
                        .frame(width: 36, height: 36)
                    
                    if isAccepted {
                        Image(systemName: "checkmark")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(PAGTheme.brandLime)
                    } else {
                        Image(systemName: "doc.text.fill")
                            .font(.system(size: 15))
                            .foregroundColor(PAGTheme.brandOrange)
                    }
                }
                
                // Document Info
                VStack(alignment: .leading, spacing: 3) {
                    Text(document.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(PAGTheme.textPrimary)
                        .multilineTextAlignment(.leading)
                    
                    HStack(spacing: 6) {
                        Text(isAccepted ? "Kabul Edildi" : "Okunması Zorunlu")
                            .font(.system(size: 12))
                            .foregroundColor(isAccepted ? PAGTheme.brandLime : PAGTheme.brandOrange)
                        
                        Text("•")
                            .foregroundColor(PAGTheme.textSecondary)
                        
                        Text("v\(document.version)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(PAGTheme.textSecondary)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(PAGTheme.textSecondary)
            }
            .padding(14)
            .background(PAGTheme.surfacePrimary)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isAccepted ? PAGTheme.brandLime.opacity(0.3) : PAGTheme.borderColor, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

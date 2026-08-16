import SwiftUI
import UserNotifications

public struct ConsentGateView: View {
    @StateObject private var legalService = LegalService.shared
    @StateObject private var userService = UserService.shared
    
    // Accepted documents tracking in local state during the gate flow
    @State private var acceptedDocs: [String: LegalDocument] = [:]
    
    // Optional Commercial Communication Preferences (all default to FALSE)
    @State private var pushMarketing: Bool = false
    @State private var smsMarketing: Bool = false
    @State private var emailMarketing: Bool = false
    @State private var phoneMarketing: Bool = false
    
    // Active document selection for full-screen reader
    @State private var selectedDocumentForReading: LegalDocument? = nil
    
    @State private var isSubmitting: Bool = false
    @State private var submissionError: String? = nil
    
    public init() {}
    
    private var requiredDocuments: [LegalDocument] {
        if let missing = userService.currentUser?.missingDocuments, !missing.isEmpty {
            return missing
        }
        if !legalService.activeDocuments.isEmpty {
            return legalService.activeDocuments.filter { $0.isRequired }
        }
        // Fallback required documents baseline
        return [
            LegalDocument(
                documentId: "TERMS",
                type: "TERMS",
                version: "1.0",
                title: "Kullanım Koşulları ve Üyelik Sözleşmesi",
                url: "https://www.pagapp.com.tr/terms",
                contentHash: "PAG_TERMS_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI",
                isRequired: true
            ),
            LegalDocument(
                documentId: "KVKK_NOTICE",
                type: "KVKK_NOTICE",
                version: "1.0",
                title: "Kullanıcı Gizliliği ve KVKK Aydınlatma Metni",
                url: "https://www.pagapp.com.tr/user-privacy",
                contentHash: "PAG_KVKK_NOTICE_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI",
                isRequired: true
            ),
            LegalDocument(
                documentId: "REWARD_TERMS",
                type: "REWARD_TERMS",
                version: "1.0",
                title: "Ödül ve Kampanya Katılım Koşulları",
                url: "https://www.pagapp.com.tr/reward-terms",
                contentHash: "PAG_REWARD_TERMS_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI",
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
                        
                        Image(systemName: "shield.lefthalf.filled.badge.checkmark")
                            .font(.system(size: 32))
                            .foregroundColor(PAGTheme.brandLime)
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
                                
                                Text("\(acceptedDocs.count)/\(requiredDocuments.count) Okundu")
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
                                CommercialToggleRow(
                                    icon: "bell.badge.fill",
                                    title: "Push Bildirimleri",
                                    subtitle: "Mobil anlık kampanya ve fırsat bildirimleri",
                                    isOn: $pushMarketing
                                )
                                
                                Divider().background(PAGTheme.borderColor).padding(.leading, 52)
                                
                                CommercialToggleRow(
                                    icon: "message.fill",
                                    title: "SMS ile Bildirim",
                                    subtitle: "Kısa mesaj ile özel anket ve kampanya duyuruları",
                                    isOn: $smsMarketing
                                )
                                
                                Divider().background(PAGTheme.borderColor).padding(.leading, 52)
                                
                                CommercialToggleRow(
                                    icon: "envelope.fill",
                                    title: "E-Posta ile Bülten",
                                    subtitle: "Haftalık fırsatlar ve anket özetleri",
                                    isOn: $emailMarketing
                                )
                                
                                Divider().background(PAGTheme.borderColor).padding(.leading, 52)
                                
                                CommercialToggleRow(
                                    icon: "phone.fill",
                                    title: "Telefon ile İletişim",
                                    subtitle: "Özel araştırma davetleri ve bilgilendirme",
                                    isOn: $phoneMarketing
                                )
                            }
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(14)
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(PAGTheme.borderColor, lineWidth: 1)
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
                        .foregroundColor(areAllRequiredDocsAccepted && !isSubmitting ? PAGTheme.brandMidnight : PAGTheme.textMuted)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(areAllRequiredDocsAccepted && !isSubmitting ? PAGTheme.brandLime : PAGTheme.surfaceSecondary)
                        .cornerRadius(14)
                    }
                    .disabled(!areAllRequiredDocsAccepted || isSubmitting)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 12)
                }
                .background(PAGTheme.surfacePrimary)
            }
        }
        .sheet(item: $selectedDocumentForReading) { doc in
            FullScreenDocumentReaderView(
                document: doc,
                isAlreadyAccepted: acceptedDocs[doc.documentId] != nil,
                onAccept: { acceptedDoc in
                    acceptedDocs[acceptedDoc.documentId] = acceptedDoc
                }
            )
        }
        .task {
            _ = await legalService.fetchActiveLegalDocuments()
        }
    }
    
    private func handleContinue() async {
        guard areAllRequiredDocsAccepted else { return }
        
        isSubmitting = true
        submissionError = nil
        
        let acceptedList = Array(acceptedDocs.values)
        let commPrefs = CommunicationPreferences(
            pushMarketing: pushMarketing,
            smsMarketing: smsMarketing,
            emailMarketing: emailMarketing,
            phoneMarketing: phoneMarketing
        )
        
        let success = await legalService.recordLegalAcceptances(
            acceptedDocuments: acceptedList,
            preferences: commPrefs
        )
        
        if success {
            // Check native notification permission sequencing:
            // Request native notification ONLY if user opted in for push marketing
            if pushMarketing {
                let center = UNUserNotificationCenter.current()
                let settings = await center.notificationSettings()
                if settings.authorizationStatus == .notDetermined {
                    do {
                        _ = try await center.requestAuthorization(options: [.alert, .sound, .badge])
                    } catch {
                        print("Push authorization request error: \(error.localizedDescription)")
                    }
                }
            }
            
            // Mark consent complete in memory
            userService.completeLegalConsent(preferences: commPrefs)
        } else {
            submissionError = legalService.errorMessage ?? "Sözleşmeler kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz."
        }
        
        isSubmitting = false
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

/**
 * Toggle row for optional commercial electronic communication permissions.
 */
struct CommercialToggleRow: View {
    let icon: String
    let title: String
    let subtitle: String
    @Binding var isOn: Bool
    
    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(isOn ? PAGTheme.brandLime : PAGTheme.textSecondary)
                .frame(width: 28)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(PAGTheme.textPrimary)
                
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundColor(PAGTheme.textSecondary)
            }
            
            Spacer()
            
            Toggle("", isOn: $isOn)
                .labelsHidden()
                .tint(PAGTheme.brandLime)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

import SwiftUI
import UserNotifications

public struct ConsentGateView: View {
    @StateObject private var legalService = LegalService.shared
    @StateObject private var userService = UserService.shared
    
    // Accepted documents tracking in local state during the gate flow
    @State private var acceptedDocs: [String: LegalDocument] = [:]
    
    // Single Unified Commercial Communication Preference (SMS, E-Posta, Telefon)
    @State private var allowCommunication: Bool = false
    
    // 18+ Age Verification & Birth Year Selection
    @State private var selectedBirthYear: Int = 2000
    @State private var isAgeConfirmed: Bool = false
    
    // Active document selection for full-screen reader
    @State private var selectedDocumentForReading: LegalDocument? = nil
    
    @State private var isSubmitting: Bool = false
    @State private var submissionError: String? = nil
    
    public init() {}
    
    private var availableBirthYears: [Int] {
        let currentYear = Calendar.current.component(.year, from: Date())
        let maxYear = currentYear - 18 // e.g. 2008
        return Array((1940...maxYear).reversed())
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
        return areAllRequiredDocsAccepted && isAgeConfirmed && !isSubmitting
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
                        
                        // 2. 18+ Age & Birth Year Verification
                        VStack(alignment: .leading, spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                HStack(spacing: 6) {
                                    Image(systemName: "person.badge.shield.checkmark.fill")
                                        .foregroundColor(PAGTheme.brandLime)
                                        .font(.system(size: 15))
                                    
                                    Text("18+ Yaş Uygunluğu ve Doğum Yılı")
                                        .font(.system(size: 15, weight: .bold))
                                        .foregroundColor(PAGTheme.textPrimary)
                                }
                                
                                Text("PAG platformunda nakit ve hediye çeki para ödülleri dağıtıldığından yasal olarak 18 yaşından büyük olmanız gerekmektedir.")
                                    .font(.system(size: 12))
                                    .foregroundColor(PAGTheme.textSecondary)
                                    .lineSpacing(2)
                            }
                            
                            VStack(spacing: 12) {
                                HStack {
                                    Text("Doğum Yılınız:")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(PAGTheme.textPrimary)
                                    
                                    Spacer()
                                    
                                    Picker("Doğum Yılı", selection: $selectedBirthYear) {
                                        ForEach(availableBirthYears, id: \.self) { year in
                                            Text("\(String(year))")
                                                .tag(year)
                                        }
                                    }
                                    .pickerStyle(MenuPickerStyle())
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(PAGTheme.surfaceSecondary)
                                    .cornerRadius(8)
                                    .accentColor(PAGTheme.brandLime)
                                }
                                
                                Divider().background(PAGTheme.borderColor)
                                
                                Button(action: {
                                    isAgeConfirmed.toggle()
                                }) {
                                    HStack(alignment: .top, spacing: 12) {
                                        Image(systemName: isAgeConfirmed ? "checkmark.square.fill" : "square")
                                            .font(.system(size: 20))
                                            .foregroundColor(isAgeConfirmed ? PAGTheme.brandLime : PAGTheme.textSecondary)
                                        
                                        Text("18 yaşından büyük olduğumu ve ödül kazanımı için doğum yılımın doğruluğunu beyan ederim.")
                                            .font(.system(size: 13, weight: .medium))
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
                        }
                        
                        // 3. Optional Commercial Communication Section
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

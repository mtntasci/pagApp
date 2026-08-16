import SwiftUI
import UserNotifications

public struct LegalSettingsView: View {
    @StateObject private var legalService = LegalService.shared
    @StateObject private var userService = UserService.shared
    
    @State private var pushMarketing: Bool = false
    @State private var smsMarketing: Bool = false
    @State private var emailMarketing: Bool = false
    @State private var phoneMarketing: Bool = false
    
    @State private var isOsNotificationDenied: Bool = false
    @State private var selectedDocumentForReading: LegalDocument? = nil
    @State private var isSavingPreferences: Bool = false
    @State private var saveMessage: String? = nil
    
    public init() {}
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    
                    // OS Notification Warning Banner if push marketing is ON but OS notifications are disabled
                    if pushMarketing && isOsNotificationDenied {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(PAGTheme.brandOrange)
                                Text("Cihaz Bildirim İzni Kapalı")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(PAGTheme.textPrimary)
                            }
                            
                            Text("PAG içinde anlık bildirimleri açtınız, ancak iOS sistem ayarlarından PAG bildirimlerine izin verilmemiş görünüyor. Kampanya ve anket bildirimlerini alabilmek için lütfen sistem ayarlarını açınız.")
                                .font(.system(size: 13))
                                .foregroundColor(PAGTheme.textSecondary)
                                .lineSpacing(3)
                            
                            Button(action: {
                                if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                                    UIApplication.shared.open(settingsUrl)
                                }
                            }) {
                                HStack(spacing: 6) {
                                    Image(systemName: "gear")
                                    Text("Sistem Ayarlarını Aç")
                                        .font(.system(size: 13, weight: .bold))
                                }
                                .foregroundColor(PAGTheme.brandMidnight)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(PAGTheme.brandLime)
                                .cornerRadius(8)
                            }
                            .padding(.top, 4)
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(PAGTheme.surfacePrimary)
                        .cornerRadius(14)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(PAGTheme.brandOrange.opacity(0.4), lineWidth: 1)
                        )
                    }
                    
                    // 1. Commercial Communication Channels
                    VStack(alignment: .leading, spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Ticari İletişim Tercihleri")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(PAGTheme.textPrimary)
                            
                            Text("Pazarlama, kampanya ve anket bilgilendirme kanallarınızı dilediğiniz an açıp kapatabilirsiniz.")
                                .font(.system(size: 13))
                                .foregroundColor(PAGTheme.textSecondary)
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
                                subtitle: "Kısa mesaj ile önemli fırsat ve davetler",
                                isOn: $smsMarketing
                            )
                            
                            Divider().background(PAGTheme.borderColor).padding(.leading, 52)
                            
                            CommercialToggleRow(
                                icon: "envelope.fill",
                                title: "E-Posta ile Bülten",
                                subtitle: "Haftalık anket ve ödül özetleri",
                                isOn: $emailMarketing
                            )
                            
                            Divider().background(PAGTheme.borderColor).padding(.leading, 52)
                            
                            CommercialToggleRow(
                                icon: "phone.fill",
                                title: "Telefon ile İletişim",
                                subtitle: "Özel araştırma davetleri",
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
                    
                    // 2. Legal Documents & Contracts
                    VStack(alignment: .leading, spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Sözleşmeler ve Yasal Metinler")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(PAGTheme.textPrimary)
                            
                            Text("PAG platformunun geçerli yasal belgelerini inceleyebilirsiniz.")
                                .font(.system(size: 13))
                                .foregroundColor(PAGTheme.textSecondary)
                        }
                        
                        VStack(spacing: 8) {
                            ForEach(legalService.activeDocuments.isEmpty ? fallbackLegalDocs : legalService.activeDocuments) { doc in
                                Button(action: {
                                    selectedDocumentForReading = doc
                                }) {
                                    HStack(spacing: 12) {
                                        Image(systemName: "doc.text.fill")
                                            .font(.system(size: 16))
                                            .foregroundColor(PAGTheme.brandLime)
                                            .frame(width: 24)
                                        
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(doc.title)
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundColor(PAGTheme.textPrimary)
                                                .multilineTextAlignment(.leading)
                                            
                                            Text("Sürüm: v\(doc.version)")
                                                .font(.system(size: 11))
                                                .foregroundColor(PAGTheme.textSecondary)
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
                                            .stroke(PAGTheme.borderColor, lineWidth: 1)
                                    )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                    }
                }
                .padding(20)
            }
        }
        .navigationTitle("Sözleşmeler ve İzinler")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selectedDocumentForReading) { doc in
            FullScreenDocumentReaderView(
                document: doc,
                isAlreadyAccepted: true,
                onAccept: nil
            )
        }
        .onAppear {
            initPreferences()
            checkOsNotificationStatus()
        }
        .onChange(of: pushMarketing) { _ in savePreferences() }
        .onChange(of: smsMarketing) { _ in savePreferences() }
        .onChange(of: emailMarketing) { _ in savePreferences() }
        .onChange(of: phoneMarketing) { _ in savePreferences() }
        .task {
            _ = await legalService.fetchActiveLegalDocuments()
        }
    }
    
    private func initPreferences() {
        if let prefs = userService.currentUser?.communicationPreferences {
            self.pushMarketing = prefs.pushMarketing
            self.smsMarketing = prefs.smsMarketing
            self.emailMarketing = prefs.emailMarketing
            self.phoneMarketing = prefs.phoneMarketing
        }
    }
    
    private func checkOsNotificationStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.isOsNotificationDenied = (settings.authorizationStatus == .denied)
            }
        }
    }
    
    private func savePreferences() {
        let prefs = CommunicationPreferences(
            pushMarketing: pushMarketing,
            smsMarketing: smsMarketing,
            emailMarketing: emailMarketing,
            phoneMarketing: phoneMarketing
        )
        
        Task {
            _ = await legalService.updateCommunicationPreferences(preferences: prefs)
            userService.updateCommunicationPreferencesState(preferences: prefs)
            
            if pushMarketing {
                let center = UNUserNotificationCenter.current()
                let settings = await center.notificationSettings()
                if settings.authorizationStatus == .notDetermined {
                    do {
                        _ = try await center.requestAuthorization(options: [.alert, .sound, .badge])
                    } catch {
                        print("Push auth error: \(error.localizedDescription)")
                    }
                }
                checkOsNotificationStatus()
            }
        }
    }
    
    private var fallbackLegalDocs: [LegalDocument] {
        [
            LegalDocument(documentId: "TERMS", type: "TERMS", version: "1.0", title: "Kullanım Koşulları ve Üyelik Sözleşmesi", url: "https://www.pagapp.com.tr/terms", contentHash: "", isRequired: true),
            LegalDocument(documentId: "KVKK_NOTICE", type: "KVKK_NOTICE", version: "1.0", title: "KVKK ve Kullanıcı Gizliliği Aydınlatma Metni", url: "https://www.pagapp.com.tr/user-privacy", contentHash: "", isRequired: true),
            LegalDocument(documentId: "REWARD_TERMS", type: "REWARD_TERMS", version: "1.0", title: "Ödül ve Kampanya Katılım Koşulları", url: "https://www.pagapp.com.tr/reward-terms", contentHash: "", isRequired: true),
            LegalDocument(documentId: "COMMERCIAL_COMMUNICATION", type: "COMMERCIAL_COMMUNICATION", version: "1.0", title: "Ticari Elektronik İleti İzni", url: "https://www.pagapp.com.tr/commercial-communication", contentHash: "", isRequired: false),
            LegalDocument(documentId: "EXPLICIT_CONSENT", type: "EXPLICIT_CONSENT", version: "1.0", title: "Açık Rıza Metni", url: "https://www.pagapp.com.tr/explicit-consent", contentHash: "", isRequired: false),
            LegalDocument(documentId: "PRIVACY_POLICY", type: "PRIVACY_POLICY", version: "1.0", title: "Gizlilik Politikası", url: "https://www.pagapp.com.tr/privacy", contentHash: "", isRequired: false),
            LegalDocument(documentId: "AGE_SUITABILITY", type: "AGE_SUITABILITY", version: "1.0", title: "18+ Yaş Uygunluğu Bildirimi", url: "https://www.pagapp.com.tr/age-suitability", contentHash: "", isRequired: false)
        ]
    }
}

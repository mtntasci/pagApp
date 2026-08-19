import SwiftUI
import UserNotifications

public struct LegalSettingsView: View {
    @StateObject private var legalService = LegalService.shared
    @StateObject private var userService = UserService.shared
    
    @State private var allowCommunication: Bool = false
    @State private var isOsNotificationDenied: Bool = false
    @State private var selectedDocumentForReading: LegalDocument? = nil
    
    public init() {}
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    
                    // OS Notification Warning Banner if OS notifications are disabled
                    if isOsNotificationDenied {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(PAGTheme.brandOrange)
                                Text("Cihaz Bildirim İzni Kapalı")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(PAGTheme.textPrimary)
                            }
                            
                            Text("iOS sistem ayarlarından PAG bildirimlerine izin verilmemiş görünüyor. Kampanya ve anket bildirimlerini anlık alabilmek için lütfen sistem ayarlarını açınız.")
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
                            Text("İletişim Tercihleri (İsteğe Bağlı)")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(PAGTheme.textPrimary)
                            
                            Text("Kampanya, fırsat ve anket duyurularını almak istediğiniz kanalları seçebilirsiniz. İstediğiniz zaman ayarlardan değiştirebilirsiniz.")
                                .font(.system(size: 13))
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
        .onChange(of: allowCommunication) { _ in savePreferences() }
        .task {
            _ = await legalService.fetchActiveLegalDocuments()
        }
    }
    
    private func initPreferences() {
        if let prefs = userService.currentUser?.communicationPreferences {
            self.allowCommunication = prefs.smsMarketing || prefs.emailMarketing || prefs.phoneMarketing
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
            pushMarketing: !isOsNotificationDenied,
            smsMarketing: allowCommunication,
            emailMarketing: allowCommunication,
            phoneMarketing: allowCommunication
        )
        
        Task {
            _ = await legalService.updateCommunicationPreferences(preferences: prefs)
            userService.updateCommunicationPreferencesState(preferences: prefs)
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

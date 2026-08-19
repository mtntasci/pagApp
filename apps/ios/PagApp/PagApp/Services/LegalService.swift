import Foundation
import Combine

@MainActor
public final class LegalService: ObservableObject {
    public static let shared = LegalService()
    
    @Published public private(set) var activeDocuments: [LegalDocument] = []
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var errorMessage: String?
    
    private init() {}
    
    public func fetchActiveLegalDocuments() async -> [LegalDocument] {
        isLoading = true
        errorMessage = nil
        
        do {
            if let response = try? await PAGApiClient.shared.get(endpoint: "/legal/documents"),
               let success = response["success"] as? Bool, success,
               let docsData = response["data"] as? [[String: Any]] {
                
                let docs = docsData.compactMap { d -> LegalDocument? in
                    guard let docId = d["documentId"] as? String,
                          let type = d["type"] as? String,
                          let version = d["version"] as? String,
                          let title = d["title"] as? String,
                          let url = d["url"] as? String,
                          let hash = d["contentHash"] as? String else {
                        return nil
                    }
                    let isReq = d["isRequired"] as? Bool ?? true
                    let isAct = d["isActive"] as? Bool ?? true
                    let reqReacc = d["requiresReacceptance"] as? Bool ?? false
                    
                    return LegalDocument(
                        documentId: docId,
                        type: type,
                        version: version,
                        title: title,
                        url: url,
                        contentHash: hash,
                        required: isReq
                    )
                }
                
                self.activeDocuments = docs
                self.isLoading = false
                return docs
            }
        } catch {
            print("fetchActiveLegalDocuments error: \(error.localizedDescription)")
        }
        
        let defaults: [LegalDocument] = [
            LegalDocument(documentId: "TERMS", type: "TERMS", version: "1.0", title: "Kullanım Koşulları ve Üyelik Sözleşmesi", url: "https://www.pagapp.com.tr/terms", contentHash: "PAG_TERMS_V1.0", required: true),
            LegalDocument(documentId: "KVKK_NOTICE", type: "KVKK_NOTICE", version: "1.0", title: "Kullanıcı Gizliliği ve KVKK Aydınlatma Metni", url: "https://www.pagapp.com.tr/user-privacy", contentHash: "PAG_KVKK_NOTICE_V1.0", required: true),
            LegalDocument(documentId: "REWARD_TERMS", type: "REWARD_TERMS", version: "1.0", title: "Ödül ve Kampanya Katılım Koşulları", url: "https://www.pagapp.com.tr/reward-terms", contentHash: "PAG_REWARD_TERMS_V1.0", required: true)
        ]
        self.activeDocuments = defaults
        self.isLoading = false
        return defaults
    }
    
    public func recordLegalAcceptances(
        acceptedDocuments: [LegalDocument],
        preferences: CommunicationPreferences
    ) async -> Bool {
        isLoading = true
        errorMessage = nil
        
        let acceptancesPayload = acceptedDocuments.map { doc in
            [
                "documentId": doc.documentId,
                "version": doc.version,
                "contentHash": doc.contentHash
            ]
        }
        
        let commPrefsPayload: [String: Any] = [
            "pushMarketing": preferences.pushMarketing,
            "smsMarketing": preferences.smsMarketing,
            "emailMarketing": preferences.emailMarketing,
            "phoneMarketing": preferences.phoneMarketing
        ]
        
        let payload: [String: Any] = [
            "acceptances": acceptancesPayload,
            "communicationPreferences": commPrefsPayload,
            "source": "IOS"
        ]
        
        do {
            if let response = try? await PAGApiClient.shared.post(endpoint: "/legal/acceptances", body: payload),
               let success = response["success"] as? Bool, success {
                self.isLoading = false
                return true
            }
        } catch {
            print("recordLegalAcceptances error: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
        }
        
        self.isLoading = false
        return false
    }
    
    public func updateCommunicationPreferences(preferences: CommunicationPreferences) async -> Bool {
        let commPrefsPayload: [String: Any] = [
            "pushMarketing": preferences.pushMarketing,
            "smsMarketing": preferences.smsMarketing,
            "emailMarketing": preferences.emailMarketing,
            "phoneMarketing": preferences.phoneMarketing
        ]
        let payload: [String: Any] = [
            "communicationPreferences": commPrefsPayload
        ]
        
        if let response = try? await PAGApiClient.shared.post(endpoint: "/legal/acceptances", body: payload),
           let success = response["success"] as? Bool, success {
            return true
        }
        return false
    }
}

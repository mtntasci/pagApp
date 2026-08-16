import Foundation
import Combine
import FirebaseFunctions

@MainActor
public final class LegalService: ObservableObject {
    public static let shared = LegalService()
    
    @Published public private(set) var activeDocuments: [LegalDocument] = []
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var errorMessage: String?
    
    private init() {}
    
    /**
     * Fetches all active legal documents from the Firestore registry.
     */
    public func fetchActiveLegalDocuments() async -> [LegalDocument] {
        isLoading = true
        errorMessage = nil
        
        do {
            let result = try await Functions.functions().httpsCallable("getActiveLegalDocuments").call()
            
            if let response = result.data as? [String: Any],
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
                    let isReq = d["isRequired"] as? Bool ?? false
                    let isAct = d["isActive"] as? Bool ?? true
                    let reqReacc = d["requiresReacceptance"] as? Bool ?? false
                    
                    return LegalDocument(
                        documentId: docId,
                        type: type,
                        version: version,
                        title: title,
                        url: url,
                        contentHash: hash,
                        isRequired: isReq,
                        isActive: isAct,
                        requiresReacceptance: reqReacc
                    )
                }
                
                self.activeDocuments = docs
                self.isLoading = false
                return docs
            }
        } catch {
            print("fetchActiveLegalDocuments error: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
        }
        
        self.isLoading = false
        return self.activeDocuments
    }
    
    /**
     * Records user acceptances for required documents and stores communication preferences.
     */
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
            let result = try await Functions.functions().httpsCallable("recordLegalAcceptances").call(payload)
            
            if let response = result.data as? [String: Any],
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
    
    /**
     * Updates marketing communication preferences from settings.
     */
    public func updateCommunicationPreferences(preferences: CommunicationPreferences) async -> Bool {
        let payload: [String: Any] = [
            "pushMarketing": preferences.pushMarketing,
            "smsMarketing": preferences.smsMarketing,
            "emailMarketing": preferences.emailMarketing,
            "phoneMarketing": preferences.phoneMarketing
        ]
        
        do {
            let result = try await Functions.functions().httpsCallable("updateCommunicationPreferences").call(payload)
            if let response = result.data as? [String: Any],
               let success = response["success"] as? Bool, success {
                return true
            }
        } catch {
            print("updateCommunicationPreferences error: \(error.localizedDescription)")
        }
        return false
    }
}

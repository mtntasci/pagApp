import Foundation

public enum LegalDocumentType: String, Codable, CaseIterable {
    case terms = "TERMS"
    case kvkkNotice = "KVKK_NOTICE"
    case explicitConsent = "EXPLICIT_CONSENT"
    case commercialCommunication = "COMMERCIAL_COMMUNICATION"
    case rewardTerms = "REWARD_TERMS"
    case privacyPolicy = "PRIVACY_POLICY"
    case ageSuitability = "AGE_SUITABILITY"
}

public struct LegalDocument: Codable, Identifiable, Equatable {
    public var id: String { documentId }
    
    public let documentId: String
    public let type: String
    public let version: String
    public let title: String
    public let url: String
    public let contentHash: String
    public let isRequired: Bool
    public let isActive: Bool
    public let requiresReacceptance: Bool
    
    public init(
        documentId: String,
        type: String,
        version: String,
        title: String,
        url: String,
        contentHash: String,
        isRequired: Bool,
        isActive: Bool = true,
        requiresReacceptance: Bool = false
    ) {
        self.documentId = documentId
        self.type = type
        self.version = version
        self.title = title
        self.url = url
        self.contentHash = contentHash
        self.isRequired = isRequired
        self.isActive = isActive
        self.requiresReacceptance = requiresReacceptance
    }
}

public struct UserLegalAcceptance: Codable, Identifiable, Equatable {
    public var id: String { "\(documentId)_\(version)" }
    
    public let documentId: String
    public let documentType: String
    public let version: String
    public let contentHash: String
    public let accepted: Bool
    public let source: String
    
    public init(
        documentId: String,
        documentType: String,
        version: String,
        contentHash: String,
        accepted: Bool = true,
        source: String = "IOS"
    ) {
        self.documentId = documentId
        self.documentType = documentType
        self.version = version
        self.contentHash = contentHash
        self.accepted = accepted
        self.source = source
    }
}

public struct CommunicationPreferences: Codable, Equatable {
    public var pushMarketing: Bool
    public var smsMarketing: Bool
    public var emailMarketing: Bool
    public var phoneMarketing: Bool
    
    public init(
        pushMarketing: Bool = false,
        smsMarketing: Bool = false,
        emailMarketing: Bool = false,
        phoneMarketing: Bool = false
    ) {
        self.pushMarketing = pushMarketing
        self.smsMarketing = smsMarketing
        self.emailMarketing = emailMarketing
        self.phoneMarketing = phoneMarketing
    }
}

public struct LegalConsentStatus: Codable, Equatable {
    public let consentRequired: Bool
    public let activeDocuments: [LegalDocument]
    public let requiredDocuments: [LegalDocument]
    public let acceptedDocumentIds: [String]
    public let missingDocumentIds: [String]
    public let missingDocuments: [LegalDocument]
    public let communicationPreferences: CommunicationPreferences
}

import Foundation

public struct PAGUser: Codable, Identifiable, Equatable {
    public var id: String { userId }
    
    public let userId: String
    public let email: String?
    public let phone: String?
    public let displayName: String?
    public let firstName: String?
    public let lastName: String?
    public let photoUrl: String?
    public let authProviders: [String]
    public let status: String
    public let profileScore: Int
    public let profileCompleted: Bool
    public let phoneVerified: Bool
    public let emailVerified: Bool
    public let kycStatus: String
    public let iban: String?
    public let tckn: String?
    public let ibanVerified: Bool
    public let activeDeviceId: String?
    
    // Legal & Consent Status
    public var legalConsentRequired: Bool
    public var missingDocumentIds: [String]
    public var missingDocuments: [LegalDocument]
    public var communicationPreferences: CommunicationPreferences
    public var isUnderage: Bool
    public var underageBlocked: Bool
    
    public init(
        userId: String,
        email: String? = nil,
        phone: String? = nil,
        displayName: String? = nil,
        firstName: String? = nil,
        lastName: String? = nil,
        photoUrl: String? = nil,
        authProviders: [String] = [],
        status: String = "ACTIVE",
        profileScore: Int = 0,
        profileCompleted: Bool = false,
        phoneVerified: Bool = false,
        emailVerified: Bool = false,
        kycStatus: String = "NOT_STARTED",
        iban: String? = nil,
        tckn: String? = nil,
        ibanVerified: Bool = false,
        activeDeviceId: String? = nil,
        legalConsentRequired: Bool = false,
        missingDocumentIds: [String] = [],
        missingDocuments: [LegalDocument] = [],
        communicationPreferences: CommunicationPreferences = CommunicationPreferences(),
        isUnderage: Bool = false,
        underageBlocked: Bool = false
    ) {
        self.userId = userId
        self.email = email
        self.phone = phone
        self.displayName = displayName
        self.firstName = firstName
        self.lastName = lastName
        self.photoUrl = photoUrl
        self.authProviders = authProviders
        self.status = status
        self.profileScore = profileScore
        self.profileCompleted = profileCompleted
        self.phoneVerified = phoneVerified
        self.emailVerified = emailVerified
        self.kycStatus = kycStatus
        self.iban = iban
        self.tckn = tckn
        self.ibanVerified = ibanVerified
        self.activeDeviceId = activeDeviceId
        self.legalConsentRequired = legalConsentRequired
        self.missingDocumentIds = missingDocumentIds
        self.missingDocuments = missingDocuments
        self.communicationPreferences = communicationPreferences
        self.isUnderage = isUnderage
        self.underageBlocked = underageBlocked
    }
}

import Foundation

public struct PAGUser: Codable, Identifiable, Equatable {
    public var id: String { userId }
    
    public let userId: String
    public let email: String?
    public let phone: String?
    public let displayName: String?
    public let photoUrl: String?
    public let authProviders: [String]
    public let status: String
    public let profileScore: Int
    public let profileCompleted: Bool
    public let phoneVerified: Bool
    public let emailVerified: Bool
    public let kycStatus: String
    public let activeDeviceId: String?
    
    public init(
        userId: String,
        email: String? = nil,
        phone: String? = nil,
        displayName: String? = nil,
        photoUrl: String? = nil,
        authProviders: [String] = [],
        status: String = "ACTIVE",
        profileScore: Int = 0,
        profileCompleted: Bool = false,
        phoneVerified: Bool = false,
        emailVerified: Bool = false,
        kycStatus: String = "NOT_STARTED",
        activeDeviceId: String? = nil
    ) {
        self.userId = userId
        self.email = email
        self.phone = phone
        self.displayName = displayName
        self.photoUrl = photoUrl
        self.authProviders = authProviders
        self.status = status
        self.profileScore = profileScore
        self.profileCompleted = profileCompleted
        self.phoneVerified = phoneVerified
        self.emailVerified = emailVerified
        self.kycStatus = kycStatus
        self.activeDeviceId = activeDeviceId
    }
}

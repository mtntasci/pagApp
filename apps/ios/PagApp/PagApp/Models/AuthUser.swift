import Foundation
import FirebaseAuth

public struct AuthUser: Identifiable, Equatable {
    public var id: String { uid }
    public let uid: String
    public let email: String?
    public let displayName: String?
    public let photoURL: URL?
    public let provider: String

    public init(uid: String, email: String? = nil, displayName: String? = nil, photoURL: URL? = nil, provider: String = "firebase") {
        self.uid = uid
        self.email = email
        self.displayName = displayName
        self.photoURL = photoURL
        self.provider = provider
    }

    public init(user: User) {
        self.uid = user.uid
        self.email = user.email
        self.displayName = user.displayName
        self.photoURL = user.photoURL
        self.provider = user.providerData.first?.providerID ?? "firebase"
    }
}

import Foundation
import Combine
import FirebaseFunctions

@MainActor
public final class UserService: ObservableObject {
    public static let shared = UserService()
    
    @Published public private(set) var currentUser: PAGUser?
    @Published public private(set) var isBootstrapping: Bool = false
    @Published public private(set) var bootstrapError: String?
    
    private init() {}
    
    public func bootstrapCurrentUser() async {
        guard !isBootstrapping else { return }
        
        isBootstrapping = true
        bootstrapError = nil
        
        let deviceId = DeviceService.shared.deviceId
        let platform = DeviceService.shared.platform
        let appVersion = DeviceService.shared.appVersion
        
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "platform": platform,
            "appVersion": appVersion
        ]
        
        do {
            let result = try await Functions.functions().httpsCallable("bootstrapCurrentUser").call(payload)
            
            if let responseData = result.data as? [String: Any],
               let success = responseData["success"] as? Bool, success,
               let userData = responseData["data"] as? [String: Any] {
                
                let user = PAGUser(
                    userId: userData["userId"] as? String ?? "",
                    email: userData["email"] as? String,
                    phone: userData["phone"] as? String,
                    displayName: userData["displayName"] as? String,
                    photoUrl: userData["photoUrl"] as? String,
                    authProviders: userData["authProviders"] as? [String] ?? [],
                    status: userData["status"] as? String ?? "ACTIVE",
                    profileScore: userData["profileScore"] as? Int ?? 0,
                    profileCompleted: userData["profileCompleted"] as? Bool ?? false,
                    phoneVerified: userData["phoneVerified"] as? Bool ?? false,
                    emailVerified: userData["emailVerified"] as? Bool ?? false,
                    kycStatus: userData["kycStatus"] as? String ?? "NOT_STARTED",
                    activeDeviceId: userData["activeDeviceId"] as? String
                )
                
                self.currentUser = user
                self.isBootstrapping = false
            } else {
                self.bootstrapError = "Hesabınız hazırlanırken bir sorun oluştu. Lütfen tekrar deneyin."
                self.isBootstrapping = false
            }
        } catch {
            print("bootstrapCurrentUser error: \(error.localizedDescription)")
            self.bootstrapError = "Hesabınız hazırlanırken bir sorun oluştu. Lütfen tekrar deneyin."
            self.isBootstrapping = false
        }
    }
    
    public func clearUserSession() {
        self.currentUser = nil
        self.isBootstrapping = false
        self.bootstrapError = nil
    }
}

import Foundation
import Combine
import FirebaseFunctions
import FirebaseAuth

public struct PAGUserRanking: Codable {
    public let profileScore: Int
    public let rank: Int
    public let totalEligibleUsers: Int
    public let percentileText: String
    
    public var percentile: Double {
        if rank == 1 {
            return 1.0
        }
        if let match = percentileText.range(of: "%") {
            let numStr = percentileText[match.upperBound...].trimmingCharacters(in: .whitespaces)
            if let p = Double(numStr) {
                return p
            }
        }
        if totalEligibleUsers > 0 {
            return (Double(rank) / Double(totalEligibleUsers)) * 100.0
        }
        return 100.0
    }
}

@MainActor
public final class UserService: ObservableObject {
    public static let shared = UserService()
    
    @Published public private(set) var currentUser: PAGUser?
    @Published public private(set) var currentRanking: PAGUserRanking?
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
                    iban: userData["iban"] as? String,
                    tckn: userData["tckn"] as? String,
                    ibanVerified: userData["ibanVerified"] as? Bool ?? false,
                    activeDeviceId: userData["activeDeviceId"] as? String
                )
                
                self.currentUser = user
                self.isBootstrapping = false
                
                // Fetch user ranking
                await fetchUserRanking()
                return
            }
        } catch {
            print("bootstrapCurrentUser error: \(error.localizedDescription)")
        }
        
        // Fallback: If Firebase Auth has an active session, initialize fallback user locally
        if let firebaseUser = Auth.auth().currentUser {
            let fallbackUser = PAGUser(
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                phone: firebaseUser.phoneNumber,
                displayName: firebaseUser.displayName ?? firebaseUser.email?.components(separatedBy: "@").first ?? "PAG Kullanıcısı",
                photoUrl: firebaseUser.photoURL?.absoluteString,
                authProviders: firebaseUser.providerData.map { $0.providerID },
                status: "ACTIVE",
                profileScore: 0,
                profileCompleted: false,
                phoneVerified: firebaseUser.phoneNumber != nil,
                emailVerified: firebaseUser.isEmailVerified,
                kycStatus: "NOT_STARTED",
                activeDeviceId: deviceId
            )
            self.currentUser = fallbackUser
            self.isBootstrapping = false
            self.bootstrapError = nil
        } else {
            self.bootstrapError = "Hesabınız hazırlanırken bir sorun oluştu. Lütfen tekrar deneyin."
            self.isBootstrapping = false
        }
    }
    
    public func fetchUserRanking() async {
        do {
            let result = try await Functions.functions().httpsCallable("getCurrentUserRanking").call()
            if let responseData = result.data as? [String: Any],
               let success = responseData["success"] as? Bool, success,
               let rData = responseData["data"] as? [String: Any] {
                
                let ranking = PAGUserRanking(
                    profileScore: rData["profileScore"] as? Int ?? (currentUser?.profileScore ?? 0),
                    rank: rData["rank"] as? Int ?? 1,
                    totalEligibleUsers: rData["totalEligibleUsers"] as? Int ?? 1,
                    percentileText: rData["percentileText"] as? String ?? "Top %1"
                )
                self.currentRanking = ranking
            }
        } catch {
            print("getCurrentUserRanking error: \(error.localizedDescription)")
        }
    }
    
    public func updateUserProfileScore(newScore: Int) {
        if var user = currentUser {
            user = PAGUser(
                userId: user.userId,
                email: user.email,
                phone: user.phone,
                displayName: user.displayName,
                photoUrl: user.photoUrl,
                authProviders: user.authProviders,
                status: user.status,
                profileScore: newScore,
                profileCompleted: user.profileCompleted,
                phoneVerified: user.phoneVerified,
                emailVerified: user.emailVerified,
                kycStatus: user.kycStatus,
                activeDeviceId: user.activeDeviceId
            )
            self.currentUser = user
        }
    }
    
    public func verifyPhone(phone: String) async -> Bool {
        do {
            let result = try await Functions.functions().httpsCallable("verifyPhone").call(["phone": phone])
            if let responseData = result.data as? [String: Any],
               let success = responseData["success"] as? Bool, success {
                await bootstrapCurrentUser()
                return true
            }
        } catch {
            print("verifyPhone error: \(error.localizedDescription)")
        }
        return false
    }
    
    public func submitIbanAndTckn(iban: String, tckn: String) async -> Bool {
        do {
            let result = try await Functions.functions().httpsCallable("submitIbanAndTckn").call(["iban": iban, "tckn": tckn])
            if let responseData = result.data as? [String: Any],
               let success = responseData["success"] as? Bool, success {
                await bootstrapCurrentUser()
                return true
            }
        } catch {
            print("submitIbanAndTckn error: \(error.localizedDescription)")
        }
        return false
    }
    
    public func submitKyc() async -> Bool {
        do {
            let result = try await Functions.functions().httpsCallable("submitKyc").call()
            if let responseData = result.data as? [String: Any],
               let success = responseData["success"] as? Bool, success {
                await bootstrapCurrentUser()
                return true
            }
        } catch {
            print("submitKyc error: \(error.localizedDescription)")
        }
        return false
    }

    public func clearUserSession() {
        self.currentUser = nil
        self.currentRanking = nil
        self.isBootstrapping = false
        self.bootstrapError = nil
    }
}

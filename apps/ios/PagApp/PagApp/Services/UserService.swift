import Foundation
import Combine

public struct PAGRankingSnapshot: Codable {
    public let rank: Int
    public let totalParticipants: Int
    public let percentile: Double
    public let profileScore: Int
    public let isTopTier: Bool
    
    public var percentileText: String {
        return "%\(Int(percentile))"
    }
}

@MainActor
public class UserService: ObservableObject {
    public static let shared = UserService()
    
    @Published public private(set) var currentUser: PAGUser?
    @Published public private(set) var currentRanking: PAGRankingSnapshot?
    @Published public private(set) var isBootstrapping: Bool = false
    @Published public private(set) var bootstrapError: String? = nil
    
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
            let apiResult = try await PAGApiClient.shared.post(endpoint: "/bootstrap", body: payload)
            if let success = apiResult["success"] as? Bool, success,
               let userData = apiResult["data"] as? [String: Any] {
                
                let rawName = userData["displayName"] as? String ?? "Kullanıcı"
                let nameParts = rawName.components(separatedBy: " ")
                let fName = userData["firstName"] as? String ?? nameParts.first ?? ""
                let lName = userData["lastName"] as? String ?? (nameParts.count > 1 ? nameParts.dropFirst().joined(separator: " ") : "")
                let pScore = userData["profileScore"] as? Int ?? 0
                let isProfComp = userData["profileCompleted"] as? Bool ?? false
                
                let commPrefsData = userData["communicationPreferences"] as? [String: Any] ?? [:]
                let commPrefs = CommunicationPreferences(
                    pushMarketing: commPrefsData["pushMarketing"] as? Bool ?? false,
                    smsMarketing: commPrefsData["smsMarketing"] as? Bool ?? false,
                    emailMarketing: commPrefsData["emailMarketing"] as? Bool ?? false,
                    phoneMarketing: commPrefsData["phoneMarketing"] as? Bool ?? false
                )
                
                let missingDocsData = userData["missingDocuments"] as? [[String: Any]] ?? []
                let missingDocs = missingDocsData.compactMap { d -> LegalDocument? in
                    guard let docId = d["documentId"] as? String,
                          let type = d["type"] as? String,
                          let version = d["version"] as? String,
                          let title = d["title"] as? String,
                          let url = d["url"] as? String,
                          let hash = d["contentHash"] as? String else {
                        return nil
                    }
                    return LegalDocument(
                        documentId: docId,
                        type: type,
                        version: version,
                        title: title,
                        url: url,
                        contentHash: hash,
                        isRequired: d["isRequired"] as? Bool ?? true,
                        isActive: d["isActive"] as? Bool ?? true,
                        requiresReacceptance: d["requiresReacceptance"] as? Bool ?? false
                    )
                }
                
                let uid = userData["userId"] as? String ?? ""
                let email = userData["email"] as? String
                let phone = userData["phone"] as? String
                let pUrl = userData["photoUrl"] as? String
                let status = userData["status"] as? String ?? "ACTIVE"
                let kycStatus = userData["kycStatus"] as? String ?? "NOT_STARTED"
                let iban = userData["iban"] as? String
                let tckn = userData["tckn"] as? String
                let rewardBal = Double(userData["rewardBalance"] as? Int ?? 0)
                let devId = userData["activeDeviceId"] as? String
                let isUnderage = userData["isUnderage"] as? Bool ?? false
                let underageBlocked = userData["underageBlocked"] as? Bool ?? false
                let city = userData["city"] as? String
                let district = userData["district"] as? String
                let gender = userData["gender"] as? String
                let birthDate = userData["birthDate"] as? String
                let age = userData["age"] as? Int
                let maritalStatus = userData["maritalStatus"] as? String
                let childrenStatus = userData["childrenStatus"] as? String
                let hometown = userData["hometown"] as? String
                let education = userData["education"] as? String
                let occupation = userData["occupation"] as? String
                
                let isPhoneVerified = userData["phoneVerified"] as? Bool ?? false
                
                let user = PAGUser(
                    userId: uid,
                    email: email,
                    phone: phone,
                    displayName: rawName,
                    firstName: fName,
                    lastName: lName,
                    photoUrl: pUrl,
                    authProviders: ["phone"],
                    status: status,
                    profileScore: pScore,
                    profileCompleted: isProfComp,
                    phoneVerified: isPhoneVerified,
                    emailVerified: false,
                    kycStatus: kycStatus,
                    iban: iban,
                    tckn: tckn,
                    ibanVerified: false,
                    activeDeviceId: devId,
                    rewardBalance: rewardBal,
                    city: city,
                    district: district,
                    gender: gender,
                    birthDate: birthDate,
                    age: age,
                    maritalStatus: maritalStatus,
                    childrenStatus: childrenStatus,
                    hometown: hometown,
                    education: education,
                    occupation: occupation,
                    legalConsentRequired: false,
                    missingDocumentIds: [],
                    missingDocuments: missingDocs,
                    communicationPreferences: commPrefs,
                    isUnderage: isUnderage,
                    underageBlocked: underageBlocked
                )
                
                self.currentUser = user
            } else {
                let errMsg = apiResult["error"] as? String ?? "Sunucuya bağlanılamadı."
                self.bootstrapError = errMsg
            }
        } catch {
            print("[UserService] Bootstrap error: \(error.localizedDescription)")
            self.bootstrapError = "Ağ bağlantı hatası: \(error.localizedDescription)"
        }
        
        self.isBootstrapping = false
    }
    
    public func fetchRankingSnapshot() async {
        guard let user = currentUser else { return }
        
        let score = user.profileScore
        let estimatedRank = max(1, 1000 - (score * 2))
        let totalUsers = 1000
        let percentile = Double(totalUsers - estimatedRank) / Double(totalUsers) * 100.0
        
        self.currentRanking = PAGRankingSnapshot(
            rank: estimatedRank,
            totalParticipants: totalUsers,
            percentile: percentile,
            profileScore: score,
            isTopTier: percentile >= 80.0
        )
    }
    
    public func updateProfileScore(delta: Int) {
        guard var user = currentUser else { return }
        user.profileScore += delta
        self.currentUser = user
        Task {
            await fetchRankingSnapshot()
        }
    }
    
    public func updateBasicProfile(
        firstName: String,
        lastName: String,
        gender: String,
        maritalStatus: String,
        birthDate: String,
        city: String,
        district: String,
        hometown: String,
        education: String,
        occupation: String
    ) async -> Bool {
        let restBody: [String: Any] = [
            "displayName": "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces),
            "gender": gender,
            "maritalStatus": maritalStatus,
            "birthDate": birthDate,
            "city": city,
            "district": district,
            "hometown": hometown,
            "education": education,
            "occupation": occupation
        ]
        
        do {
            let apiRes = try await PAGApiClient.shared.put(endpoint: "/profile", body: restBody)
            if let success = apiRes["success"] as? Bool, success {
                await bootstrapCurrentUser()
                return true
            }
        } catch {
            print("[UserService] Update basic profile error: \(error.localizedDescription)")
        }
        return false
    }
    
    public func verifyPhone(phone: String) async -> Bool {
        do {
            let apiRes = try await PAGApiClient.shared.post(endpoint: "/profile/verify-phone", body: ["phone": phone])
            if let success = apiRes["success"] as? Bool, success {
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
            let apiRes = try await PAGApiClient.shared.put(endpoint: "/profile", body: ["iban": iban, "tckn": tckn])
            if let success = apiRes["success"] as? Bool, success {
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
            let apiRes = try await PAGApiClient.shared.put(endpoint: "/profile", body: ["kycStatus": "PENDING"])
            if let success = apiRes["success"] as? Bool, success {
                await bootstrapCurrentUser()
                return true
            }
        } catch {
            print("submitKyc error: \(error.localizedDescription)")
        }
        return false
    }

    public func completeLegalConsent(preferences: CommunicationPreferences) {
        if var user = currentUser {
            user.legalConsentRequired = false
            user.missingDocumentIds = []
            user.missingDocuments = []
            user.communicationPreferences = preferences
            self.currentUser = user
        }
    }
    
    public func updateCommunicationPreferencesState(preferences: CommunicationPreferences) {
        if var user = currentUser {
            user.communicationPreferences = preferences
            self.currentUser = user
        }
    }

    public func clearUserSession() {
        self.currentUser = nil
        self.currentRanking = nil
        self.isBootstrapping = false
        self.bootstrapError = nil
    }
}

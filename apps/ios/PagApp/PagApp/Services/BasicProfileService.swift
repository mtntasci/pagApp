import Foundation
import Combine
import FirebaseFunctions

@MainActor
public final class BasicProfileService: ObservableObject {
    public static let shared = BasicProfileService()
    
    @Published public private(set) var basicProfile: PAGBasicProfile = PAGBasicProfile()
    @Published public private(set) var locations: [PAGCity] = []
    @Published public var isLoading: Bool = false
    @Published var isSaving: Bool = false
    @Published public var errorMessage: String?
    @Published var saveSuccessMessage: String?
    
    private init() {
        loadLocationsDataset()
    }
    
    private func loadLocationsDataset() {
        let hardcodedData = """
        {
          "cities": [
            {
              "id": "34", "name": "İstanbul",
              "districts": [
                { "id": "3401", "name": "Kadıköy", "neighborhoods": [{ "id": "340101", "name": "Caferağa Mah." }, { "id": "340102", "name": "Moda Mah." }] },
                { "id": "3402", "name": "Beşiktaş", "neighborhoods": [{ "id": "340201", "name": "Bebek Mah." }, { "id": "340202", "name": "Etiler Mah." }] },
                { "id": "3403", "name": "Şişli", "neighborhoods": [{ "id": "340301", "name": "Teşvikiye Mah." }] }
              ]
            },
            {
              "id": "06", "name": "Ankara",
              "districts": [
                { "id": "0601", "name": "Çankaya", "neighborhoods": [{ "id": "060101", "name": "Kızılay Mah." }] },
                { "id": "0602", "name": "Yenimahalle", "neighborhoods": [{ "id": "060201", "name": "Batıkent Mah." }] }
              ]
            },
            {
              "id": "35", "name": "İzmir",
              "districts": [
                { "id": "3501", "name": "Konak", "neighborhoods": [{ "id": "350101", "name": "Alsancak Mah." }] },
                { "id": "3502", "name": "Karşıyaka", "neighborhoods": [{ "id": "350201", "name": "Bostanlı Mah." }] }
              ]
            }
          ]
        }
        """.data(using: .utf8)!
        
        if let decoded = try? JSONDecoder().decode(PAGTurkeyLocations.self, from: hardcodedData) {
            self.locations = decoded.cities
        }
    }
    
    public func fetchBasicProfile() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let result = try await Functions.functions().httpsCallable("getBasicProfile").call()
            if let responseData = result.data as? [String: Any],
               let success = responseData["success"] as? Bool, success,
               let data = responseData["data"] as? [String: Any] {
                
                var bProfile = PAGBasicProfile()
                bProfile.completionPercentage = data["completionPercentage"] as? Int ?? 0
                bProfile.scoreAwarded = data["scoreAwarded"] as? Bool ?? false
                
                if let pDict = data["profile"] as? [String: Any] {
                    if let marital = pDict["maritalStatus"] as? String {
                        bProfile.maritalStatus = marital
                    }
                    
                    if let bDict = pDict["birthDetails"] as? [String: Any] {
                        bProfile.birthDetails = PAGBirthDetails(
                            birthDate: bDict["birthDate"] as? String ?? "",
                            cityId: bDict["cityId"] as? String ?? "",
                            cityName: bDict["cityName"] as? String ?? "",
                            districtId: bDict["districtId"] as? String ?? "",
                            districtName: bDict["districtName"] as? String ?? ""
                        )
                    }
                    
                    if let cDict = pDict["childrenInfo"] as? [String: Any] {
                        var childList: [PAGChildInfo] = []
                        if let cArr = cDict["children"] as? [[String: Any]] {
                            for item in cArr {
                                childList.append(PAGChildInfo(
                                    gender: item["gender"] as? String ?? "MALE",
                                    birthDate: item["birthDate"] as? String ?? "2020-01-01"
                                ))
                            }
                        }
                        bProfile.childrenInfo = PAGChildrenInfo(
                            hasChildren: cDict["hasChildren"] as? Bool ?? false,
                            childrenCount: cDict["childrenCount"] as? Int ?? 0,
                            children: childList
                        )
                    }
                    
                    if let rDict = pDict["residenceAddress"] as? [String: Any] {
                        bProfile.residenceAddress = PAGLocationPair(
                            cityId: rDict["cityId"] as? String ?? "",
                            cityName: rDict["cityName"] as? String ?? "",
                            districtId: rDict["districtId"] as? String ?? "",
                            districtName: rDict["districtName"] as? String ?? "",
                            neighborhoodId: rDict["neighborhoodId"] as? String,
                            neighborhoodName: rDict["neighborhoodName"] as? String
                        )
                    }
                    
                    if let hDict = pDict["hometown"] as? [String: Any] {
                        bProfile.hometown = PAGLocationPair(
                            cityId: hDict["cityId"] as? String ?? "",
                            cityName: hDict["cityName"] as? String ?? "",
                            districtId: hDict["districtId"] as? String ?? "",
                            districtName: hDict["districtName"] as? String ?? ""
                        )
                    }
                }
                
                self.basicProfile = bProfile
            }
        } catch {
            print("fetchBasicProfile error: \(error.localizedDescription)")
            self.errorMessage = "Temel profil yüklenemedi: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
    
    public func saveBasicProfile(profile: PAGBasicProfile) async -> Bool {
        isSaving = true
        errorMessage = nil
        saveSuccessMessage = nil
        
        var payload: [String: Any] = [:]
        
        payload["birthDetails"] = [
            "birthDate": profile.birthDetails.birthDate,
            "cityId": profile.birthDetails.cityId,
            "cityName": profile.birthDetails.cityName,
            "districtId": profile.birthDetails.districtId,
            "districtName": profile.birthDetails.districtName
        ]
        
        payload["maritalStatus"] = profile.maritalStatus
        
        var childrenArr: [[String: String]] = []
        for c in profile.childrenInfo.children {
            childrenArr.append([
                "gender": c.gender,
                "birthDate": c.birthDate
            ])
        }
        
        payload["childrenInfo"] = [
            "hasChildren": profile.childrenInfo.hasChildren,
            "childrenCount": profile.childrenInfo.childrenCount,
            "children": childrenArr
        ]
        
        payload["residenceAddress"] = [
            "cityId": profile.residenceAddress.cityId,
            "cityName": profile.residenceAddress.cityName,
            "districtId": profile.residenceAddress.districtId,
            "districtName": profile.residenceAddress.districtName,
            "neighborhoodId": profile.residenceAddress.neighborhoodId ?? "",
            "neighborhoodName": profile.residenceAddress.neighborhoodName ?? ""
        ]
        
        payload["hometown"] = [
            "cityId": profile.hometown.cityId,
            "cityName": profile.hometown.cityName,
            "districtId": profile.hometown.districtId,
            "districtName": profile.hometown.districtName
        ]
        
        do {
            let result = try await Functions.functions().httpsCallable("updateBasicProfile").call(payload)
            if let responseData = result.data as? [String: Any],
               let success = responseData["success"] as? Bool, success,
               let data = responseData["data"] as? [String: Any] {
                
                let completion = data["completionPercentage"] as? Int ?? 0
                let scoreAwarded = data["scoreAwarded"] as? Bool ?? false
                let scoreAmount = data["scoreAmount"] as? Int ?? 0
                
                var updated = profile
                updated.completionPercentage = completion
                updated.scoreAwarded = scoreAwarded
                self.basicProfile = updated
                
                if scoreAwarded && scoreAmount > 0 {
                    self.saveSuccessMessage = "Profil başarıyla kaydedildi! +\(scoreAmount) Profil Puanı Kazandınız! 🎉"
                    let currentScore = UserService.shared.currentUser?.profileScore ?? 0
                    UserService.shared.updateUserProfileScore(newScore: currentScore + scoreAmount)
                } else {
                    self.saveSuccessMessage = "Profil başarıyla kaydedildi."
                }
                
                isSaving = false
                return true
            } else {
                self.errorMessage = "Profil kaydedilemedi. Lütfen girdiğiniz bilgileri kontrol edin."
            }
        } catch {
            self.errorMessage = "Profil kaydedilirken bir hata oluştu: \(error.localizedDescription)"
        }
        
        isSaving = false
        return false
    }
}

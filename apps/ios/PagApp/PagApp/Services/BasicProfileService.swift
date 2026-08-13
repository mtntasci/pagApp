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
        var jsonData: Data? = nil
        if let fileURL = Bundle.main.url(forResource: "turkey-locations", withExtension: "json") {
            jsonData = try? Data(contentsOf: fileURL)
        }
        
        if jsonData == nil {
            let hardcodedData = """
            {
              "cities": [
                { "id": "01", "name": "Adana", "districts": [{ "id": "0101", "name": "Seyhan" }, { "id": "0102", "name": "Çukurova" }, { "id": "0103", "name": "Yüreğir" }] }
              ]
            }
            """.data(using: .utf8)
            jsonData = hardcodedData
        }
        
        if let data = jsonData, let decoded = try? JSONDecoder().decode(PAGTurkeyLocations.self, from: data) {
            let processedCities = decoded.cities.map { city -> PAGCity in
                var updatedCity = city
                updatedCity.districts = city.districts.map { district -> PAGDistrict in
                    var updatedDistrict = district
                    if district.neighborhoods == nil || district.neighborhoods?.isEmpty == true {
                        updatedDistrict.neighborhoods = [
                            PAGNeighborhood(id: "\(district.id)01", name: "Merkez Mah."),
                            PAGNeighborhood(id: "\(district.id)02", name: "Cumhuriyet Mah."),
                            PAGNeighborhood(id: "\(district.id)03", name: "Atatürk Mah.")
                        ]
                    }
                    return updatedDistrict
                }
                return updatedCity
            }
            self.locations = processedCities
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
                    bProfile.firstName = pDict["firstName"] as? String ?? ""
                    bProfile.lastName = pDict["lastName"] as? String ?? ""
                    bProfile.gender = pDict["gender"] as? String ?? "PREFER_NOT_TO_SAY"
                    bProfile.maritalStatus = pDict["maritalStatus"] as? String ?? "PREFER_NOT_TO_SAY"
                    
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
                            neighborhoodName: rDict["neighborhoodName"] as? String,
                            fullAddress: rDict["fullAddress"] as? String
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
        
        payload["firstName"] = profile.firstName.trimmingCharacters(in: .whitespacesAndNewlines)
        payload["lastName"] = profile.lastName.trimmingCharacters(in: .whitespacesAndNewlines)
        
        payload["birthDetails"] = [
            "birthDate": profile.birthDetails.birthDate,
            "cityId": profile.birthDetails.cityId,
            "cityName": profile.birthDetails.cityName,
            "districtId": profile.birthDetails.districtId,
            "districtName": profile.birthDetails.districtName
        ]
        
        payload["gender"] = profile.gender
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
        
        var resDict: [String: Any] = [
            "cityId": profile.residenceAddress.cityId,
            "cityName": profile.residenceAddress.cityName,
            "districtId": profile.residenceAddress.districtId,
            "districtName": profile.residenceAddress.districtName,
            "neighborhoodId": profile.residenceAddress.neighborhoodId ?? "",
            "neighborhoodName": profile.residenceAddress.neighborhoodName ?? ""
        ]
        if let fa = profile.residenceAddress.fullAddress, !fa.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            resDict["fullAddress"] = fa
        }
        payload["residenceAddress"] = resDict
        
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
                let scoreAwardedNow = data["scoreAwardedNow"] as? Int ?? 0
                
                var updatedProfile = profile
                updatedProfile.completionPercentage = completion
                if scoreAwardedNow > 0 {
                    updatedProfile.scoreAwarded = true
                }
                
                self.basicProfile = updatedProfile
                self.saveSuccessMessage = scoreAwardedNow > 0
                    ? "Tebrikler! Temel profilinizi %100 tamamladınız ve +\(scoreAwardedNow) Profil Puanı kazandınız!"
                    : "Temel profil bilgileriniz başarıyla güncellendi."
                
                isSaving = false
                return true
            }
        } catch {
            print("saveBasicProfile error: \(error.localizedDescription)")
            self.errorMessage = "Kaydetme hatası: \(error.localizedDescription)"
        }
        
        isSaving = false
        return false
    }
}

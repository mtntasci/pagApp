import Foundation
import Combine

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
            let response = try await PAGApiClient.shared.get(endpoint: "/profile")
            if let success = response["success"] as? Bool, success,
               let data = response["data"] as? [String: Any] {
                
                var bProfile = PAGBasicProfile()
                bProfile.completionPercentage = 100
                bProfile.scoreAwarded = true
                
                let rawName = data["displayName"] as? String ?? ""
                let nameParts = rawName.components(separatedBy: " ")
                bProfile.firstName = nameParts.first ?? ""
                bProfile.lastName = nameParts.count > 1 ? nameParts.dropFirst().joined(separator: " ") : ""
                bProfile.gender = data["gender"] as? String ?? "PREFER_NOT_TO_SAY"
                bProfile.maritalStatus = data["maritalStatus"] as? String ?? "PREFER_NOT_TO_SAY"
                
                bProfile.birthDetails = PAGBirthDetails(
                    birthDate: data["birthDate"] as? String ?? "1998-01-01",
                    cityId: "",
                    cityName: data["city"] as? String ?? "İstanbul",
                    districtId: "",
                    districtName: data["district"] as? String ?? ""
                )
                
                bProfile.residenceAddress = PAGLocationPair(
                    cityId: "",
                    cityName: data["city"] as? String ?? "İstanbul",
                    districtId: "",
                    districtName: data["district"] as? String ?? "",
                    neighborhoodId: nil,
                    neighborhoodName: nil
                )
                
                bProfile.hometown = PAGLocationPair(
                    cityId: "",
                    cityName: data["hometown"] as? String ?? "",
                    districtId: "",
                    districtName: "",
                    neighborhoodId: nil,
                    neighborhoodName: nil
                )
                
                bProfile.educationLevel = data["education"] as? String ?? ""
                bProfile.occupation = data["occupation"] as? String ?? ""
                
                self.basicProfile = bProfile
                self.isLoading = false
                return
            }
        } catch {
            print("fetchBasicProfile error: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
        }
        
        self.isLoading = false
    }
    
    public func saveBasicProfile(profile: PAGBasicProfile) async -> Bool {
        isSaving = true
        errorMessage = nil
        saveSuccessMessage = nil
        
        let restBody: [String: Any] = [
            "displayName": "\(profile.firstName) \(profile.lastName)".trimmingCharacters(in: .whitespaces),
            "gender": profile.gender,
            "maritalStatus": profile.maritalStatus,
            "birthDate": profile.birthDetails.birthDate,
            "city": profile.residenceAddress.cityName.isEmpty ? profile.birthDetails.cityName : profile.residenceAddress.cityName,
            "district": profile.residenceAddress.districtName.isEmpty ? profile.birthDetails.districtName : profile.residenceAddress.districtName,
            "hometown": profile.hometown.cityName,
            "education": profile.educationLevel,
            "occupation": profile.occupation
        ]
        
        do {
            let apiRes = try await PAGApiClient.shared.put(endpoint: "/profile", body: restBody)
            if let success = apiRes["success"] as? Bool, success {
                var updatedProfile = profile
                updatedProfile.completionPercentage = 100
                updatedProfile.scoreAwarded = true
                self.basicProfile = updatedProfile
                self.saveSuccessMessage = "Temel profil bilgileriniz başarıyla güncellendi."
                isSaving = false
                return true
            } else {
                self.errorMessage = apiRes["error"] as? String ?? "Profil güncellenemedi."
            }
        } catch {
            print("saveBasicProfile error: \(error.localizedDescription)")
            self.errorMessage = "Kaydetme hatası: \(error.localizedDescription)"
        }
        
        isSaving = false
        return false
    }
}

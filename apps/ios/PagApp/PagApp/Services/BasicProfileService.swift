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
            { "id": "01", "name": "Adana", "districts": [{ "id": "0101", "name": "Seyhan", "neighborhoods": [{ "id": "010101", "name": "Cemalpaşa Mah." }] }, { "id": "0102", "name": "Çukurova", "neighborhoods": [{ "id": "010201", "name": "Güzelyalı Mah." }] }, { "id": "0103", "name": "Yüreğir" }] },
            { "id": "02", "name": "Adıyaman", "districts": [{ "id": "0201", "name": "Merkez" }, { "id": "0202", "name": "Kahta" }] },
            { "id": "03", "name": "Afyonkarahisar", "districts": [{ "id": "0301", "name": "Merkez" }, { "id": "0302", "name": "Sandıklı" }] },
            { "id": "04", "name": "Ağrı", "districts": [{ "id": "0401", "name": "Merkez" }, { "id": "0402", "name": "Doğubayazıt" }] },
            { "id": "05", "name": "Amasya", "districts": [{ "id": "0501", "name": "Merkez" }, { "id": "0502", "name": "Merzifon" }] },
            {
              "id": "06", "name": "Ankara",
              "districts": [
                { "id": "0601", "name": "Çankaya", "neighborhoods": [{ "id": "060101", "name": "Kızılay Mah." }, { "id": "060102", "name": "Balgat Mah." }, { "id": "060103", "name": "Bahçelievler Mah." }] },
                { "id": "0602", "name": "Yenimahalle", "neighborhoods": [{ "id": "060201", "name": "Batıkent Mah." }, { "id": "060202", "name": "Demetevler Mah." }] },
                { "id": "0603", "name": "Keçiören", "neighborhoods": [{ "id": "060301", "name": "Etlik Mah." }] },
                { "id": "0604", "name": "Mamuk" },
                { "id": "0605", "name": "Etimesgut", "neighborhoods": [{ "id": "060501", "name": "Eryaman Mah." }] }
              ]
            },
            { "id": "07", "name": "Antalya", "districts": [{ "id": "0701", "name": "Muratpaşa", "neighborhoods": [{ "id": "070101", "name": "Lara Mah." }] }, { "id": "0702", "name": "Kepez" }, { "id": "0703", "name": "Konyaaltı" }, { "id": "0704", "name": "Alanya" }] },
            { "id": "08", "name": "Artvin", "districts": [{ "id": "0801", "name": "Merkez" }, { "id": "0802", "name": "Hopa" }] },
            { "id": "09", "name": "Aydın", "districts": [{ "id": "0901", "name": "Efeler" }, { "id": "0902", "name": "Kuşadası" }, { "id": "0903", "name": "Nazilli" }] },
            { "id": "10", "name": "Balıkesir", "districts": [{ "id": "1001", "name": "Karesi" }, { "id": "1002", "name": "Bandırma" }, { "id": "1003", "name": "Edremit" }] },
            { "id": "11", "name": "Bilecik", "districts": [{ "id": "1101", "name": "Merkez" }, { "id": "1102", "name": "Bozüyük" }] },
            { "id": "12", "name": "Bingöl", "districts": [{ "id": "1201", "name": "Merkez" }] },
            { "id": "13", "name": "Bitlis", "districts": [{ "id": "1301", "name": "Merkez" }, { "id": "1302", "name": "Tatvan" }] },
            { "id": "14", "name": "Bolu", "districts": [{ "id": "1401", "name": "Merkez" }] },
            { "id": "15", "name": "Burdur", "districts": [{ "id": "1501", "name": "Merkez" }] },
            { "id": "16", "name": "Bursa", "districts": [{ "id": "1601", "name": "Nilüfer", "neighborhoods": [{ "id": "160101", "name": "Görükle Mah." }] }, { "id": "1602", "name": "Osmangazi" }, { "id": "1603", "name": "Yıldırım" }] },
            { "id": "17", "name": "Çanakkale", "districts": [{ "id": "1701", "name": "Merkez" }, { "id": "1702", "name": "Biga" }] },
            { "id": "18", "name": "Çankırı", "districts": [{ "id": "1801", "name": "Merkez" }] },
            { "id": "19", "name": "Çorum", "districts": [{ "id": "1901", "name": "Merkez" }] },
            { "id": "20", "name": "Denizli", "districts": [{ "id": "2001", "name": "Pamukkale" }, { "id": "2002", "name": "Merkezefendi" }] },
            { "id": "21", "name": "Diyarbakır", "districts": [{ "id": "2101", "name": "Kayapınar" }, { "id": "2102", "name": "Sur" }, { "id": "2103", "name": "Yenişehir" }] },
            { "id": "22", "name": "Edirne", "districts": [{ "id": "2201", "name": "Merkez" }, { "id": "2202", "name": "Keşan" }] },
            { "id": "23", "name": "Elazığ", "districts": [{ "id": "2301", "name": "Merkez" }] },
            { "id": "24", "name": "Erzincan", "districts": [{ "id": "2401", "name": "Merkez" }] },
            { "id": "25", "name": "Erzurum", "districts": [{ "id": "2501", "name": "Yakutiye" }, { "id": "2502", "name": "Palandöken" }] },
            { "id": "26", "name": "Eskişehir", "districts": [{ "id": "2601", "name": "Tepebaşı" }, { "id": "2602", "name": "Odunpazarı" }] },
            { "id": "27", "name": "Gaziantep", "districts": [{ "id": "2701", "name": "Şahinbey" }, { "id": "2702", "name": "Şehitkamil" }] },
            { "id": "28", "name": "Giresun", "districts": [{ "id": "2801", "name": "Merkez" }] },
            { "id": "29", "name": "Gümüşhane", "districts": [{ "id": "2901", "name": "Merkez" }] },
            { "id": "30", "name": "Hakkari", "districts": [{ "id": "3001", "name": "Merkez" }, { "id": "3002", "name": "Yüksekova" }] },
            { "id": "31", "name": "Hatay", "districts": [{ "id": "3101", "name": "Antakya" }, { "id": "3102", "name": "İskenderun" }] },
            { "id": "32", "name": "Isparta", "districts": [{ "id": "3201", "name": "Merkez" }] },
            { "id": "33", "name": "Mersin", "districts": [{ "id": "3301", "name": "Yenişehir" }, { "id": "3302", "name": "Mezitli" }, { "id": "3303", "name": "Tarsus" }] },
            {
              "id": "34", "name": "İstanbul",
              "districts": [
                { "id": "3401", "name": "Kadıköy", "neighborhoods": [{ "id": "340101", "name": "Caferağa Mah." }, { "id": "340102", "name": "Moda Mah." }, { "id": "340103", "name": "Caddebostan Mah." }] },
                { "id": "3402", "name": "Beşiktaş", "neighborhoods": [{ "id": "340201", "name": "Bebek Mah." }, { "id": "340202", "name": "Etiler Mah." }, { "id": "340203", "name": "Levent Mah." }] },
                { "id": "3403", "name": "Şişli", "neighborhoods": [{ "id": "340301", "name": "Teşvikiye Mah." }, { "id": "340302", "name": "Fulya Mah." }] },
                { "id": "3404", "name": "Üsküdar", "neighborhoods": [{ "id": "340401", "name": "Acıbadem Mah." }] },
                { "id": "3405", "name": "Ataşehir", "neighborhoods": [{ "id": "340501", "name": "Barbaros Mah." }] },
                { "id": "3406", "name": "Bakırköy", "neighborhoods": [{ "id": "340601", "name": "Florya Mah." }] }
              ]
            },
            {
              "id": "35", "name": "İzmir",
              "districts": [
                { "id": "3501", "name": "Konak", "neighborhoods": [{ "id": "350101", "name": "Alsancak Mah." }] },
                { "id": "3502", "name": "Karşıyaka", "neighborhoods": [{ "id": "350201", "name": "Bostanlı Mah." }] },
                { "id": "3503", "name": "Bornova" },
                { "id": "3504", "name": "Buca" }
              ]
            },
            { "id": "36", "name": "Kars", "districts": [{ "id": "3601", "name": "Merkez" }] },
            { "id": "37", "name": "Kastamonu", "districts": [{ "id": "3701", "name": "Merkez" }] },
            { "id": "38", "name": "Kayseri", "districts": [{ "id": "3801", "name": "Melikgazi" }, { "id": "3802", "name": "Kocasinan" }] },
            { "id": "39", "name": "Kırklareli", "districts": [{ "id": "3901", "name": "Merkez" }, { "id": "3902", "name": "Lüleburgaz" }] },
            { "id": "40", "name": "Kırşehir", "districts": [{ "id": "4001", "name": "Merkez" }] },
            { "id": "41", "name": "Kocaeli", "districts": [{ "id": "4101", "name": "İzmit" }, { "id": "4102", "name": "Gebze" }] },
            { "id": "42", "name": "Konya", "districts": [{ "id": "4201", "name": "Selçuklu" }, { "id": "4202", "name": "Meram" }] },
            { "id": "43", "name": "Kütahya", "districts": [{ "id": "4301", "name": "Merkez" }] },
            { "id": "44", "name": "Malatya", "districts": [{ "id": "4401", "name": "Battalgazi" }, { "id": "4402", "name": "Yeşilyurt" }] },
            { "id": "45", "name": "Manisa", "districts": [{ "id": "4501", "name": "Yunusemre" }, { "id": "4502", "name": "Şehzadeler" }] },
            { "id": "46", "name": "Kahramanmaraş", "districts": [{ "id": "4601", "name": "Onikişubat" }, { "id": "4602", "name": "Dulkadiroğlu" }] },
            { "id": "47", "name": "Mardin", "districts": [{ "id": "4701", "name": "Artuklu" }, { "id": "4702", "name": "Midyat" }] },
            { "id": "48", "name": "Muğla", "districts": [{ "id": "4801", "name": "Bodrum" }, { "id": "4802", "name": "Fethiye" }, { "id": "4803", "name": "Menteşe" }] },
            { "id": "49", "name": "Muş", "districts": [{ "id": "4901", "name": "Merkez" }] },
            { "id": "50", "name": "Nevşehir", "districts": [{ "id": "5001", "name": "Merkez" }, { "id": "5002", "name": "Ürgüp" }] },
            { "id": "51", "name": "Niğde", "districts": [{ "id": "5101", "name": "Merkez" }] },
            { "id": "52", "name": "Ordu", "districts": [{ "id": "5201", "name": "Altınordu" }, { "id": "5202", "name": "Ünye" }] },
            { "id": "53", "name": "Rize", "districts": [{ "id": "5301", "name": "Merkez" }] },
            { "id": "54", "name": "Sakarya", "districts": [{ "id": "5401", "name": "Adapazarı" }, { "id": "5402", "name": "Serdivan" }] },
            { "id": "55", "name": "Samsun", "districts": [{ "id": "5501", "name": "Atakum" }, { "id": "5502", "name": "İlkadım" }] },
            { "id": "56", "name": "Siirt", "districts": [{ "id": "5601", "name": "Merkez" }] },
            { "id": "57", "name": "Sinop", "districts": [{ "id": "5701", "name": "Merkez" }] },
            { "id": "58", "name": "Sivas", "districts": [{ "id": "5801", "name": "Merkez" }] },
            { "id": "59", "name": "Tekirdağ", "districts": [{ "id": "5901", "name": "Süleymanpaşa" }, { "id": "5902", "name": "Çorlu" }] },
            { "id": "60", "name": "Tokat", "districts": [{ "id": "6001", "name": "Merkez" }] },
            { "id": "61", "name": "Trabzon", "districts": [{ "id": "6101", "name": "Ortahisar" }] },
            { "id": "62", "name": "Tunceli", "districts": [{ "id": "6201", "name": "Merkez" }] },
            { "id": "63", "name": "Şanlıurfa", "districts": [{ "id": "6301", "name": "Haliliye" }, { "id": "6302", "name": "Eyyübiye" }] },
            { "id": "64", "name": "Uşak", "districts": [{ "id": "6401", "name": "Merkez" }] },
            { "id": "65", "name": "Van", "districts": [{ "id": "6501", "name": "İpekyolu" }, { "id": "6502", "name": "Tuşba" }] },
            { "id": "66", "name": "Yozgat", "districts": [{ "id": "6601", "name": "Merkez" }] },
            { "id": "67", "name": "Zonguldak", "districts": [{ "id": "6701", "name": "Merkez" }] },
            { "id": "68", "name": "Aksaray", "districts": [{ "id": "6801", "name": "Merkez" }] },
            { "id": "69", "name": "Bayburt", "districts": [{ "id": "6901", "name": "Merkez" }] },
            { "id": "70", "name": "Karaman", "districts": [{ "id": "7001", "name": "Merkez" }] },
            { "id": "71", "name": "Kırıkkale", "districts": [{ "id": "7101", "name": "Merkez" }] },
            { "id": "72", "name": "Batman", "districts": [{ "id": "7201", "name": "Merkez" }] },
            { "id": "73", "name": "Şırnak", "districts": [{ "id": "7301", "name": "Merkez" }, { "id": "7302", "name": "Cizre" }] },
            { "id": "74", "name": "Bartın", "districts": [{ "id": "7401", "name": "Merkez" }] },
            { "id": "75", "name": "Ardahan", "districts": [{ "id": "7501", "name": "Merkez" }] },
            { "id": "76", "name": "Iğdır", "districts": [{ "id": "7601", "name": "Merkez" }] },
            { "id": "77", "name": "Yalova", "districts": [{ "id": "7701", "name": "Merkez" }] },
            { "id": "78", "name": "Karabük", "districts": [{ "id": "7801", "name": "Merkez" }, { "id": "7802", "name": "Safranbolu" }] },
            { "id": "79", "name": "Kilis", "districts": [{ "id": "7901", "name": "Merkez" }] },
            { "id": "80", "name": "Osmaniye", "districts": [{ "id": "8001", "name": "Merkez" }, { "id": "8002", "name": "Kadirli" }] },
            { "id": "81", "name": "Düzce", "districts": [{ "id": "8101", "name": "Merkez" }, { "id": "8102", "name": "Akçakoca" }] }
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

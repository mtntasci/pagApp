import SwiftUI

public struct BasicProfileView: View {
    @StateObject private var service = BasicProfileService.shared
    @Environment(\.presentationMode) private var presentationMode
    
    @State private var draftProfile: PAGBasicProfile = PAGBasicProfile()
    
    public init() {}
    
    public var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header Progress Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Temel Profil Tamamlanma")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                            Text("%\(draftProfile.completionPercentage)")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 0.72, green: 0.95, blue: 0.29))
                        }
                        
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color.white.opacity(0.1))
                                    .frame(height: 10)
                                
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color(red: 0.72, green: 0.95, blue: 0.29))
                                    .frame(width: geo.size.width * CGFloat(draftProfile.completionPercentage) / 100.0, height: 10)
                            }
                        }
                        .frame(height: 10)
                        
                        if draftProfile.scoreAwarded {
                            Text("✓ 100 Profil Puanı Kazanıldı")
                                .font(.caption)
                                .foregroundColor(Color(red: 0.72, green: 0.95, blue: 0.29))
                        } else {
                            Text("Profilinizi %100 tamamlayın, +100 Profil Puanı kazanın!")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(20)
                    .background(Color(red: 0.04, green: 0.11, blue: 0.27))
                    .cornerRadius(16)
                    
                    // 1. Birth Details
                    VStack(alignment: .leading, spacing: 16) {
                        Text("1. Doğum Bilgileri")
                            .font(.headline)
                            .foregroundColor(Color(red: 0.72, green: 0.95, blue: 0.29))
                        
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Doğum Tarihi")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            TextField("YYYY-MM-DD", text: $draftProfile.birthDetails.birthDate)
                                .padding(12)
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(8)
                                .foregroundColor(.white)
                        }
                        
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Doğum Yeri (İl)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Picker("İl Seçin", selection: $draftProfile.birthDetails.cityId) {
                                Text("Seçiniz").tag("")
                                ForEach(service.locations) { city in
                                    Text(city.name).tag(city.id)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                            .padding(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(8)
                            .onChange(of: draftProfile.birthDetails.cityId) { newCityId in
                                if let c = service.locations.first(where: { $0.id == newCityId }) {
                                    draftProfile.birthDetails.cityName = c.name
                                }
                                draftProfile.birthDetails.districtId = ""
                                draftProfile.birthDetails.districtName = ""
                            }
                        }
                        
                        if !draftProfile.birthDetails.cityId.isEmpty {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Doğum Yeri (İlçe)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                let currentDistricts = service.locations.first(where: { $0.id == draftProfile.birthDetails.cityId })?.districts ?? []
                                Picker("İlçe Seçin", selection: $draftProfile.birthDetails.districtId) {
                                    Text("Seçiniz").tag("")
                                    ForEach(currentDistricts) { district in
                                        Text(district.name).tag(district.id)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .padding(8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(8)
                                .onChange(of: draftProfile.birthDetails.districtId) { newDistId in
                                    let currentDistricts = service.locations.first(where: { $0.id == draftProfile.birthDetails.cityId })?.districts ?? []
                                    if let d = currentDistricts.first(where: { $0.id == newDistId }) {
                                        draftProfile.birthDetails.districtName = d.name
                                    }
                                }
                            }
                        }
                    }
                    .padding(20)
                    .background(Color(red: 0.04, green: 0.11, blue: 0.27))
                    .cornerRadius(16)
                    
                    // 2. Marital Status
                    VStack(alignment: .leading, spacing: 16) {
                        Text("2. Medeni Durum")
                            .font(.headline)
                            .foregroundColor(Color(red: 0.72, green: 0.95, blue: 0.29))
                        
                        Picker("Medeni Durum", selection: $draftProfile.maritalStatus) {
                            Text("Seçiniz").tag("")
                            Text("Bekar").tag("SINGLE")
                            Text("Evli").tag("MARRIED")
                            Text("Boşanmış").tag("DIVORCED")
                            Text("Dul").tag("WIDOWED")
                            Text("Diğer").tag("OTHER")
                        }
                        .pickerStyle(SegmentedPickerStyle())
                    }
                    .padding(20)
                    .background(Color(red: 0.04, green: 0.11, blue: 0.27))
                    .cornerRadius(16)
                    
                    // 3. Children Info
                    VStack(alignment: .leading, spacing: 16) {
                        Text("3. Çocuk Bilgileri")
                            .font(.headline)
                            .foregroundColor(Color(red: 0.72, green: 0.95, blue: 0.29))
                        
                        Toggle("Çocuğunuz Var Mı?", isOn: $draftProfile.childrenInfo.hasChildren)
                            .foregroundColor(.white)
                            .onChange(of: draftProfile.childrenInfo.hasChildren) { hasChild in
                                if !hasChild {
                                    draftProfile.childrenInfo.childrenCount = 0
                                    draftProfile.childrenInfo.children = []
                                } else if draftProfile.childrenInfo.childrenCount == 0 {
                                    draftProfile.childrenInfo.childrenCount = 1
                                    draftProfile.childrenInfo.children = [PAGChildInfo()]
                                }
                            }
                        
                        if draftProfile.childrenInfo.hasChildren {
                            Stepper("Çocuk Sayısı: \(draftProfile.childrenInfo.childrenCount)", value: $draftProfile.childrenInfo.childrenCount, in: 1...10)
                                .foregroundColor(.white)
                                .onChange(of: draftProfile.childrenInfo.childrenCount) { newCount in
                                    while draftProfile.childrenInfo.children.count < newCount {
                                        draftProfile.childrenInfo.children.append(PAGChildInfo())
                                    }
                                    while draftProfile.childrenInfo.children.count > newCount {
                                        draftProfile.childrenInfo.children.removeLast()
                                    }
                                }
                            
                            ForEach(0..<draftProfile.childrenInfo.children.count, id: \.self) { idx in
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("\(idx + 1). Çocuk")
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                    
                                    Picker("Cinsiyet", selection: $draftProfile.childrenInfo.children[idx].gender) {
                                        Text("Erkek").tag("MALE")
                                        Text("Kız").tag("FEMALE")
                                    }
                                    .pickerStyle(SegmentedPickerStyle())
                                    
                                    TextField("Doğum Tarihi (YYYY-MM-DD)", text: $draftProfile.childrenInfo.children[idx].birthDate)
                                        .padding(10)
                                        .background(Color.white.opacity(0.05))
                                        .cornerRadius(8)
                                        .foregroundColor(.white)
                                }
                                .padding(12)
                                .background(Color.white.opacity(0.03))
                                .cornerRadius(10)
                            }
                        }
                    }
                    .padding(20)
                    .background(Color(red: 0.04, green: 0.11, blue: 0.27))
                    .cornerRadius(16)
                    
                    // 4. Residence Address (İl -> İlçe -> Mahalle)
                    VStack(alignment: .leading, spacing: 16) {
                        Text("4. İkametgah Adresi")
                            .font(.headline)
                            .foregroundColor(Color(red: 0.72, green: 0.95, blue: 0.29))
                        
                        VStack(alignment: .leading, spacing: 6) {
                            Text("İl")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Picker("İl Seçin", selection: $draftProfile.residenceAddress.cityId) {
                                Text("Seçiniz").tag("")
                                ForEach(service.locations) { city in
                                    Text(city.name).tag(city.id)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                            .padding(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(8)
                            .onChange(of: draftProfile.residenceAddress.cityId) { newCityId in
                                if let c = service.locations.first(where: { $0.id == newCityId }) {
                                    draftProfile.residenceAddress.cityName = c.name
                                }
                                draftProfile.residenceAddress.districtId = ""
                                draftProfile.residenceAddress.districtName = ""
                                draftProfile.residenceAddress.neighborhoodId = nil
                                draftProfile.residenceAddress.neighborhoodName = nil
                            }
                        }
                        
                        if !draftProfile.residenceAddress.cityId.isEmpty {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("İlçe")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                let districts = service.locations.first(where: { $0.id == draftProfile.residenceAddress.cityId })?.districts ?? []
                                Picker("İlçe Seçin", selection: $draftProfile.residenceAddress.districtId) {
                                    Text("Seçiniz").tag("")
                                    ForEach(districts) { district in
                                        Text(district.name).tag(district.id)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .padding(8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(8)
                                .onChange(of: draftProfile.residenceAddress.districtId) { newDistId in
                                    let districts = service.locations.first(where: { $0.id == draftProfile.residenceAddress.cityId })?.districts ?? []
                                    if let d = districts.first(where: { $0.id == newDistId }) {
                                        draftProfile.residenceAddress.districtName = d.name
                                    }
                                    draftProfile.residenceAddress.neighborhoodId = nil
                                    draftProfile.residenceAddress.neighborhoodName = nil
                                }
                            }
                        }
                        
                        if !draftProfile.residenceAddress.districtId.isEmpty {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Mahalle")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                let districts = service.locations.first(where: { $0.id == draftProfile.residenceAddress.cityId })?.districts ?? []
                                let neighborhoods = districts.first(where: { $0.id == draftProfile.residenceAddress.districtId })?.neighborhoods ?? []
                                
                                Picker("Mahalle Seçin", selection: Binding(
                                    get: { draftProfile.residenceAddress.neighborhoodId ?? "" },
                                    set: { draftProfile.residenceAddress.neighborhoodId = $0.isEmpty ? nil : $0 }
                                )) {
                                    Text("Seçiniz").tag("")
                                    ForEach(neighborhoods) { nh in
                                        Text(nh.name).tag(nh.id)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .padding(8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(8)
                                .onChange(of: draftProfile.residenceAddress.neighborhoodId) { newNhId in
                                    let districts = service.locations.first(where: { $0.id == draftProfile.residenceAddress.cityId })?.districts ?? []
                                    let neighborhoods = districts.first(where: { $0.id == draftProfile.residenceAddress.districtId })?.neighborhoods ?? []
                                    if let nh = neighborhoods.first(where: { $0.id == newNhId }) {
                                        draftProfile.residenceAddress.neighborhoodName = nh.name
                                    }
                                }
                            }
                        }
                    }
                    .padding(20)
                    .background(Color(red: 0.04, green: 0.11, blue: 0.27))
                    .cornerRadius(16)
                    
                    // 5. Hometown (Memleket)
                    VStack(alignment: .leading, spacing: 16) {
                        Text("5. Memleket")
                            .font(.headline)
                            .foregroundColor(Color(red: 0.72, green: 0.95, blue: 0.29))
                        
                        VStack(alignment: .leading, spacing: 6) {
                            Text("İl")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Picker("İl Seçin", selection: $draftProfile.hometown.cityId) {
                                Text("Seçiniz").tag("")
                                ForEach(service.locations) { city in
                                    Text(city.name).tag(city.id)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                            .padding(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(8)
                            .onChange(of: draftProfile.hometown.cityId) { newCityId in
                                if let c = service.locations.first(where: { $0.id == newCityId }) {
                                    draftProfile.hometown.cityName = c.name
                                }
                                draftProfile.hometown.districtId = ""
                                draftProfile.hometown.districtName = ""
                            }
                        }
                        
                        if !draftProfile.hometown.cityId.isEmpty {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("İlçe")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                let districts = service.locations.first(where: { $0.id == draftProfile.hometown.cityId })?.districts ?? []
                                Picker("İlçe Seçin", selection: $draftProfile.hometown.districtId) {
                                    Text("Seçiniz").tag("")
                                    ForEach(districts) { district in
                                        Text(district.name).tag(district.id)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .padding(8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(8)
                                .onChange(of: draftProfile.hometown.districtId) { newDistId in
                                    let districts = service.locations.first(where: { $0.id == draftProfile.hometown.cityId })?.districts ?? []
                                    if let d = districts.first(where: { $0.id == newDistId }) {
                                        draftProfile.hometown.districtName = d.name
                                    }
                                }
                            }
                        }
                    }
                    .padding(20)
                    .background(Color(red: 0.04, green: 0.11, blue: 0.27))
                    .cornerRadius(16)
                    
                    // Save Button
                    Button(action: {
                        Task {
                            let ok = await service.saveBasicProfile(profile: draftProfile)
                            if ok {
                                draftProfile = service.basicProfile
                            }
                        }
                    }) {
                        if service.isSaving {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .black))
                        } else {
                            Text("Temel Profili Kaydet")
                                .font(.headline)
                                .foregroundColor(Color(red: 0.01, green: 0.06, blue: 0.20))
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .background(Color(red: 0.72, green: 0.95, blue: 0.29))
                                .cornerRadius(12)
                        }
                    }
                    .disabled(service.isSaving)
                }
                .padding(20)
            }
            .background(Color(red: 0.01, green: 0.06, blue: 0.20).ignoresSafeArea())
            .navigationTitle("Temel Profil")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                Task {
                    await service.fetchBasicProfile()
                    draftProfile = service.basicProfile
                }
            }
        }
    }
}

#Preview {
    BasicProfileView()
}

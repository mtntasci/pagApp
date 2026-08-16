import SwiftUI

public struct BasicProfileView: View {
    @StateObject private var service = BasicProfileService.shared
    @Environment(\.presentationMode) private var presentationMode
    
    @State private var currentStep: Int = 1 // 1..5
    @State private var draftProfile: PAGBasicProfile = PAGBasicProfile()
    
    // Sheet states for date pickers
    @State private var showBirthDatePicker: Bool = false
    @State private var selectedBirthDate: Date = Date()
    
    @State private var activeChildIndexForPicker: Int? = nil
    @State private var selectedChildBirthDate: Date = Date()
    
    @State private var inlineErrorMessage: String? = nil
    
    public init() {}
    
    // Turkish Date Formatter helper
    private func formatTurkishDate(_ dateStr: String) -> String {
        guard !dateStr.isEmpty else { return "Tarih Seçiniz" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        if let d = formatter.date(from: dateStr) {
            let trFormatter = DateFormatter()
            trFormatter.locale = Locale(identifier: "tr_TR")
            trFormatter.dateFormat = "d MMMM yyyy"
            return trFormatter.string(from: d)
        }
        return dateStr
    }
    
    private func dateFromString(_ dateStr: String) -> Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: dateStr) ?? Date()
    }
    
    private func stringFromDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Top Motivation & Step Progress Indicator
                VStack(spacing: 12) {
                    if !draftProfile.scoreAwarded {
                        HStack {
                            Image(systemName: "bolt.fill")
                                .foregroundColor(PAGTheme.brandLime)
                            Text("Temel profilini tamamla, +100 Profil Puanı kazan!")
                                .font(PAGTypography.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(PAGTheme.brandLime)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(PAGTheme.brandLime.opacity(0.12))
                        .cornerRadius(20)
                    }
                    
                    // Step Dots & Counter
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Adım \(currentStep) / 5")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)
                            
                            Text(stepTitle(currentStep))
                                .font(PAGTypography.heading)
                                .foregroundColor(PAGTheme.textPrimary)
                        }
                        
                        Spacer()
                        
                        // 5 Step Dots Indicator
                        HStack(spacing: 6) {
                            ForEach(1...5, id: \.self) { idx in
                                Circle()
                                    .fill(idx <= currentStep ? PAGTheme.brandLime : Color.white.opacity(0.2))
                                    .frame(width: 8, height: 8)
                            }
                        }
                    }
                    .padding(.horizontal, PAGSpacing.md)
                }
                .padding(.top, 16)
                .padding(.bottom, 16)
                .background(PAGTheme.surfacePrimary)
                
                Divider().background(PAGTheme.borderDefault)
                
                // Step Content Area
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        if let err = inlineErrorMessage {
                            Text(err)
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.error)
                                .padding(12)
                                .background(PAGTheme.error.opacity(0.15))
                                .cornerRadius(8)
                        }
                        
                        switch currentStep {
                        case 1:
                            step1BirthDetailsView
                        case 2:
                            step2MaritalStatusView
                        case 3:
                            step3ChildrenInfoView
                        case 4:
                            step4ResidenceAddressView
                        case 5:
                            step5HometownView
                        default:
                            EmptyView()
                        }
                    }
                    .padding(PAGSpacing.md)
                }
                
                Spacer()
                
                // Bottom Action Controls (Safe Area Aware)
                VStack(spacing: 0) {
                    Divider().background(PAGTheme.borderDefault)
                    
                    HStack(spacing: 12) {
                        if currentStep > 1 {
                            Button(action: {
                                inlineErrorMessage = nil
                                currentStep -= 1
                            }) {
                                Text("Geri")
                                    .font(PAGTypography.heading)
                                    .foregroundColor(PAGTheme.textPrimary)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                                    .background(PAGTheme.surfacePrimary)
                                    .cornerRadius(PAGRadius.medium)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: PAGRadius.medium)
                                            .stroke(PAGTheme.borderDefault, lineWidth: 1)
                                    )
                            }
                        }
                        
                        Button(action: {
                            handleNextOrSave()
                        }) {
                            if service.isSaving {
                                ProgressView().progressViewStyle(CircularProgressViewStyle(tint: PAGTheme.brandMidnight))
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                                    .background(PAGTheme.brandLime)
                                    .cornerRadius(PAGRadius.medium)
                            } else {
                                Text(currentStep == 5 ? "Temel Profili Kaydet" : "Devam Et")
                                    .font(PAGTypography.heading)
                                    .foregroundColor(PAGTheme.brandMidnight)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                                    .background(PAGTheme.brandLime)
                                    .cornerRadius(PAGRadius.medium)
                            }
                        }
                        .disabled(service.isSaving)
                    }
                    .padding(.horizontal, PAGSpacing.md)
                    .padding(.vertical, 12)
                    .background(PAGTheme.surfacePrimary)
                }
            }
        }
        .navigationTitle("Temel Profil Düzenle")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onAppear {
            Task {
                await service.fetchBasicProfile()
                draftProfile = service.basicProfile
                if let d = draftProfile.birthDetails.birthDate.isEmpty ? nil : dateFromString(draftProfile.birthDetails.birthDate) {
                    selectedBirthDate = d
                }
            }
        }
        // Birth Date Sheet Picker
        .sheet(isPresented: $showBirthDatePicker) {
            VStack {
                HStack {
                    Spacer()
                    Button("Tamam") {
                        draftProfile.birthDetails.birthDate = stringFromDate(selectedBirthDate)
                        showBirthDatePicker = false
                    }
                    .font(PAGTypography.heading)
                    .foregroundColor(PAGTheme.brandLime)
                }
                .padding()
                
                DatePicker("Doğum Tarihi", selection: $selectedBirthDate, displayedComponents: .date)
                    .datePickerStyle(WheelDatePickerStyle())
                    .labelsHidden()
                    .environment(\.locale, Locale(identifier: "tr_TR"))
                
                Spacer()
            }
            .presentationDetents([.height(300)])
            .background(PAGTheme.backgroundPrimary)
        }
        // Child Birth Date Sheet Picker
        .sheet(isPresented: Binding(
            get: { activeChildIndexForPicker != nil },
            set: { if !$0 { activeChildIndexForPicker = nil } }
        )) {
            VStack {
                HStack {
                    Spacer()
                    Button("Tamam") {
                        if let idx = activeChildIndexForPicker, idx < draftProfile.childrenInfo.children.count {
                            draftProfile.childrenInfo.children[idx].birthDate = stringFromDate(selectedChildBirthDate)
                        }
                        activeChildIndexForPicker = nil
                    }
                    .font(PAGTypography.heading)
                    .foregroundColor(PAGTheme.brandLime)
                }
                .padding()
                
                DatePicker("Çocuk Doğum Tarihi", selection: $selectedChildBirthDate, in: ...Date(), displayedComponents: .date)
                    .datePickerStyle(WheelDatePickerStyle())
                    .labelsHidden()
                    .environment(\.locale, Locale(identifier: "tr_TR"))
                
                Spacer()
            }
            .presentationDetents([.height(300)])
            .background(PAGTheme.backgroundPrimary)
        }
    }
    
    private func stepTitle(_ step: Int) -> String {
        switch step {
        case 1: return "Doğum Bilgileri"
        case 2: return "Medeni Durum"
        case 3: return "Çocuk Bilgileri"
        case 4: return "İkametgah Adresi"
        case 5: return "Memleket Bilgisi"
        default: return ""
        }
    }
    
    private func handleNextOrSave() {
        inlineErrorMessage = nil
        
        // Validation per step
        if currentStep == 1 {
            if draftProfile.firstName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                inlineErrorMessage = "Lütfen adınızı giriniz."
                return
            }
            if draftProfile.lastName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                inlineErrorMessage = "Lütfen soyadınızı giriniz."
                return
            }
            if draftProfile.birthDetails.birthDate.isEmpty {
                inlineErrorMessage = "Lütfen doğum tarihinizi seçiniz."
                return
            }
            let birthDate = dateFromString(draftProfile.birthDetails.birthDate)
            let age = Calendar.current.dateComponents([.year], from: birthDate, to: Date()).year ?? 0
            if age < 18 {
                inlineErrorMessage = "PAG yalnızca 18 yaş ve üzeri bireyler içindir."
                return
            }
            if draftProfile.birthDetails.cityId.isEmpty {
                inlineErrorMessage = "Lütfen doğum yeri ilini seçiniz."
                return
            }
            if draftProfile.birthDetails.districtId.isEmpty {
                inlineErrorMessage = "Lütfen doğum yeri ilçesini seçiniz."
                return
            }
        } else if currentStep == 2 {
            if draftProfile.maritalStatus.isEmpty {
                inlineErrorMessage = "Lütfen medeni durumunuzu seçiniz."
                return
            }
        } else if currentStep == 3 {
            if draftProfile.childrenInfo.hasChildren && draftProfile.childrenInfo.children.isEmpty {
                inlineErrorMessage = "Lütfen çocuk detaylarını doldurunuz."
                return
            }
        } else if currentStep == 4 {
            if draftProfile.residenceAddress.cityId.isEmpty || draftProfile.residenceAddress.districtId.isEmpty || (draftProfile.residenceAddress.neighborhoodId ?? "").isEmpty {
                inlineErrorMessage = "Lütfen ikametgah il, ilçe ve mahalle seçiniz."
                return
            }
        } else if currentStep == 5 {
            if draftProfile.hometown.cityId.isEmpty || draftProfile.hometown.districtId.isEmpty {
                inlineErrorMessage = "Lütfen memleket il ve ilçesini seçiniz."
                return
            }
            
            // Final Save
            Task {
                let success = await service.saveBasicProfile(profile: draftProfile)
                if success {
                    presentationMode.wrappedValue.dismiss()
                }
            }
            return
        }
        
        currentStep += 1
    }
    // --------------------------------------------------
    // STEP 1: DOĞUM BİLGİLERİ VIEW
    // --------------------------------------------------
    @ViewBuilder
    private var step1BirthDetailsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Adınız *")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                TextField("Adınız", text: $draftProfile.firstName)
                    .font(PAGTypography.body)
                    .foregroundColor(PAGTheme.textPrimary)
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Soyadınız *")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                TextField("Soyadınız", text: $draftProfile.lastName)
                    .font(PAGTypography.body)
                    .foregroundColor(PAGTheme.textPrimary)
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
            }

            // Cinsiyet Seçimi
            VStack(alignment: .leading, spacing: 8) {
                Text("Cinsiyetiniz")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                let genderOptions: [(code: String, label: String)] = [
                    ("MALE", "Erkek"),
                    ("FEMALE", "Kadın"),
                    ("PREFER_NOT_TO_SAY", "Belirtmek İstemiyorum")
                ]
                
                HStack(spacing: 8) {
                    ForEach(genderOptions, id: \.code) { opt in
                        Button(action: {
                            draftProfile.gender = opt.code
                        }) {
                            Text(opt.label)
                                .font(PAGTypography.caption)
                                .fontWeight(.semibold)
                                .padding(.vertical, 10)
                                .padding(.horizontal, 8)
                                .frame(maxWidth: .infinity)
                                .background(draftProfile.gender == opt.code ? PAGTheme.brandLime : PAGTheme.surfacePrimary)
                                .foregroundColor(draftProfile.gender == opt.code ? PAGTheme.brandMidnight : PAGTheme.textPrimary)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(draftProfile.gender == opt.code ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: 1)
                                )
                        }
                    }
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Doğum Tarihi")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                Button(action: { showBirthDatePicker = true }) {
                    HStack {
                        Text(formatTurkishDate(draftProfile.birthDetails.birthDate))
                            .font(PAGTypography.body)
                            .foregroundColor(draftProfile.birthDetails.birthDate.isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                        Spacer()
                        Image(systemName: "calendar")
                            .foregroundColor(PAGTheme.brandLime)
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Doğum Yeri (İl)")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                Menu {
                    ForEach(service.locations) { city in
                        Button(city.name) {
                            draftProfile.birthDetails.cityId = city.id
                            draftProfile.birthDetails.cityName = city.name
                            draftProfile.birthDetails.districtId = ""
                            draftProfile.birthDetails.districtName = ""
                        }
                    }
                } label: {
                    HStack {
                        Text(draftProfile.birthDetails.cityName.isEmpty ? "İl Seçiniz" : draftProfile.birthDetails.cityName)
                            .font(PAGTypography.body)
                            .foregroundColor(draftProfile.birthDetails.cityName.isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundColor(PAGTheme.textMuted)
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Doğum Yeri (İlçe)")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                let currentDistricts = service.locations.first(where: { $0.id == draftProfile.birthDetails.cityId })?.districts ?? []
                
                Menu {
                    ForEach(currentDistricts) { district in
                        Button(district.name) {
                            draftProfile.birthDetails.districtId = district.id
                            draftProfile.birthDetails.districtName = district.name
                        }
                    }
                } label: {
                    HStack {
                        Text(draftProfile.birthDetails.districtName.isEmpty ? "İlçe Seçiniz" : draftProfile.birthDetails.districtName)
                            .font(PAGTypography.body)
                            .foregroundColor(draftProfile.birthDetails.districtName.isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundColor(PAGTheme.textMuted)
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                }
                .disabled(draftProfile.birthDetails.cityId.isEmpty)
                .opacity(draftProfile.birthDetails.cityId.isEmpty ? 0.5 : 1.0)
            }
        }
    }
    
    // --------------------------------------------------
    // STEP 2: MEDENİ DURUM VIEW
    // --------------------------------------------------
    @ViewBuilder
    private var step2MaritalStatusView: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Medeni durumunuzu seçiniz:")
                .font(PAGTypography.bodyLarge)
                .foregroundColor(PAGTheme.textMuted)
            
            let options: [(code: String, label: String)] = [
                ("MARRIED", "Evli"),
                ("SINGLE", "Bekar"),
                ("PREFER_NOT_TO_SAY", "Belirtmek İstemiyorum")
            ]
            
            ForEach(options, id: \.code) { opt in
                Button(action: {
                    draftProfile.maritalStatus = opt.code
                }) {
                    HStack {
                        Image(systemName: draftProfile.maritalStatus == opt.code ? "largecircle.fill.circle" : "circle")
                            .foregroundColor(draftProfile.maritalStatus == opt.code ? PAGTheme.brandLime : PAGTheme.textMuted)
                            .font(.system(size: 20))
                        
                        Text(opt.label)
                            .font(PAGTypography.bodyLarge)
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        Spacer()
                    }
                    .padding(16)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(
                        RoundedRectangle(cornerRadius: PAGRadius.medium)
                            .stroke(draftProfile.maritalStatus == opt.code ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: draftProfile.maritalStatus == opt.code ? 2 : 1)
                    )
                }
            }
        }
    }
    
    // --------------------------------------------------
    // STEP 3: ÇOCUK BİLGİLERİ VIEW
    // --------------------------------------------------
    @ViewBuilder
    private var step3ChildrenInfoView: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Çocuğunuz var mı?")
                .font(PAGTypography.bodyLarge)
                .foregroundColor(PAGTheme.textPrimary)
            
            HStack(spacing: 12) {
                Button(action: {
                    draftProfile.childrenInfo.hasChildren = true
                    if draftProfile.childrenInfo.childrenCount == 0 {
                        draftProfile.childrenInfo.childrenCount = 1
                        draftProfile.childrenInfo.children = [PAGChildInfo()]
                    }
                }) {
                    HStack {
                        Image(systemName: draftProfile.childrenInfo.hasChildren ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(draftProfile.childrenInfo.hasChildren ? PAGTheme.brandLime : PAGTheme.textMuted)
                        Text("Evet")
                            .font(PAGTypography.bodyLarge)
                            .foregroundColor(PAGTheme.textPrimary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(draftProfile.childrenInfo.hasChildren ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: 1.5))
                }
                
                Button(action: {
                    draftProfile.childrenInfo.hasChildren = false
                    draftProfile.childrenInfo.childrenCount = 0
                    draftProfile.childrenInfo.children = []
                }) {
                    HStack {
                        Image(systemName: !draftProfile.childrenInfo.hasChildren ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(!draftProfile.childrenInfo.hasChildren ? PAGTheme.brandLime : PAGTheme.textMuted)
                        Text("Hayır")
                            .font(PAGTypography.bodyLarge)
                            .foregroundColor(PAGTheme.textPrimary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(!draftProfile.childrenInfo.hasChildren ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: 1.5))
                }
            }
            
            if draftProfile.childrenInfo.hasChildren {
                Stepper("Çocuk Sayısı: \(draftProfile.childrenInfo.childrenCount)", value: $draftProfile.childrenInfo.childrenCount, in: 1...10)
                    .font(PAGTypography.heading)
                    .foregroundColor(PAGTheme.textPrimary)
                    .padding(12)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .onChange(of: draftProfile.childrenInfo.childrenCount) { newCount in
                        while draftProfile.childrenInfo.children.count < newCount {
                            draftProfile.childrenInfo.children.append(PAGChildInfo())
                        }
                        while draftProfile.childrenInfo.children.count > newCount {
                            draftProfile.childrenInfo.children.removeLast()
                        }
                    }
                
                ForEach(0..<draftProfile.childrenInfo.children.count, id: \.self) { idx in
                    VStack(alignment: .leading, spacing: 12) {
                        Text("\(idx + 1). Çocuk Bilgisi")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.brandLime)
                        
                        HStack {
                            Text("Cinsiyet:")
                                .font(PAGTypography.body)
                                .foregroundColor(PAGTheme.textMuted)
                            Spacer()
                            HStack(spacing: 8) {
                                Button("Erkek") {
                                    draftProfile.childrenInfo.children[idx].gender = "MALE"
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(draftProfile.childrenInfo.children[idx].gender == "MALE" ? PAGTheme.brandLime : PAGTheme.surfacePrimary)
                                .foregroundColor(draftProfile.childrenInfo.children[idx].gender == "MALE" ? PAGTheme.brandMidnight : PAGTheme.textPrimary)
                                .cornerRadius(6)
                                
                                Button("Kız") {
                                    draftProfile.childrenInfo.children[idx].gender = "FEMALE"
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(draftProfile.childrenInfo.children[idx].gender == "FEMALE" ? PAGTheme.brandLime : PAGTheme.surfacePrimary)
                                .foregroundColor(draftProfile.childrenInfo.children[idx].gender == "FEMALE" ? PAGTheme.brandMidnight : PAGTheme.textPrimary)
                                .cornerRadius(6)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Doğum Tarihi")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)
                            
                            Button(action: {
                                activeChildIndexForPicker = idx
                                let dStr = draftProfile.childrenInfo.children[idx].birthDate
                                selectedChildBirthDate = dateFromString(dStr)
                            }) {
                                HStack {
                                    Text(formatTurkishDate(draftProfile.childrenInfo.children[idx].birthDate))
                                        .font(PAGTypography.body)
                                        .foregroundColor(draftProfile.childrenInfo.children[idx].birthDate.isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                                    Spacer()
                                    Image(systemName: "calendar")
                                        .foregroundColor(PAGTheme.brandLime)
                                }
                                .padding(10)
                                .background(PAGTheme.backgroundPrimary)
                                .cornerRadius(6)
                                .overlay(RoundedRectangle(cornerRadius: 6).stroke(PAGTheme.borderDefault, lineWidth: 1))
                            }
                        }
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                }
            }
        }
    }
    
    // --------------------------------------------------
    // STEP 4: İKAMETGAH ADRESİ VIEW
    // --------------------------------------------------
    @ViewBuilder
    private var step4ResidenceAddressView: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 8) {
                Text("İl")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                Menu {
                    ForEach(service.locations) { city in
                        Button(city.name) {
                            draftProfile.residenceAddress.cityId = city.id
                            draftProfile.residenceAddress.cityName = city.name
                            draftProfile.residenceAddress.districtId = ""
                            draftProfile.residenceAddress.districtName = ""
                            draftProfile.residenceAddress.neighborhoodId = nil
                            draftProfile.residenceAddress.neighborhoodName = nil
                        }
                    }
                } label: {
                    HStack {
                        Text(draftProfile.residenceAddress.cityName.isEmpty ? "İl Seçiniz" : draftProfile.residenceAddress.cityName)
                            .font(PAGTypography.body)
                            .foregroundColor(draftProfile.residenceAddress.cityName.isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundColor(PAGTheme.textMuted)
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("İlçe")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                let districts = service.locations.first(where: { $0.id == draftProfile.residenceAddress.cityId })?.districts ?? []
                
                Menu {
                    ForEach(districts) { district in
                        Button(district.name) {
                            draftProfile.residenceAddress.districtId = district.id
                            draftProfile.residenceAddress.districtName = district.name
                            let nhList = district.neighborhoods ?? []
                            let firstNh = nhList.first ?? PAGNeighborhood(id: "\(district.id)01", name: "Merkez Mah.")
                            draftProfile.residenceAddress.neighborhoodId = firstNh.id
                            draftProfile.residenceAddress.neighborhoodName = firstNh.name
                        }
                    }
                } label: {
                    HStack {
                        Text(draftProfile.residenceAddress.districtName.isEmpty ? "İlçe Seçiniz" : draftProfile.residenceAddress.districtName)
                            .font(PAGTypography.body)
                            .foregroundColor(draftProfile.residenceAddress.districtName.isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundColor(PAGTheme.textMuted)
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                }
                .disabled(draftProfile.residenceAddress.cityId.isEmpty)
                .opacity(draftProfile.residenceAddress.cityId.isEmpty ? 0.5 : 1.0)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Mahalle")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                let districts = service.locations.first(where: { $0.id == draftProfile.residenceAddress.cityId })?.districts ?? []
                let rawNeighborhoods = districts.first(where: { $0.id == draftProfile.residenceAddress.districtId })?.neighborhoods ?? []
                let neighborhoods = rawNeighborhoods.isEmpty ? [PAGNeighborhood(id: "\(draftProfile.residenceAddress.districtId)01", name: "Merkez Mah.")] : rawNeighborhoods
                
                Menu {
                    ForEach(neighborhoods) { nh in
                        Button(nh.name) {
                            draftProfile.residenceAddress.neighborhoodId = nh.id
                            draftProfile.residenceAddress.neighborhoodName = nh.name
                        }
                    }
                } label: {
                    HStack {
                        Text(draftProfile.residenceAddress.neighborhoodName ?? "Mahalle Seçiniz")
                            .font(PAGTypography.body)
                            .foregroundColor((draftProfile.residenceAddress.neighborhoodName ?? "").isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundColor(PAGTheme.textMuted)
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                }
                .disabled(draftProfile.residenceAddress.districtId.isEmpty)
                .opacity(draftProfile.residenceAddress.districtId.isEmpty ? 0.5 : 1.0)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Açık Adres / Adres Detayı (İsteğe Bağlı)")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                TextField("Sokak, bina no, daire no vb. (Boş bırakabilirsiniz)", text: Binding(
                    get: { draftProfile.residenceAddress.fullAddress ?? "" },
                    set: { draftProfile.residenceAddress.fullAddress = $0 }
                ))
                .padding(14)
                .background(PAGTheme.surfacePrimary)
                .cornerRadius(PAGRadius.medium)
                .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                .foregroundColor(PAGTheme.textPrimary)
            }
        }
    }
    
    // --------------------------------------------------
    // STEP 5: MEMLEKET BİLGİSİ VIEW
    // --------------------------------------------------
    @ViewBuilder
    private var step5HometownView: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Memleket (İl)")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                Menu {
                    ForEach(service.locations) { city in
                        Button(city.name) {
                            draftProfile.hometown.cityId = city.id
                            draftProfile.hometown.cityName = city.name
                            draftProfile.hometown.districtId = ""
                            draftProfile.hometown.districtName = ""
                        }
                    }
                } label: {
                    HStack {
                        Text(draftProfile.hometown.cityName.isEmpty ? "İl Seçiniz" : draftProfile.hometown.cityName)
                            .font(PAGTypography.body)
                            .foregroundColor(draftProfile.hometown.cityName.isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundColor(PAGTheme.textMuted)
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Memleket (İlçe)")
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                
                let districts = service.locations.first(where: { $0.id == draftProfile.hometown.cityId })?.districts ?? []
                
                Menu {
                    ForEach(districts) { district in
                        Button(district.name) {
                            draftProfile.hometown.districtId = district.id
                            draftProfile.hometown.districtName = district.name
                        }
                    }
                } label: {
                    HStack {
                        Text(draftProfile.hometown.districtName.isEmpty ? "İlçe Seçiniz" : draftProfile.hometown.districtName)
                            .font(PAGTypography.body)
                            .foregroundColor(draftProfile.hometown.districtName.isEmpty ? PAGTheme.textMuted : PAGTheme.textPrimary)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .foregroundColor(PAGTheme.textMuted)
                    }
                    .padding(14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(PAGRadius.medium)
                    .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                }
                .disabled(draftProfile.hometown.cityId.isEmpty)
                .opacity(draftProfile.hometown.cityId.isEmpty ? 0.5 : 1.0)
            }
        }
    }
}

#Preview {
    BasicProfileView()
}

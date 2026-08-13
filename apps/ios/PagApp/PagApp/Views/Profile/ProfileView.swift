import SwiftUI
import FirebaseAuth

public struct ProfileView: View {
    @StateObject private var authService = AuthService.shared
    @StateObject private var userService = UserService.shared
    @StateObject private var basicProfileService = BasicProfileService.shared
    @StateObject private var profileSurveyService = ProfileSurveyService.shared
    @StateObject private var rewardService = RewardService.shared
    
    @State private var isPulsing: Bool = false
    @State private var showPhoneSheet: Bool = false
    @State private var showKycSheet: Bool = false
    @State private var showIbanSheet: Bool = false
    @State private var phoneInput: String = ""
    @State private var ibanInput: String = ""
    @State private var tcknInput: String = ""
    @State private var isSubmitting: Bool = false

    private var isIbanVerified: Bool {
        if let u = userService.currentUser {
            return u.ibanVerified || (u.iban != nil && !u.iban!.isEmpty)
        }
        return false
    }

    public init() {}

    private var isPhoneVerified: Bool {
        if let u = userService.currentUser {
            return u.phoneVerified
        }
        if let p = Auth.auth().currentUser?.phoneNumber, !p.isEmpty {
            return true
        }
        return false
    }

    private var isEmailVerified: Bool {
        if let u = userService.currentUser {
            return u.emailVerified
        }
        return Auth.auth().currentUser?.isEmailVerified ?? false
    }

    private var kycStatusText: String {
        let status = userService.currentUser?.kycStatus ?? "NOT_STARTED"
        switch status {
        case "VERIFIED":
            return "Doğrulandı"
        case "PENDING":
            return "İnceleniyor"
        default:
            return "Henüz doğrulanmadı"
        }
    }

    private var isKycVerified: Bool {
        return userService.currentUser?.kycStatus == "VERIFIED"
    }

    private var isBasicProfileComplete: Bool {
        return basicProfileService.basicProfile.completionPercentage == 100 || (userService.currentUser?.profileCompleted ?? false)
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                PAGTheme.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: PAGSpacing.xl) {

                        // Header with Google Profile Avatar Photo
                        VStack(spacing: PAGSpacing.sm) {
                            if let photoURL = authService.currentUser?.photoURL {
                                AsyncImage(url: photoURL) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image
                                            .resizable()
                                            .aspectRatio(contentMode: .fill)
                                    case .failure, .empty:
                                        Image(systemName: "person.crop.circle.fill")
                                            .resizable()
                                            .foregroundColor(PAGTheme.brandMidnight)
                                    @unknown default:
                                        Image(systemName: "person.crop.circle.fill")
                                            .resizable()
                                            .foregroundColor(PAGTheme.brandMidnight)
                                    }
                                }
                                .frame(width: 80, height: 80)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(PAGTheme.brandLime, lineWidth: 2))
                                .shadow(radius: 4)
                            } else {
                                Image(systemName: "person.crop.circle.fill")
                                    .resizable()
                                    .frame(width: 80, height: 80)
                                    .foregroundColor(PAGTheme.brandMidnight)
                            }

                            Text(authService.currentUser?.displayName ?? "PAG Kullanıcısı")
                                .font(PAGTypography.title)
                                .foregroundColor(PAGTheme.textPrimary)

                            Text(authService.currentUser?.email ?? "")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)

                            HStack(spacing: 8) {
                                PAGBadge(title: "Profile Score: \(userService.currentUser?.profileScore ?? 0)", iconName: "bolt.fill", style: .tag)
                                PAGBadge(title: "Bakiye: ₺\(rewardService.rewardBalance)", iconName: "banknote.fill", style: .tag)
                            }
                            .padding(.top, 4)
                        }
                        .padding(.top, PAGSpacing.lg)

                        // ==================================================
                        // DYNAMIC PROFILE BOX — NEW SCORE OPPORTUNITY
                        // ==================================================
                        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                            HStack {
                                Text("Profilini Güçlendir")
                                    .font(PAGTypography.heading)
                                    .foregroundColor(PAGTheme.textPrimary)
                                Spacer()
                                Image(systemName: "sparkles")
                                    .foregroundColor(PAGTheme.brandLime)
                            }

                            if profileSurveyService.availableScoreX > 0 {
                                // Dynamic Dynamic Title: "[X] Yeni Puan Avantajını Kaçırma"
                                HStack {
                                    Text("[\(profileSurveyService.availableScoreX)] Yeni Puan Avantajını Kaçırma")
                                        .font(PAGTypography.heading)
                                        .fontWeight(.bold)
                                        .foregroundColor(PAGTheme.brandMidnight)
                                    Spacer()
                                    Image(systemName: "arrow.up.right.circle.fill")
                                        .foregroundColor(PAGTheme.brandMidnight)
                                }
                                .padding(12)
                                .background(PAGTheme.brandLime)
                                .cornerRadius(PAGRadius.small)
                                .scaleEffect(isPulsing ? 1.02 : 1.0)
                                .animation(Animation.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: isPulsing)
                            } else {
                                Text("Ek sorulara yanıt vererek Profil Puanı kazanabileceğinizi biliyor musunuz?")
                                    .font(PAGTypography.body)
                                    .foregroundColor(PAGTheme.textPrimary)
                            }

                            Text("Profil sorularını yanıtladıkça sana daha uygun anketlere erişebilir ve Profil Puanı kazanabilirsin.")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)

                            if isBasicProfileComplete {
                                NavigationLink(destination: ProfileSurveysView()) {
                                    HStack {
                                        Text("Profil Sorularını Gör")
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.brandMidnight)
                                        Spacer()
                                        Image(systemName: "arrow.right")
                                            .foregroundColor(PAGTheme.brandMidnight)
                                    }
                                    .padding(.vertical, 12)
                                    .padding(.horizontal, 16)
                                    .background(PAGTheme.brandLime)
                                    .cornerRadius(PAGRadius.medium)
                                }
                                .padding(.top, 4)
                            } else {
                                HStack {
                                    Text("Temel profili %100 tamamladıktan sonra erişilebilir")
                                        .font(PAGTypography.caption)
                                        .foregroundColor(PAGTheme.textMuted)
                                    Spacer()
                                    Image(systemName: "lock.fill")
                                        .foregroundColor(PAGTheme.textMuted)
                                }
                                .padding(.vertical, 10)
                                .padding(.horizontal, 14)
                                .background(PAGTheme.surfacePrimary.opacity(0.6))
                                .cornerRadius(PAGRadius.medium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: PAGRadius.medium)
                                        .stroke(PAGTheme.borderDefault, lineWidth: 1)
                                )
                                .padding(.top, 4)
                            }
                        }
                        .padding()
                        .background(PAGTheme.surfacePrimary)
                        .cornerRadius(PAGRadius.medium)
                        .overlay(
                            RoundedRectangle(cornerRadius: PAGRadius.medium)
                                .stroke(profileSurveyService.availableScoreX > 0 ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: profileSurveyService.availableScoreX > 0 ? 2 : 1)
                        )
                        .padding(.horizontal, PAGSpacing.md)

                        // ==================================================
                        // DOĞRULA & KAZAN (VERIFICATIONS)
                        // ==================================================
                        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                            HStack {
                                Text("Doğrula & Kazan")
                                    .font(PAGTypography.heading)
                                    .foregroundColor(PAGTheme.textPrimary)
                                Spacer()
                                PAGBadge(title: "+900 Toplam PP", iconName: "star.fill", style: .profileScore)
                            }

                            Text("Profilinizi doğrulayarak öncelikli anketlere erişin ve ekstra Profil Puanı kazanın.")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)

                            // 1. Phone Verification (+200 PP)
                            Button(action: {
                                if !isPhoneVerified {
                                    phoneInput = userService.currentUser?.phone ?? ""
                                    showPhoneSheet = true
                                }
                            }) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("1. Telefon Doğrulaması")
                                            .font(PAGTypography.body)
                                            .fontWeight(.bold)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Text("+200 Profil Puanı Kazan")
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.brandLime)
                                    }
                                    Spacer()
                                    Text(isPhoneVerified ? "✅ Doğrulandı (+200 PP)" : "Doğrula →")
                                        .font(PAGTypography.caption)
                                        .fontWeight(.bold)
                                        .foregroundColor(isPhoneVerified ? PAGTheme.brandLime : PAGTheme.warning)
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                            }
                            .buttonStyle(PlainButtonStyle())
                             // 2. KYC Verification (+500 PP)
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("2. Kimlik Doğrulaması (KYC)")
                                        .font(PAGTypography.body)
                                        .fontWeight(.bold)
                                        .foregroundColor(PAGTheme.textPrimary)
                                    Text("+500 Profil Puanı Kazan")
                                        .font(PAGTypography.caption)
                                        .foregroundColor(PAGTheme.brandLime)
                                }
                                Spacer()
                                Text(isKycVerified ? "✅ Doğrulandı (+500 PP)" : "Yakında 🔒")
                                    .font(PAGTypography.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(isKycVerified ? PAGTheme.brandLime : PAGTheme.textMuted)
                            }
                            .padding()
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)

                            // 3. IBAN Verification (+200 PP)
                            Button(action: {
                                if !isIbanVerified {
                                    ibanInput = userService.currentUser?.iban ?? ""
                                    tcknInput = userService.currentUser?.tckn ?? ""
                                    showIbanSheet = true
                                }
                            }) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("3. IBAN Doğrulama")
                                            .font(PAGTypography.body)
                                            .fontWeight(.bold)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Text("+200 Profil Puanı Kazan")
                                            .font(PAGTypography.caption)
                                            .foregroundColor(PAGTheme.brandLime)
                                    }
                                    Spacer()
                                    Text(isIbanVerified ? "✅ Doğrulandı (+200 PP)" : "IBAN Doğrula →")
                                        .font(PAGTypography.caption)
                                        .fontWeight(.bold)
                                        .foregroundColor(isIbanVerified ? PAGTheme.brandLime : PAGTheme.warning)
                                }
                                .padding()
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                            }
                            .buttonStyle(PlainButtonStyle())
                            .disabled(isIbanVerified)
                        }
                        .padding(.horizontal, PAGSpacing.md)

                        // Basic Profile Box (Moves here right above sign out button after completion)
                        if isBasicProfileComplete {
                            VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                                HStack {
                                    Text("Temel Profil")
                                        .font(PAGTypography.heading)
                                        .foregroundColor(PAGTheme.textPrimary)
                                    Spacer()
                                    Text("%\(basicProfileService.basicProfile.completionPercentage) Tamamlandı")
                                        .font(PAGTypography.caption)
                                        .foregroundColor(PAGTheme.success)
                                }

                                Text("Demografik ve iletişim bilgilerinizi güncel tutabilirsiniz.")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(PAGTheme.textMuted)

                                NavigationLink(destination: BasicProfileView()) {
                                    HStack {
                                        Text("Temel Profili Düzenle")
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.brandMidnight)
                                        Spacer()
                                        Image(systemName: "arrow.right")
                                            .foregroundColor(PAGTheme.brandMidnight)
                                    }
                                    .padding(.vertical, 12)
                                    .padding(.horizontal, 16)
                                    .background(PAGTheme.brandLime)
                                    .cornerRadius(PAGRadius.medium)
                                }
                                .padding(.top, 4)
                            }
                            .padding()
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .padding(.horizontal, PAGSpacing.md)
                        }

                        // Sign Out & Account Buttons
                        VStack(spacing: 12) {
                            PAGButton(
                                title: "Çıkış Yap",
                                iconName: "rectangle.portrait.and.arrow.right",
                                style: .primary,
                                action: {
                                    authService.signOut()
                                }
                            )

                            PAGButton(
                                title: "Hesabımı ve Verilerimi Sil",
                                iconName: "trash.fill",
                                style: .secondary,
                                action: {}
                            )
                        }
                        .padding(.horizontal, PAGSpacing.md)

                        Spacer().frame(height: 40)
                    }
                }
            }
            .navigationTitle("Profil")
            .onAppear {
                Task {
                    await basicProfileService.fetchBasicProfile()
                    await profileSurveyService.fetchProfileQuestions(batchSize: 3)
                    await rewardService.fetchUserRewards()
                    isPulsing = true
                }
            }
            .sheet(isPresented: $showPhoneSheet) {
                PhoneVerificationSheetView(
                    phoneInput: $phoneInput,
                    isPresented: $showPhoneSheet,
                    onSuccess: {
                        Task {
                            await userService.bootstrapCurrentUser()
                        }
                    }
                )
            }
            .sheet(isPresented: $showKycSheet) {
                NavigationStack {
                    VStack(alignment: .leading, spacing: PAGSpacing.md) {
                        Text("Kimlik bilgilerinizi doğrulayarak nakit ödül çekim hakkı ve +500 Profil Puanı kazanın.")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)

                        Spacer()

                        PAGButton(title: "Doğrula & +500 PP Kazan", iconName: "person.badge.shield.checkmark.fill", style: .primary) {
                            Task {
                                isSubmitting = true
                                _ = await userService.submitKyc()
                                isSubmitting = false
                                showKycSheet = false
                            }
                        }
                    }
                    .padding()
                    .navigationTitle("KYC Doğrulama (+500 PP)")
                    .navigationBarTitleDisplayMode(.inline)
                }
            }
            .sheet(isPresented: $showIbanSheet) {
                NavigationStack {
                    VStack(alignment: .leading, spacing: PAGSpacing.md) {
                        Text("Nakit ödül transferleri için TC Kimlik No ve IBAN bilgilerinizi giriniz.")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)

                        TextField("TC Kimlik No (11 Hane)", text: $tcknInput)
                            .textFieldStyle(RoundedBorderTextFieldStyle())

                        TextField("IBAN (TR...)", text: $ibanInput)
                            .textFieldStyle(RoundedBorderTextFieldStyle())

                        Spacer()

                        PAGButton(title: "IBAN Doğrula & +200 PP Kazan", iconName: "creditcard.fill", style: .primary) {
                            Task {
                                isSubmitting = true
                                _ = await userService.submitIbanAndTckn(iban: ibanInput, tckn: tcknInput)
                                isSubmitting = false
                                showIbanSheet = false
                            }
                        }
                    }
                    .padding()
                    .navigationTitle("IBAN Doğrulama (+200 PP)")
                    .navigationBarTitleDisplayMode(.inline)
                }
            }
        }
    }
}

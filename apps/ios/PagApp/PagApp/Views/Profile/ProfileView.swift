import SwiftUI
import FirebaseAuth

public struct ProfileView: View {
    @StateObject private var authService = AuthService.shared
    @StateObject private var userService = UserService.shared
    @StateObject private var basicProfileService = BasicProfileService.shared
    @StateObject private var profileSurveyService = ProfileSurveyService.shared
    @StateObject private var rewardService = RewardService.shared
    
    @State private var isPulsing: Bool = false

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

                        // Verification Status Badges
                        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                            Text("Doğrulamalar")
                                .font(PAGTypography.heading)
                                .foregroundColor(PAGTheme.textPrimary)

                            HStack {
                                Image(systemName: isPhoneVerified ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                                    .foregroundColor(isPhoneVerified ? PAGTheme.success : PAGTheme.warning)
                                Text("Telefon Doğrulaması")
                                    .font(PAGTypography.body)
                                    .foregroundColor(PAGTheme.textPrimary)
                                Spacer()
                                Text(isPhoneVerified ? "Doğrulandı" : "Doğrulanmadı")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(isPhoneVerified ? PAGTheme.success : PAGTheme.warning)
                            }
                            .padding()
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)

                            HStack {
                                Image(systemName: isEmailVerified ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                                    .foregroundColor(isEmailVerified ? PAGTheme.success : PAGTheme.warning)
                                Text("E-Posta Doğrulaması")
                                    .font(PAGTypography.body)
                                    .foregroundColor(PAGTheme.textPrimary)
                                Spacer()
                                Text(isEmailVerified ? "Doğrulandı" : "Doğrulanmadı")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(isEmailVerified ? PAGTheme.success : PAGTheme.warning)
                            }
                            .padding()
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)

                            HStack {
                                Image(systemName: isKycVerified ? "checkmark.circle.fill" : "clock.fill")
                                    .foregroundColor(isKycVerified ? PAGTheme.success : PAGTheme.warning)
                                Text("Kimlik Doğrulaması (KYC)")
                                    .font(PAGTypography.body)
                                    .foregroundColor(PAGTheme.textPrimary)
                                Spacer()
                                Text(kycStatusText)
                                    .font(PAGTypography.caption)
                                    .foregroundColor(isKycVerified ? PAGTheme.success : PAGTheme.warning)
                            }
                            .padding()
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                        }
                        .padding(.horizontal, PAGSpacing.md)

                        // Basic Profile Box
                        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
                            HStack {
                                Text("Temel Profil")
                                    .font(PAGTypography.heading)
                                    .foregroundColor(PAGTheme.textPrimary)
                                Spacer()
                                Text("%\(basicProfileService.basicProfile.completionPercentage) Tamamlandı")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(isBasicProfileComplete ? PAGTheme.success : PAGTheme.warning)
                            }

                            Text("Demografik bilgilerinizi eksiksiz doldurarak Profil Puanı kazanın.")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textMuted)

                            NavigationLink(destination: BasicProfileView()) {
                                HStack {
                                    Text(isBasicProfileComplete ? "Temel Profili Düzenle" : "Temel Profili Tamamla")
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

                        // Sign Out Button
                        PAGButton(
                            title: "Çıkış Yap",
                            iconName: "rectangle.portrait.and.arrow.right",
                            style: .secondary,
                            action: {
                                authService.signOut()
                            }
                        )
                        .padding(.horizontal, PAGSpacing.md)

                        // Dark Red Passive Clear Data Button
                        PAGButton(
                            title: "Çıkış Yap ve Verilerimi Temizle",
                            iconName: "trash.fill",
                            style: .secondary,
                            action: {}
                        )
                        .disabled(true)
                        .opacity(0.6)
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
        }
    }
}

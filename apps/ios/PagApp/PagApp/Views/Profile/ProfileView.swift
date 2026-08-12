import SwiftUI

public struct ProfileView: View {
    @EnvironmentObject private var authService: AuthService
    @StateObject private var userService = UserService.shared
    @StateObject private var basicProfileService = BasicProfileService.shared

    public init() {}

    private var userDisplayName: String {
        if let name = userService.currentUser?.displayName, !name.isEmpty {
            return name
        }
        if let name = authService.currentUser?.displayName, !name.isEmpty {
            return name
        }
        if let email = userService.currentUser?.email ?? authService.currentUser?.email {
            return email
        }
        return "Kullanıcı"
    }

    private var userEmail: String? {
        return userService.currentUser?.email ?? authService.currentUser?.email
    }

    private var profileScore: Int {
        return userService.currentUser?.profileScore ?? 0
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
                                .frame(width: 84, height: 84)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(PAGTheme.brandLime, lineWidth: 2))
                            } else {
                                Image(systemName: "person.crop.circle.fill")
                                    .font(.system(size: 80))
                                    .foregroundColor(PAGTheme.brandMidnight)
                            }

                            Text(userDisplayName)
                                .font(PAGTypography.title)
                                .foregroundColor(PAGTheme.textPrimary)

                            if let email = userEmail, email != userDisplayName {
                                Text(email)
                                    .font(PAGTypography.caption)
                                    .foregroundColor(PAGTheme.textMuted)
                            }

                            PAGBadge(title: "\(profileScore) Profil Puanı", iconName: "bolt.fill", style: .profileScore)
                        }
                        .padding(.top, PAGSpacing.lg)

                        // 1. Temel Profil Navigation Link Card
                        NavigationLink(destination: BasicProfileView()) {
                            HStack(spacing: PAGSpacing.md) {
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack {
                                        Text("Temel Profil")
                                            .font(PAGTypography.heading)
                                            .foregroundColor(PAGTheme.textPrimary)
                                        Spacer()
                                        Text("%\(basicProfileService.basicProfile.completionPercentage) Tamamlandı")
                                            .font(PAGTypography.caption)
                                            .fontWeight(.bold)
                                            .foregroundColor(PAGTheme.brandLime)
                                    }
                                    Text("Doğum, medeni durum, çocuk ve adres bilgilerinizi yönetin.")
                                        .font(PAGTypography.caption)
                                        .foregroundColor(PAGTheme.textMuted)
                                        .multilineTextAlignment(.leading)
                                }
                                Image(systemName: "chevron.right")
                                    .foregroundColor(PAGTheme.textMuted)
                            }
                            .padding()
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .overlay(
                                RoundedRectangle(cornerRadius: PAGRadius.medium)
                                    .stroke(PAGTheme.brandLime.opacity(0.3), lineWidth: 1)
                            )
                        }
                        .padding(.horizontal, PAGSpacing.md)

                        // 2. Verifications (Doğrulamalar)
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Doğrulamalar")
                                .font(PAGTypography.title)
                                .foregroundColor(PAGTheme.textPrimary)
                                .padding(.horizontal, PAGSpacing.md)
                                .padding(.bottom, PAGSpacing.sm)

                            VStack(spacing: 0) {
                                VerificationRow(title: "Telefon", status: "Doğrulandı", isVerified: true, showDivider: true)
                                VerificationRow(title: "E-posta", status: authService.currentUser?.email != nil ? "Doğrulandı" : "Doğrulanmadı", isVerified: authService.currentUser?.email != nil, showDivider: true)
                                VerificationRow(title: "Kimlik / KYC", status: "Henüz yapılmadı", isVerified: false, showDivider: false)
                            }
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .padding(.horizontal, PAGSpacing.md)
                        }

                        // 3. Logout Button
                        Button(action: {
                            authService.signOut()
                        }) {
                            HStack {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                    .font(.system(size: 20))
                                Text("Çıkış Yap")
                                    .font(PAGTypography.heading)
                                Spacer()
                            }
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(PAGTheme.surfacePrimary)
                            .foregroundColor(PAGTheme.error)
                            .cornerRadius(PAGRadius.medium)
                            .overlay(
                                RoundedRectangle(cornerRadius: PAGRadius.medium)
                                    .stroke(PAGTheme.error.opacity(0.3), lineWidth: 1)
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
                }
            }
        }
    }
}

private struct VerificationRow: View {
    let title: String
    let status: String
    let isVerified: Bool
    let showDivider: Bool

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(title)
                    .font(PAGTypography.bodyLarge)
                    .foregroundColor(PAGTheme.textPrimary)
                Spacer()
                Text(status)
                    .font(PAGTypography.body)
                    .foregroundColor(isVerified ? PAGTheme.success : PAGTheme.textMuted)
                if !isVerified {
                    Image(systemName: "exclamationmark.circle")
                        .foregroundColor(PAGTheme.warning)
                }
            }
            .padding()

            if showDivider {
                Divider().background(PAGTheme.borderDefault)
                    .padding(.leading)
            }
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthService())
}

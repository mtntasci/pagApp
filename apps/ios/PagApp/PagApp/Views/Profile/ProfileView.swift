import SwiftUI

public struct ProfileView: View {
    @EnvironmentObject private var authService: AuthService
    @StateObject private var userService = UserService.shared
    @State private var notificationsEnabled = false

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

                        // Header
                        VStack(spacing: PAGSpacing.sm) {
                            Image(systemName: "person.crop.circle.fill")
                                .font(.system(size: 80))
                                .foregroundColor(PAGTheme.brandMidnight)

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

                        // Notification Permission UI
                        VStack(alignment: .leading, spacing: PAGSpacing.md) {
                            Toggle(isOn: $notificationsEnabled) {
                                Text("Bildirim İzinleri")
                                    .font(PAGTypography.heading)
                                    .foregroundColor(PAGTheme.textPrimary)
                            }
                            .tint(PAGTheme.brandLime)

                            if !notificationsEnabled {
                                Text("Bildirimler kapalıysa yeni ve yüksek ödüllü anketlerden zamanında haberdar olamayabilirsin.")
                                    .font(PAGTypography.caption)
                                    .foregroundColor(PAGTheme.textMuted)
                            }
                        }
                        .padding()
                        .background(PAGTheme.surfacePrimary)
                        .cornerRadius(PAGRadius.medium)
                        .padding(.horizontal, PAGSpacing.md)

                        // Verifications
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

                        // Logout Button
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

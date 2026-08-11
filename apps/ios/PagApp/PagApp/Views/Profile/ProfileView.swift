import SwiftUI

public struct ProfileView: View {
    @State private var notificationsEnabled = false
    
    public init() {}
    
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
                            
                            Text("Ali Yılmaz")
                                .font(PAGTypography.title)
                                .foregroundColor(PAGTheme.textPrimary)
                            
                            PAGBadge(title: "1.250 Profil Puanı", iconName: "bolt.fill", style: .profileScore)
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
                                VerificationRow(title: "E-posta", status: "Doğrulanmadı", isVerified: false, showDivider: true)
                                VerificationRow(title: "Kimlik / KYC", status: "Henüz yapılmadı", isVerified: false, showDivider: false)
                            }
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .padding(.horizontal, PAGSpacing.md)
                        }
                        
                        
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
}

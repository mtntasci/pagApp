import SwiftUI

public struct ProfileView: View {
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ZStack {
                PAGTheme.backgroundPrimary
                    .ignoresSafeArea()
                
                VStack(spacing: PAGSpacing.md) {
                    Image(systemName: "person.crop.circle.fill")
                        .font(.system(size: 64))
                        .foregroundColor(PAGTheme.brandMidnight)
                    
                    Text("Profilim")
                        .font(PAGTypography.title)
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    Text("Kullanıcı bilgilerin, demografik yanıtların ve hesap ayarların burada yönetilecek.")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, PAGSpacing.xl)
                }
            }
            .navigationTitle("Profil")
        }
    }
}

#Preview {
    ProfileView()
}

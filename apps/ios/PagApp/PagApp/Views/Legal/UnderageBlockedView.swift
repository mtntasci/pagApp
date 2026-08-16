import SwiftUI

public struct UnderageBlockedView: View {
    @EnvironmentObject private var authService: AuthService
    @StateObject private var userService = UserService.shared
    
    public init() {}
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                Spacer()
                
                // Icon
                ZStack {
                    Circle()
                        .fill(PAGTheme.brandOrange.opacity(0.15))
                        .frame(width: 96, height: 96)
                    
                    Image(systemName: "person.badge.shield.exclamationmark")
                        .font(.system(size: 44))
                        .foregroundColor(PAGTheme.brandOrange)
                }
                
                // Title & Description
                VStack(spacing: 12) {
                    Text("Yaş Uygunluğu Sınırı (18+)")
                        .font(.system(size: 24, weight: .black))
                        .foregroundColor(PAGTheme.textPrimary)
                        .multilineTextAlignment(.center)
                    
                    Text("PAG platformu ve anket araştırmaları yalnızca 18 yaşını doldurmuş yetişkin bireylere yöneliktir.")
                        .font(.system(size: 15))
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                        .lineSpacing(4)
                    
                    Text("Hesabınızda kayıtlı doğum tarihi bilgisi gereğince platform katılımınız durdurulmuştur. Bir hata olduğunu düşünüyorsanız info@alafteknoloji.com adresi üzerinden destek ekibimizle irtibata geçebilirsiniz.")
                        .font(.system(size: 13))
                        .foregroundColor(PAGTheme.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 28)
                        .padding(.top, 4)
                        .lineSpacing(3)
                }
                
                Spacer()
                
                // Sign Out Action Button
                Button(action: {
                    authService.signOut()
                    userService.clearUserSession()
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("Oturumu Kapat")
                            .font(.system(size: 16, weight: .bold))
                    }
                    .foregroundColor(PAGTheme.brandMidnight)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(PAGTheme.brandLime)
                    .cornerRadius(14)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
        }
    }
}

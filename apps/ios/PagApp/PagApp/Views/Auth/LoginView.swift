import SwiftUI

public struct LoginView: View {
    public let onLogin: () -> Void
    
    public init(onLogin: @escaping () -> Void) {
        self.onLogin = onLogin
    }
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            VStack(spacing: PAGSpacing.xl) {
                Spacer()
                
                // PAG Logo Top
                VStack(spacing: PAGSpacing.md) {
                    Image(systemName: "circle.hexagongrid.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 60, height: 60)
                        .foregroundColor(PAGTheme.brandLime)
                    
                    Text("PAG'a Hoş Geldiniz")
                        .font(PAGTypography.display)
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    Text("Anketlere katıl, Profil Puanı kazan ve ödüllerde öne geç.")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, PAGSpacing.lg)
                }
                
                Spacer()
                
                // Login Options
                VStack(spacing: PAGSpacing.md) {
                    // Google Button
                    Button(action: onLogin) {
                        HStack {
                            Image(systemName: "g.circle.fill")
                                .font(.system(size: 24))
                            Text("Google ile Devam Et")
                                .font(PAGTypography.heading)
                            Spacer()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(PAGTheme.surfacePrimary)
                        .foregroundColor(PAGTheme.textPrimary)
                        .cornerRadius(PAGRadius.medium)
                        .overlay(
                            RoundedRectangle(cornerRadius: PAGRadius.medium)
                                .stroke(PAGTheme.borderDefault, lineWidth: 1)
                        )
                    }
                    
                    // Apple Button
                    Button(action: onLogin) {
                        HStack {
                            Image(systemName: "applelogo")
                                .font(.system(size: 24))
                            Text("Apple ile Devam Et")
                                .font(PAGTypography.heading)
                            Spacer()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.black)
                        .foregroundColor(.white)
                        .cornerRadius(PAGRadius.medium)
                    }
                    
                    // Email Button
                    Button(action: onLogin) {
                        HStack {
                            Image(systemName: "envelope.fill")
                                .font(.system(size: 24))
                            Text("E-posta ile Devam Et")
                                .font(PAGTypography.heading)
                            Spacer()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(PAGTheme.brandBlue)
                        .foregroundColor(PAGTheme.textPrimary)
                        .cornerRadius(PAGRadius.medium)
                    }
                }
                .padding(.horizontal, PAGSpacing.lg)
                .padding(.bottom, PAGSpacing.xl)
            }
        }
    }
}

#Preview {
    LoginView(onLogin: {})
}

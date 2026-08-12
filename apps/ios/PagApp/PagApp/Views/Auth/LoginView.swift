import SwiftUI

public struct LoginView: View {
    @EnvironmentObject private var authService: AuthService
    @State private var showEmailComingSoonAlert = false
    @State private var showErrorAlert = false

    public init() {}

    public var body: some View {
        ZStack {
            PAGTheme.brandMidnight.ignoresSafeArea()

            VStack(spacing: PAGSpacing.xl) {
                Spacer()

                // PAG Logo Top
                VStack(spacing: PAGSpacing.md) {
                    Image("pag_symbol")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 60, height: 60)

                    Text("PAG'a Hoş Geldiniz")
                        .font(PAGTypography.display)
                        .foregroundColor(.white)

                    Text("Anketlere katıl, Profil Puanı kazan ve ödüllerde öne geç.")
                        .font(PAGTypography.body)
                        .foregroundColor(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, PAGSpacing.lg)
                }

                Spacer()

                // Login Options
                VStack(spacing: PAGSpacing.md) {
                    // Google Button
                    Button(action: {
                        authService.signInWithGoogle()
                    }) {
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
                    .disabled(authService.isLoading)

                    // Apple Button
                    Button(action: {
                        authService.signInWithApple()
                    }) {
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
                    .disabled(authService.isLoading)

                    // Email Button
                    Button(action: {
                        showEmailComingSoonAlert = true
                    }) {
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
                    .disabled(authService.isLoading)
                }
                .padding(.horizontal, PAGSpacing.lg)
                .padding(.bottom, PAGSpacing.xl)
            }

            if authService.isLoading {
                Color.black.opacity(0.4)
                    .ignoresSafeArea()

                VStack(spacing: PAGSpacing.md) {
                    ProgressView()
                        .tint(.white)
                        .scaleEffect(1.5)
                    Text("Giriş yapılıyor...")
                        .font(PAGTypography.body)
                        .foregroundColor(.white)
                }
                .padding(PAGSpacing.xl)
                .background(PAGTheme.surfacePrimary)
                .cornerRadius(PAGRadius.medium)
            }
        }
        .alert("E-posta ile Giriş", isPresented: $showEmailComingSoonAlert) {
            Button("Tamam", role: .cancel) {}
        } message: {
            Text("E-posta ile giriş özelliği çok yakında kullanıma sunulacaktır. Lütfen Google veya Apple ile giriş yapın.")
        }
        .onChange(of: authService.errorMessage) { newValue in
            if newValue != nil {
                showErrorAlert = true
            }
        }
        .alert("Giriş Hası", isPresented: $showErrorAlert) {
            Button("Tamam", role: .cancel) {
                authService.errorMessage = nil
            }
        } message: {
            Text(authService.errorMessage ?? "Bilinmeyen bir hata oluştu.")
        }
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthService())
}

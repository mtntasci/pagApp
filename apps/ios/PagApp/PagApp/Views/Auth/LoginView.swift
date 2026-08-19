import SwiftUI
import AuthenticationServices

public struct LoginView: View {
    @EnvironmentObject private var authService: AuthService
    @State private var isLegalConsentAgreed: Bool = false
    @State private var showLegalSheet: Bool = false
    @State private var showEmailComingSoonAlert: Bool = false
    @State private var showErrorAlert: Bool = false
    @State private var shakeConsentPrompt: Bool = false

    public init() {}

    public var body: some View {
        ZStack {
            // Premium Midnight Dark Background with subtle ambient gradient
            PAGTheme.brandMidnight
                .ignoresSafeArea()
            
            // Ambient subtle glowing radial background
            RadialGradient(
                gradient: Gradient(colors: [
                    Color(hex: "1E293B").opacity(0.6),
                    Color(hex: "0B1120")
                ]),
                center: .top,
                startRadius: 50,
                endRadius: 450
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Hero Branding Header
                VStack(spacing: 16) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color(hex: "38BDF8").opacity(0.15),
                                        Color(hex: "0284C7").opacity(0.05)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 88, height: 88)
                            .overlay(
                                RoundedRectangle(cornerRadius: 22, style: .continuous)
                                    .stroke(Color.white.opacity(0.15), lineWidth: 1)
                            )
                            .shadow(color: Color(hex: "38BDF8").opacity(0.2), radius: 20, x: 0, y: 10)

                        Image("pag_symbol")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 52, height: 52)
                    }

                    VStack(spacing: 8) {
                        Text("PAG'a Hoş Geldiniz")
                            .font(.system(size: 28, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)

                        Text("Anketlere katıl, Profil Puanı kazan ve ödüllerde öncelik kazan.")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(Color.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                            .padding(.horizontal, 32)
                    }
                }

                Spacer()

                // Actions Section (Consent + Buttons)
                VStack(spacing: 18) {
                    
                    // 1. "Sözleşmeler ve İzinleri Onaylıyorum." Checkbox & Link
                    Button(action: {
                        if !isLegalConsentAgreed {
                            showLegalSheet = true
                        } else {
                            isLegalConsentAgreed = false
                        }
                    }) {
                        HStack(alignment: .center, spacing: 10) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 6, style: .continuous)
                                    .fill(isLegalConsentAgreed ? PAGTheme.brandLime : Color.white.opacity(0.08))
                                    .frame(width: 22, height: 22)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 6, style: .continuous)
                                            .stroke(isLegalConsentAgreed ? PAGTheme.brandLime : Color.white.opacity(0.3), lineWidth: 1.5)
                                    )
                                
                                if isLegalConsentAgreed {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 13, weight: .black))
                                        .foregroundColor(PAGTheme.brandMidnight)
                                }
                            }
                            
                            Text("Sözleşmeler ve İzinleri Onaylıyorum.")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(isLegalConsentAgreed ? PAGTheme.brandLime : Color.white.opacity(0.9))
                                .underline()
                            
                            Spacer()
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                    .padding(.horizontal, 4)
                    .offset(x: shakeConsentPrompt ? -6 : 0)
                    .animation(.easeInOut(duration: 0.1).repeatCount(3, autoreverses: true), value: shakeConsentPrompt)

                    // 2. Apple Sign In Button (Apple HIG Compliant)
                    Button(action: {
                        guard checkConsentBeforeLogin() else { return }
                        authService.signInWithApple()
                    }) {
                        HStack(spacing: 12) {
                            Image(systemName: "applelogo")
                                .font(.system(size: 20, weight: .medium))
                            
                            Text("Apple ile Giriş Yap")
                                .font(.system(size: 16, weight: .semibold))
                        }
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Color.white)
                        .cornerRadius(14, antialiased: true)
                        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
                    }
                    .disabled(authService.isLoading)

                    // 3. Google Sign In Button (Clean Modern HIG Style)
                    Button(action: {
                        guard checkConsentBeforeLogin() else { return }
                        authService.signInWithGoogle()
                    }) {
                        HStack(spacing: 12) {
                            // Custom Google G icon using text/sf-symbol with sleek colors
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.12))
                                    .frame(width: 26, height: 26)
                                
                                Text("G")
                                    .font(.system(size: 15, weight: .black, design: .rounded))
                                    .foregroundColor(Color(hex: "4285F4"))
                            }
                            
                            Text("Google ile Devam Et")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Color.white.opacity(0.08))
                        .cornerRadius(14, antialiased: true)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(Color.white.opacity(0.15), lineWidth: 1)
                        )
                    }
                    .disabled(authService.isLoading)

                    // 4. E-Posta Button
                    Button(action: {
                        showEmailComingSoonAlert = true
                    }) {
                        HStack(spacing: 12) {
                            Image(systemName: "envelope.fill")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(Color.white.opacity(0.6))
                            
                            Text("E-posta ile Devam Et")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(Color.white.opacity(0.85))
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(Color.clear)
                        .cornerRadius(14, antialiased: true)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(Color.white.opacity(0.08), lineWidth: 1)
                        )
                    }
                    .disabled(authService.isLoading)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 28)
            }

            // Loading Overlay
            if authService.isLoading {
                Color.black.opacity(0.6)
                    .ignoresSafeArea()

                VStack(spacing: 16) {
                    ProgressView()
                        .tint(PAGTheme.brandLime)
                        .scaleEffect(1.4)
                    
                    Text("Giriş yapılıyor...")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
                .padding(24)
                .background(Color(hex: "1E293B"))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
            }
        }
        .sheet(isPresented: $showLegalSheet) {
            ConsentGateView(onConsentApproved: {
                withAnimation {
                    isLegalConsentAgreed = true
                }
            })
        }
        .alert("E-posta ile Giriş", isPresented: $showEmailComingSoonAlert) {
            Button("Tamam", role: .cancel) {}
        } message: {
            Text("E-posta ile giriş yakında aktif olacaktır. Lütfen Apple veya Google ile devam ediniz.")
        }
        .onChange(of: authService.errorMessage) { newValue in
            if newValue != nil {
                showErrorAlert = true
            }
        }
        .alert("Giriş Yapılamadı", isPresented: $showErrorAlert) {
            Button("Tamam", role: .cancel) {
                authService.errorMessage = nil
            }
        } message: {
            Text(authService.errorMessage ?? "Bilinmeyen bir hata oluştu.")
        }
    }

    private func checkConsentBeforeLogin() -> Bool {
        if !isLegalConsentAgreed {
            shakeConsentPrompt.toggle()
            showLegalSheet = true
            return false
        }
        return true
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthService())
}

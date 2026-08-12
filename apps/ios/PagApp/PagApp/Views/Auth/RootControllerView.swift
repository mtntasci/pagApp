import SwiftUI

public struct RootControllerView: View {
    @EnvironmentObject private var authService: AuthService
    @StateObject private var userService = UserService.shared
    @State private var showSplash = true

    public init() {}

    public var body: some View {
        Group {
            if showSplash || (authService.isAuthenticated && userService.isBootstrapping) {
                SplashView()
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                            withAnimation {
                                showSplash = false
                            }
                        }
                    }
            } else if !authService.isAuthenticated {
                LoginView()
            } else if let error = userService.bootstrapError {
                VStack(spacing: 20) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 44))
                        .foregroundColor(.orange)
                    
                    Text(error)
                        .font(.subheadline)
                        .multilineTextAlignment(.center)
                        .foregroundColor(.primary)
                        .padding(.horizontal)
                    
                    Button(action: {
                        Task {
                            await userService.bootstrapCurrentUser()
                        }
                    }) {
                        Text("Yeniden Dene")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.blue)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                }
                .padding()
            } else {
                MainTabView()
            }
        }
    }
}

#Preview {
    RootControllerView()
        .environmentObject(AuthService())
}


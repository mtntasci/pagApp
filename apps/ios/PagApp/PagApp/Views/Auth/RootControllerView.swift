import SwiftUI

public struct RootControllerView: View {
    @EnvironmentObject private var authService: AuthService
    @State private var showSplash = true

    public init() {}

    public var body: some View {
        Group {
            if showSplash {
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


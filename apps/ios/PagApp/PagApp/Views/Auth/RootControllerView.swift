import SwiftUI

public struct RootControllerView: View {
    @State private var showSplash = true
    @State private var isAuthenticated = false
    
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
            } else if !isAuthenticated {
                LoginView(onLogin: {
                    withAnimation {
                        isAuthenticated = true
                    }
                })
            } else {
                MainTabView()
            }
        }
    }
}

#Preview {
    RootControllerView()
}

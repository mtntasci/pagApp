import SwiftUI

public struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    
    public enum Tab: Hashable {
        case home
        case surveys
        case rewards
        case profile
    }
    
    public init() {}
    
    public var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(onNavigateToSurveys: {
                selectedTab = .surveys
            })
                .tabItem {
                    Label("Ana Sayfa", systemImage: "house.fill")
                }
                .tag(Tab.home)
            
            SurveysView()
                .tabItem {
                    Label("Anketler", systemImage: "doc.text.fill")
                }
                .tag(Tab.surveys)
            
            RewardsView()
                .tabItem {
                    Label("Ödüller", systemImage: "gift.fill")
                }
                .tag(Tab.rewards)
            
            ProfileView()
                .tabItem {
                    Label("Profil", systemImage: "person.fill")
                }
                .tag(Tab.profile)
        }
        .accentColor(PAGTheme.brandMidnight)
    }
}

#Preview {
    MainTabView()
}

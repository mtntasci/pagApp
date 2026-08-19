import SwiftUI
import UserNotifications
import CoreLocation

public struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    
    // Onboarding permission popups state
    @AppStorage("hasCompletedPushOnboarding") private var hasCompletedPushOnboarding: Bool = false
    @AppStorage("hasCompletedLocationOnboarding") private var hasCompletedLocationOnboarding: Bool = false
    
    @State private var showPushModal: Bool = false
    @State private var showLocationModal: Bool = false
    @State private var showScoreCelebration: Bool = false
    @State private var celebrationMessage: String = ""
    
    public enum Tab: Hashable {
        case home
        case surveys
        case rewards
        case profile
    }
    
    public init() {}
    
    public var body: some View {
        ZStack {
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
            
            // 1. Push Notification Onboarding Modal
            if showPushModal {
                OnboardingModalView(
                    iconName: "bell.badge.fill",
                    iconColor: PAGTheme.brandLime,
                    title: "Anlık Bildirimler",
                    description: "Anlık Bildirimler Nakit, Hediye Çeki ve daha bir çok ödül kazanmanıza yardımcı olacak. Açmak ister misiniz?",
                    confirmTitle: "Evet, Bildirimleri Aç",
                    cancelTitle: "Şimdi Değil",
                    onConfirm: {
                        Task {
                            let center = UNUserNotificationCenter.current()
                            do {
                                _ = try await center.requestAuthorization(options: [.alert, .sound, .badge])
                            } catch {
                                print("[PushOnboarding] Authorization error: \(error)")
                            }
                            hasCompletedPushOnboarding = true
                            showPushModal = false
                            
                            // Trigger Location modal next if not completed
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                if !hasCompletedLocationOnboarding {
                                    showLocationModal = true
                                }
                            }
                        }
                    },
                    onCancel: {
                        hasCompletedPushOnboarding = true
                        showPushModal = false
                        
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                            if !hasCompletedLocationOnboarding {
                                showLocationModal = true
                            }
                        }
                    }
                )
                .transition(.opacity.combined(with: .scale(scale: 0.95)))
            }
            
            // 2. Location Permission Onboarding Modal (+100 Puan)
            if showLocationModal {
                OnboardingModalView(
                    iconName: "location.circle.fill",
                    iconColor: PAGTheme.brandLime,
                    badgeText: "+100 Profil Puanı",
                    title: "Konum Paylaşımı",
                    description: "Konumunuzu paylaşmak size ilk Profil Puanınızı kazandıracak. Onaylıyor musunuz?",
                    confirmTitle: "Evet, Konumu Paylaş (+100 Puan)",
                    cancelTitle: "Daha Sonra",
                    onConfirm: {
                        Task {
                            // Request native iOS Location permission
                            let locationManager = CLLocationManager()
                            locationManager.requestWhenInUseAuthorization()
                            
                            // Award 100 points via Backend API
                            do {
                                let res = try await PAGApiClient.shared.post(endpoint: "/permissions/location", body: [:])
                                if let data = res["data"] as? [String: Any],
                                   let scoreAwarded = data["scoreAwarded"] as? Int, scoreAwarded > 0 {
                                    await UserService.shared.bootstrapCurrentUser()
                                    celebrationMessage = "Tebrikler! +100 Profil Puanı Hesabınıza Eklendi 🎉"
                                    showScoreCelebration = true
                                }
                            } catch {
                                print("[LocationOnboarding] API award error: \(error)")
                            }
                            
                            hasCompletedLocationOnboarding = true
                            showLocationModal = false
                        }
                    },
                    onCancel: {
                        hasCompletedLocationOnboarding = true
                        showLocationModal = false
                    }
                )
                .transition(.opacity.combined(with: .scale(scale: 0.95)))
            }
            
            // 3. Score Celebration Toast
            if showScoreCelebration {
                VStack {
                    Spacer()
                    HStack(spacing: 12) {
                        Image(systemName: "star.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(PAGTheme.brandLime)
                        Text(celebrationMessage)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(PAGTheme.textPrimary)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 14)
                    .background(PAGTheme.surfacePrimary)
                    .cornerRadius(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(PAGTheme.brandLime, lineWidth: 1.5)
                    )
                    .shadow(color: Color.black.opacity(0.3), radius: 16, x: 0, y: 8)
                    .padding(.bottom, 80)
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                        withAnimation {
                            showScoreCelebration = false
                        }
                    }
                }
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: showPushModal)
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: showLocationModal)
        .animation(.easeInOut(duration: 0.3), value: showScoreCelebration)
        .onAppear {
            checkAndTriggerOnboarding()
        }
    }
    
    private func checkAndTriggerOnboarding() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            if !hasCompletedPushOnboarding {
                showPushModal = true
            } else if !hasCompletedLocationOnboarding {
                showLocationModal = true
            }
        }
    }
}

/**
 * Reusable Sleek Onboarding Permission Modal Card
 */
struct OnboardingModalView: View {
    let iconName: String
    let iconColor: Color
    var badgeText: String? = nil
    let title: String
    let description: String
    let confirmTitle: String
    let cancelTitle: String
    let onConfirm: () -> Void
    let onCancel: () -> Void
    
    var body: some View {
        ZStack {
            // Dimmed backdrop
            Color.black.opacity(0.7)
                .ignoresSafeArea()
            
            // Modal Card
            VStack(spacing: 20) {
                // Icon + Optional Badge
                ZStack(alignment: .topTrailing) {
                    ZStack {
                        Circle()
                            .fill(iconColor.opacity(0.15))
                            .frame(width: 70, height: 70)
                        
                        Image(systemName: iconName)
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(iconColor)
                    }
                    
                    if let badge = badgeText {
                        Text(badge)
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(PAGTheme.brandMidnight)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(PAGTheme.brandLime)
                            .cornerRadius(10)
                            .offset(x: 12, y: -6)
                    }
                }
                
                // Texts
                VStack(spacing: 8) {
                    Text(title)
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    Text(description)
                        .font(.system(size: 14))
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3)
                        .padding(.horizontal, 6)
                }
                
                // Actions
                VStack(spacing: 10) {
                    Button(action: onConfirm) {
                        Text(confirmTitle)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(PAGTheme.brandMidnight)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(PAGTheme.brandLime)
                            .cornerRadius(14)
                    }
                    
                    Button(action: onCancel) {
                        Text(cancelTitle)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(PAGTheme.textSecondary)
                    }
                    .padding(.top, 4)
                }
            }
            .padding(26)
            .background(PAGTheme.surfacePrimary)
            .cornerRadius(22)
            .overlay(
                RoundedRectangle(cornerRadius: 22)
                    .stroke(PAGTheme.borderColor, lineWidth: 1)
            )
            .padding(.horizontal, 28)
            .shadow(color: Color.black.opacity(0.4), radius: 24, x: 0, y: 12)
        }
    }
}

#Preview {
    MainTabView()
}

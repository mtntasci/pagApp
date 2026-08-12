import SwiftUI

public struct ProfileScoreCard: View {
    @ObservedObject private var userService = UserService.shared
    private let user: UserProfileMock
    
    public init(user: UserProfileMock = .sample) {
        self.user = user
    }
    
    private var greetingText: String {
        if let displayName = userService.currentUser?.displayName, !displayName.isEmpty {
            return "Merhaba, \(displayName) 👋"
        }
        return "Merhaba 👋"
    }
    
    private var currentScore: Int {
        return userService.currentUser?.profileScore ?? 0
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
            // Greeting row
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(greetingText)
                        .font(PAGTypography.heading)
                        .foregroundColor(Color(hex: "#F8FAFC"))
                    
                    Text("PAG Profil Durumun")
                        .font(PAGTypography.bodySmall)
                        .foregroundColor(Color(hex: "#98A2B3"))
                }
                
                Spacer()
                
                // Ranking advantage pill
                HStack(spacing: PAGSpacing.xxxs) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(PAGTheme.brandMidnight)
                    Text("\(user.rankingAdvantageText) • \(user.rankingPercentileText)")
                        .font(PAGTypography.caption.weight(.bold))
                        .foregroundColor(PAGTheme.brandMidnight)
                }
                .padding(.horizontal, PAGSpacing.xs)
                .padding(.vertical, PAGSpacing.xxs)
                .background(PAGTheme.brandLime)
                .clipShape(Capsule())
            }
            
            Divider()
                .background(Color(hex: "#263244"))
                .padding(.vertical, 2)
            
            // Score Display
            HStack(alignment: .lastTextBaseline, spacing: PAGSpacing.xxs) {
                Text(formattedScore(currentScore))
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundColor(PAGTheme.brandLime)
                
                Text("Profil Puanı")
                    .font(PAGTypography.title)
                    .foregroundColor(Color(hex: "#F8FAFC"))
            }
            
            // Descriptive info
            Text("Yüksek Profil Puanın sayesinde yayınlanan anketlere öncelikli erişim hakkına sahipsin.")
                .font(PAGTypography.bodySmall)
                .foregroundColor(Color(hex: "#B8C0CC"))
                .lineLimit(2)
        }
        .padding(PAGSpacing.md)
        .background(PAGTheme.brandMidnight)
        .clipShape(RoundedRectangle(cornerRadius: PAGRadius.xl, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: PAGRadius.xl, style: .continuous)
                .stroke(Color(hex: "#263244"), lineWidth: 1)
        )
    }
    
    private func formattedScore(_ score: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = "."
        return formatter.string(from: NSNumber(value: score)) ?? "\(score)"
    }
}

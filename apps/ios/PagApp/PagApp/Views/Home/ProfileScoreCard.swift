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
    
    private var tierInfo: (title: String, subtitle: String?, badgeColor: Color, textColor: Color) {
        let percentile = userService.currentRanking?.percentile ?? 100.0
        if percentile <= 10.0 {
            return ("En Güçlü", nil, Color(hex: "#FFD700"), Color(hex: "#0F172A"))
        } else if percentile <= 50.0 {
            return ("Güçlü", "sizi bekleyen puanları kaçırmayın", PAGTheme.brandLime, Color(hex: "#0F172A"))
        } else if percentile <= 70.0 {
            return ("Umut Vaadeden", "Hadi nakit ödüller sizi bekliyor", Color(hex: "#F97316"), .white)
        } else {
            return ("Gelişim Sürecinde", "Ödüller birkaç tık uzağınızda", Color(hex: "#38BDF8"), Color(hex: "#0F172A"))
        }
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: PAGSpacing.sm) {
            // Greeting row
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(greetingText)
                        .font(PAGTypography.heading)
                        .foregroundColor(Color(hex: "#F8FAFC"))
                    
                    Text("PAG Profil Durumun")
                        .font(PAGTypography.bodySmall)
                        .foregroundColor(Color(hex: "#98A2B3"))
                }
                
                Spacer()
                
                // Tier Badge
                HStack(spacing: PAGSpacing.xxxs) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(tierInfo.textColor)
                    Text(tierInfo.title)
                        .font(PAGTypography.caption.weight(.bold))
                        .foregroundColor(tierInfo.textColor)
                }
                .padding(.horizontal, PAGSpacing.xs)
                .padding(.vertical, PAGSpacing.xxs)
                .background(tierInfo.badgeColor)
                .clipShape(Capsule())
            }
            
            // Detailed ranking pill row if ranking is available
            let rankingDetailText: String = {
                if let r = userService.currentRanking {
                    return "Sıralaman: #\(r.rank) • \(r.percentileText)"
                }
                return user.rankingPercentileText
            }()
            
            Text(rankingDetailText)
                .font(PAGTypography.caption.weight(.medium))
                .foregroundColor(Color(hex: "#98A2B3"))
            
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
            
            // Descriptive info / Subtitle
            if let subtitle = tierInfo.subtitle {
                Text(subtitle)
                    .font(PAGTypography.bodySmall)
                    .foregroundColor(Color(hex: "#B8C0CC"))
                    .lineLimit(2)
            } else {
                Text("Yüksek Profil Puanın sayesinde yayınlanan anketlere öncelikli erişim hakkına sahipsin.")
                    .font(PAGTypography.bodySmall)
                    .foregroundColor(Color(hex: "#B8C0CC"))
                    .lineLimit(2)
            }
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

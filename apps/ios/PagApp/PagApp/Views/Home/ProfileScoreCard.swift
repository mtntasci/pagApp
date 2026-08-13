import SwiftUI

public struct ProfileScoreCard: View {
    @ObservedObject private var userService = UserService.shared
    private let user: UserProfileMock
    
    public init(user: UserProfileMock = .sample) {
        self.user = user
    }
    
    private var greetingText: String {
        if let name = userService.currentUser?.firstName?.trimmingCharacters(in: .whitespacesAndNewlines), !name.isEmpty {
            return "Merhaba, \(name) 👋"
        }
        return "Merhaba 👋"
    }
    
    private var currentScore: Int {
        return userService.currentUser?.profileScore ?? 0
    }
    
    private var tierInfo: (title: String, subtitle: String, badgeColor: Color, textColor: Color) {
        let rank = userService.currentRanking?.rank
        let percentile = userService.currentRanking?.percentile ?? 100.0
        if rank == 1 || percentile <= 10.0 {
            return ("En Güçlü", "Avantajlı konumunu koru", Color(hex: "#FFD700"), Color(hex: "#0F172A"))
        } else if percentile <= 50.0 {
            return ("Güçlü", "Yeni puan fırsatlarını kaçırma", PAGTheme.brandLime, Color(hex: "#0F172A"))
        } else if percentile <= 70.0 {
            return ("Yükselişte", "Biraz daha puanla öne geçebilirsin", Color(hex: "#F97316"), .white)
        } else {
            return ("Gelişim Sürecinde", "Profilini güçlendir, sıralamada yüksel", Color(hex: "#38BDF8"), Color(hex: "#0F172A"))
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
            
            // Detailed ranking pill row (Balloon Badge)
            let rankingDetailText: String = {
                if let r = userService.currentRanking {
                    return "Sıralaman: #\(r.rank) • \(r.percentileText)"
                }
                return user.rankingPercentileText
            }()
            
            HStack(spacing: PAGSpacing.xxs) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(PAGTheme.brandLime)
                Text(rankingDetailText)
                    .font(PAGTypography.caption.weight(.semibold))
                    .foregroundColor(Color(hex: "#F8FAFC"))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Color(hex: "#1E293B"))
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(Color(hex: "#334155"), lineWidth: 1)
            )
            
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
            Text(tierInfo.subtitle)
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

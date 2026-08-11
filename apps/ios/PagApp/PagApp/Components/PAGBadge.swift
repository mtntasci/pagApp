import SwiftUI

public enum PAGBadgeStyle {
    case profileScore
    case rewardPool
    case tag
    case info
}

public struct PAGBadge: View {
    private let title: String
    private let iconName: String?
    private let style: PAGBadgeStyle
    
    public init(
        title: String,
        iconName: String? = nil,
        style: PAGBadgeStyle = .tag
    ) {
        self.title = title
        self.iconName = iconName
        self.style = style
    }
    
    public var body: some View {
        HStack(spacing: PAGSpacing.xxxs) {
            if let iconName = iconName {
                Image(systemName: iconName)
                    .font(.system(size: 11, weight: .bold))
            }
            Text(title)
                .font(PAGTypography.caption.weight(.semibold))
        }
        .padding(.horizontal, PAGSpacing.xxs)
        .padding(.vertical, PAGSpacing.xxxs)
        .background(badgeBackground)
        .foregroundColor(badgeForegroundColor)
        .clipShape(Capsule())
    }
    
    private var badgeBackground: Color {
        switch style {
        case .profileScore:
            return PAGTheme.brandLime.opacity(0.18)
        case .rewardPool:
            return PAGTheme.success.opacity(0.12)
        case .tag:
            return PAGTheme.surfaceSecondary
        case .info:
            return PAGTheme.brandBlue.opacity(0.12)
        }
    }
    
    private var badgeForegroundColor: Color {
        switch style {
        case .profileScore:
            return PAGTheme.textPrimary
        case .rewardPool:
            return PAGTheme.success
        case .tag:
            return PAGTheme.textSecondary
        case .info:
            return PAGTheme.brandBlue
        }
    }
}

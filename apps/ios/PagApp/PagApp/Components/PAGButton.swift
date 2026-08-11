import SwiftUI

public enum PAGButtonStyle {
    case primary
    case secondary
    case outline
}

public struct PAGButton: View {
    private let title: String
    private let iconName: String?
    private let style: PAGButtonStyle
    private let action: () -> Void
    
    public init(
        title: String,
        iconName: String? = nil,
        style: PAGButtonStyle = .primary,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.iconName = iconName
        self.style = style
        self.action = action
    }
    
    public var body: some View {
        Button(action: action) {
            HStack(spacing: PAGSpacing.xxs) {
                if let iconName = iconName {
                    Image(systemName: iconName)
                        .font(.system(size: 15, weight: .bold))
                }
                Text(title)
                    .font(PAGTypography.body.weight(.semibold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, PAGSpacing.xs)
            .padding(.horizontal, PAGSpacing.sm)
            .background(buttonBackground)
            .foregroundColor(buttonForegroundColor)
            .clipShape(RoundedRectangle(cornerRadius: PAGRadius.medium, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: PAGRadius.medium, style: .continuous)
                    .stroke(buttonBorderColor, lineWidth: style == .outline ? 1 : 0)
            )
        }
    }
    
    private var buttonBackground: Color {
        switch style {
        case .primary:
            return PAGTheme.brandLime
        case .secondary:
            return PAGTheme.surfaceSecondary
        case .outline:
            return Color.clear
        }
    }
    
    private var buttonForegroundColor: Color {
        switch style {
        case .primary:
            return PAGTheme.brandMidnight // High contrast dark text on Lime accent
        case .secondary, .outline:
            return PAGTheme.textPrimary
        }
    }
    
    private var buttonBorderColor: Color {
        switch style {
        case .outline:
            return PAGTheme.borderStrong
        default:
            return Color.clear
        }
    }
}

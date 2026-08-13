import SwiftUI

public struct PAGStoryItem: View {
    public let type: StoryItemType
    public let onTap: () -> Void
    
    public init(type: StoryItemType, onTap: @escaping () -> Void) {
        self.type = type
        self.onTap = onTap
    }
    
    public var body: some View {
        Button(action: onTap) {
            VStack(spacing: PAGSpacing.xs) {
                // Circle visual
                ZStack {
                    Circle()
                        .fill(PAGTheme.backgroundPrimary)
                        .frame(width: 68, height: 68)
                    
                    Circle()
                        .stroke(ringColor, lineWidth: 2)
                        .frame(width: 64, height: 64)
                    
                    iconView
                }
                
                // Label
                Text(label)
                    .font(PAGTypography.caption)
                    .foregroundColor(PAGTheme.textPrimary)
                    .lineLimit(1)
                    .frame(width: 72)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    @ViewBuilder
    private var iconView: some View {
        switch type {
        case .home:
            if UIImage(named: "pag_symbol") != nil {
                Image("pag_symbol")
                    .resizable()
                    .scaledToFill()
                    .frame(width: 60, height: 60)
                    .clipShape(Circle())
            } else {
                defaultStoryFallback(systemIcon: "house.fill")
            }
        case .story(let story):
            if let imgUrlStr = story.imageUrl, !imgUrlStr.isEmpty, let url = URL(string: imgUrlStr) {
                AsyncImage(url: url) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .scaledToFill()
                    } else {
                        defaultStoryFallback(systemIcon: story.type == .earnProfileScore ? "sparkles" : "star.fill")
                    }
                }
                .frame(width: 60, height: 60)
                .clipShape(Circle())
            } else if UIImage(named: story.image) != nil {
                Image(story.image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 60, height: 60)
                    .clipShape(Circle())
            } else {
                defaultStoryFallback(systemIcon: story.type == .earnProfileScore ? "sparkles" : "star.fill")
            }
        }
    }
    
    private func defaultStoryFallback(systemIcon: String) -> some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [PAGTheme.brandLime, PAGTheme.brandMidnight]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Image(systemName: systemIcon)
                .foregroundColor(.white)
                .font(.system(size: 22, weight: .bold))
        }
        .frame(width: 60, height: 60)
        .clipShape(Circle())
    }
    
    private var ringColor: Color {
        switch type {
        case .home:
            return PAGTheme.borderDefault
        case .story(let story):
            if story.type == .earnProfileScore {
                return PAGTheme.brandLime
            }
            return PAGTheme.borderStrong
        }
    }
    
    private var label: String {
        switch type {
        case .home:
            return "PAG"
        case .story(let story):
            return story.shortLabel
        }
    }
}

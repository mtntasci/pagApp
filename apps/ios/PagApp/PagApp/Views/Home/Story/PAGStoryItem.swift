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
            Image(systemName: "circle.hexagongrid.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 32, height: 32)
                .foregroundColor(PAGTheme.textPrimary)
        case .survey(let survey):
            if survey.surveyType == .profile {
                Image(systemName: "person.crop.circle")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 28, height: 28)
                    .foregroundColor(PAGTheme.brandBlue)
            } else {
                Text(String(survey.ownerName.prefix(1)).uppercased())
                    .font(PAGTypography.heading)
                    .foregroundColor(PAGTheme.textPrimary)
            }
        case .earnProfileScore:
            Image(systemName: "bolt.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 28, height: 28)
                .foregroundColor(PAGTheme.brandLime)
        }
    }
    
    private var ringColor: Color {
        switch type {
        case .home:
            return PAGTheme.borderDefault
        case .survey(let survey):
            return survey.surveyType == .profile ? PAGTheme.brandBlue : PAGTheme.borderStrong
        case .earnProfileScore:
            return PAGTheme.brandLime
        }
    }
    
    private var label: String {
        switch type {
        case .home:
            return "PAG"
        case .survey(let survey):
            return survey.ownerName
        case .earnProfileScore:
            return "Puan Kazan"
        }
    }
}

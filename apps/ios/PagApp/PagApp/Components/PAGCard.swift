import SwiftUI

public struct PAGCard<Content: View>: View {
    private let backgroundColor: Color
    private let borderColor: Color
    private let cornerRadius: CGFloat
    private let content: Content
    
    public init(
        backgroundColor: Color = PAGTheme.surfacePrimary,
        borderColor: Color = PAGTheme.borderDefault,
        cornerRadius: CGFloat = PAGRadius.xl,
        @ViewBuilder content: () -> Content
    ) {
        self.backgroundColor = backgroundColor
        self.borderColor = borderColor
        self.cornerRadius = cornerRadius
        self.content = content()
    }
    
    public var body: some View {
        content
            .padding(PAGSpacing.sm)
            .background(backgroundColor)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(borderColor, lineWidth: 1)
            )
    }
}

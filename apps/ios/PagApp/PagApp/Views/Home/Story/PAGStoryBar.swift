import SwiftUI

public struct PAGStoryBar: View {
    public let items: [StoryItemType]
    public let onSelect: (StoryItemType) -> Void
    
    public init(items: [StoryItemType], onSelect: @escaping (StoryItemType) -> Void) {
        self.items = items
        self.onSelect = onSelect
    }
    
    public var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: PAGSpacing.sm) {
                ForEach(items, id: \.self) { item in
                    PAGStoryItem(type: item) {
                        onSelect(item)
                    }
                }
            }
            .padding(.horizontal, PAGSpacing.sm)
        }
        .padding(.vertical, PAGSpacing.sm)
        .background(PAGTheme.backgroundPrimary)
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(PAGTheme.borderDefault),
            alignment: .bottom
        )
    }
}

import SwiftUI

public struct RewardsView: View {
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ZStack {
                PAGTheme.backgroundPrimary
                    .ignoresSafeArea()
                
                VStack(spacing: PAGSpacing.md) {
                    Image(systemName: "gift.fill")
                        .font(.system(size: 48))
                        .foregroundColor(PAGTheme.brandLime)
                    
                    Text("Ödüller & Bakiyem")
                        .font(PAGTypography.title)
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    Text("Anketlerden kazandığın nakit ödüller ve hediye çekleri burada görünecek.")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, PAGSpacing.xl)
                }
            }
            .navigationTitle("Ödüller")
        }
    }
}

#Preview {
    RewardsView()
}

import SwiftUI

public struct SplashView: View {
    public init() {}
    
    public var body: some View {
        ZStack {
            PAGTheme.brandMidnight.ignoresSafeArea()
            
            VStack {
                // Mock PAG Symbol
                Image(systemName: "circle.hexagongrid.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundColor(PAGTheme.brandLime)
                
                Text("PAG")
                    .font(PAGTypography.display)
                    .foregroundColor(PAGTheme.textPrimary)
            }
        }
    }
}

#Preview {
    SplashView()
}

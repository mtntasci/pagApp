import SwiftUI

public struct SurveysView: View {
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ZStack {
                PAGTheme.backgroundPrimary
                    .ignoresSafeArea()
                
                VStack(spacing: PAGSpacing.md) {
                    Image(systemName: "doc.text.magnifyingglass")
                        .font(.system(size: 48))
                        .foregroundColor(PAGTheme.brandBlue)
                    
                    Text("Tüm Anketler")
                        .font(PAGTypography.title)
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    Text("Yakında katılabileceğin tüm kategorilerdeki anketler burada listelenecek.")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, PAGSpacing.xl)
                }
            }
            .navigationTitle("Anketler")
        }
    }
}

#Preview {
    SurveysView()
}

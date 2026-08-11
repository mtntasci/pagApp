import SwiftUI

public struct EarnProfileScoreView: View {
    public init() {}
    
    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()
            
            VStack(spacing: PAGSpacing.xl) {
                Spacer()
                
                // Icon
                Image(systemName: "bolt.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundColor(PAGTheme.brandLime)
                    .padding()
                    .background(PAGTheme.surfacePrimary)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(PAGTheme.brandLime, lineWidth: 2))
                
                // Text
                VStack(spacing: PAGSpacing.sm) {
                    Text("Video İzle, Profil Puanı Kazan")
                        .font(PAGTypography.display)
                        .foregroundColor(PAGTheme.textPrimary)
                        .multilineTextAlignment(.center)
                    
                    Text("Profil Puanını artırarak yeni anketlerde daha öncelikli olabilirsin.")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, PAGSpacing.lg)
                }
                
                Spacer()
                
                // Mock CTA
                Button(action: {}) {
                    HStack {
                        Image(systemName: "play.circle.fill")
                            .font(.system(size: 20))
                        Text("Video İzle (Demo)")
                            .font(PAGTypography.heading)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(PAGTheme.surfaceSecondary) // Disabled state look
                    .foregroundColor(PAGTheme.textMuted)
                    .cornerRadius(PAGRadius.medium)
                }
                .disabled(true)
                .padding(.horizontal, PAGSpacing.lg)
                .padding(.bottom, PAGSpacing.xl)
            }
        }
        .navigationTitle("Profil Puanı Kazan")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    EarnProfileScoreView()
}

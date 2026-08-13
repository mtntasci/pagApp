import SwiftUI

public struct ProfileSurveysView: View {
    @StateObject private var surveyService = SurveyService.shared
    @Environment(\.presentationMode) private var presentationMode

    public init() {}

    private var profileSurveys: [PAGSurvey] {
        return surveyService.eligibleSurveys.filter { $0.surveyType == "PROFILE" }
    }

    public var body: some View {
        ZStack {
            PAGTheme.backgroundPrimary.ignoresSafeArea()

            VStack(spacing: 0) {
                if surveyService.isLoading {
                    Spacer()
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: PAGTheme.brandLime))
                    Text("Profil Anketleri Yükleniyor...")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textMuted)
                        .padding(.top, PAGSpacing.sm)
                    Spacer()
                } else if profileSurveys.isEmpty {
                    Spacer()
                    VStack(spacing: PAGSpacing.md) {
                        Image(systemName: "person.fill.checkmark")
                            .font(.system(size: 50))
                            .foregroundColor(PAGTheme.brandLime)
                        Text("Henüz Profil Anketi Yok")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.textPrimary)
                        Text("Şu anda yanıtlanabilecek aktif bir profil anketi bulunmuyor.")
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.textMuted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, PAGSpacing.xl)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        VStack(spacing: PAGSpacing.md) {
                            ForEach(profileSurveys) { survey in
                                NavigationLink(destination: SurveyDetailView(surveyId: survey.surveyId)) {
                                    HStack(spacing: PAGSpacing.md) {
                                        VStack(alignment: .leading, spacing: 6) {
                                            HStack {
                                                Text(survey.title)
                                                    .font(PAGTypography.heading)
                                                    .foregroundColor(PAGTheme.textPrimary)
                                                    .multilineTextAlignment(.leading)
                                                Spacer()
                                                PAGBadge(
                                                    title: "+\(survey.profileScoreReward) Puan",
                                                    iconName: "bolt.fill",
                                                    style: .profileScore
                                                )
                                            }
                                            Text(survey.description)
                                                .font(PAGTypography.caption)
                                                .foregroundColor(PAGTheme.textMuted)
                                                .multilineTextAlignment(.leading)
                                                .lineLimit(2)

                                            HStack {
                                                if survey.isCompleted {
                                                    Label("Tamamlandı (Cevabı Düzenle)", systemImage: "checkmark.circle.fill")
                                                        .font(PAGTypography.caption)
                                                        .foregroundColor(PAGTheme.success)
                                                } else {
                                                    Label("Yanıtla & Kazan", systemImage: "arrow.right.circle.fill")
                                                        .font(PAGTypography.caption)
                                                        .foregroundColor(PAGTheme.brandLime)
                                                }
                                            }
                                            .padding(.top, 4)
                                        }
                                        Image(systemName: "chevron.right")
                                            .foregroundColor(PAGTheme.textMuted)
                                    }
                                    .padding()
                                    .background(PAGTheme.surfacePrimary)
                                    .cornerRadius(PAGRadius.medium)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: PAGRadius.medium)
                                            .stroke(PAGTheme.borderDefault, lineWidth: 1)
                                    )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(PAGSpacing.md)
                    }
                }
            }
        }
        .navigationTitle("Profil Anketleri")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            Task {
                await surveyService.fetchEligibleSurveys()
            }
        }
    }
}

#Preview {
    NavigationStack {
        ProfileSurveysView()
    }
}

import SwiftUI
import WebKit

public struct FullScreenDocumentReaderView: View {
    public let document: LegalDocument
    public let onAccept: ((LegalDocument) -> Void)?
    
    @Environment(\.presentationMode) private var presentationMode
    @State private var hasScrolledToBottom: Bool = false
    @State private var isAccepted: Bool = false
    @State private var scrollProgress: CGFloat = 0.0
    
    public init(
        document: LegalDocument,
        isAlreadyAccepted: Bool = false,
        onAccept: ((LegalDocument) -> Void)? = nil
    ) {
        self.document = document
        self._isAccepted = State(initialValue: isAlreadyAccepted)
        self.onAccept = onAccept
    }
    
    private var actionButtonTitle: String {
        if document.type == "KVKK_NOTICE" {
            return isAccepted ? "Aydınlatma Metni Okundu ✓" : "Okudum ve Bilgilendirildim"
        }
        return isAccepted ? "Kabul Edildi ✓" : "Okudum ve Kabul Ediyorum"
    }
    
    public var body: some View {
        NavigationView {
            ZStack {
                PAGTheme.backgroundPrimary
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Document Content with Scroll Tracking
                    ScrollViewWithBottomDetector(
                        url: URL(string: document.url),
                        documentType: document.type,
                        hasReachedBottom: $hasScrolledToBottom
                    )
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    
                    // Bottom Acceptance Bar
                    VStack(spacing: 10) {
                        Divider()
                            .background(PAGTheme.borderColor)
                        
                        if !hasScrolledToBottom && !isAccepted {
                            HStack(spacing: 6) {
                                Image(systemName: "arrow.down.circle.fill")
                                    .font(.system(size: 13))
                                    .foregroundColor(PAGTheme.brandOrange)
                                Text("Lütfen metni sonuna kadar okuyunuz")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(PAGTheme.textSecondary)
                            }
                            .padding(.top, 4)
                            .transition(.opacity)
                        }
                        
                        Button(action: {
                            if hasScrolledToBottom || isAccepted {
                                isAccepted = true
                                onAccept?(document)
                                presentationMode.wrappedValue.dismiss()
                            }
                        }) {
                            HStack(spacing: 8) {
                                if isAccepted {
                                    Image(systemName: "checkmark.circle.fill")
                                        .font(.system(size: 18))
                                }
                                Text(actionButtonTitle)
                                    .font(.system(size: 16, weight: .bold))
                            }
                            .foregroundColor(hasScrolledToBottom || isAccepted ? PAGTheme.brandMidnight : PAGTheme.textMuted)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(hasScrolledToBottom || isAccepted ? PAGTheme.brandLime : PAGTheme.surfaceSecondary)
                            .cornerRadius(14)
                        }
                        .disabled(!hasScrolledToBottom && !isAccepted)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 12)
                    }
                    .background(PAGTheme.surfacePrimary)
                }
            }
            .navigationTitle(document.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(PAGTheme.textSecondary)
                    }
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

/**
 * Scroll view tracking whether user scrolled to the bottom of the legal document.
 */
struct ScrollViewWithBottomDetector: View {
    let url: URL?
    let documentType: String
    @Binding var hasReachedBottom: Bool
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header Info
                VStack(alignment: .leading, spacing: 8) {
                    Text(documentTitleForType(documentType))
                        .font(.system(size: 22, weight: .black))
                        .foregroundColor(PAGTheme.textPrimary)
                    
                    HStack(spacing: 12) {
                        Label("Alaf Teknoloji A.Ş.", systemImage: "building.2.fill")
                            .font(.system(size: 12))
                            .foregroundColor(PAGTheme.textSecondary)
                        
                        Label("18+ Yaş Şartı", systemImage: "person.badge.shield.checkmark.fill")
                            .font(.system(size: 12))
                            .foregroundColor(PAGTheme.brandLime)
                    }
                    
                    Divider()
                        .background(PAGTheme.borderColor)
                        .padding(.top, 4)
                }
                .padding(.bottom, 8)
                
                // Document Sections
                ForEach(legalSectionsForType(documentType), id: \.title) { section in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(section.title)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(PAGTheme.brandLime)
                        
                        Text(section.content)
                            .font(.system(size: 14))
                            .foregroundColor(PAGTheme.textSecondary)
                            .lineSpacing(5)
                    }
                    .padding(.bottom, 6)
                }
                
                // Bottom End Anchor Detector
                GeometryReader { geo in
                    Color.clear
                        .preference(key: BottomOffsetKey.self, value: geo.frame(in: .global).maxY)
                }
                .frame(height: 20)
                .onAppear {
                    // Initial check
                }
            }
            .padding(24)
        }
        .onPreferenceChange(BottomOffsetKey.self) { maxY in
            let screenHeight = UIScreen.main.bounds.height
            if maxY < screenHeight + 150 {
                if !hasReachedBottom {
                    withAnimation {
                        hasReachedBottom = true
                    }
                }
            }
        }
    }
    
    private func documentTitleForType(_ type: String) -> String {
        switch type {
        case "TERMS": return "Kullanım Koşulları ve Üyelik Sözleşmesi"
        case "KVKK_NOTICE": return "KVKK ve Kullanıcı Gizliliği Aydınlatma Metni"
        case "REWARD_TERMS": return "Ödül ve Kampanya Katılım Koşulları"
        case "EXPLICIT_CONSENT": return "Açık Rıza Metni"
        case "COMMERCIAL_COMMUNICATION": return "Ticari Elektronik İleti Onay Metni"
        case "PRIVACY_POLICY": return "PAG Gizlilik Politikası"
        case "AGE_SUITABILITY": return "18+ Yaş Uygunluğu Bildirimi"
        default: return "Yasal Belge"
        }
    }
    
    private struct LegalSection {
        let title: String
        let content: String
    }
    
    private func legalSectionsForType(_ type: String) -> [LegalSection] {
        switch type {
        case "TERMS":
            return [
                LegalSection(
                    title: "1. Taraflar ve Hizmetin Tanımı",
                    content: "İşbu Sözleşme, Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul adresinde mukim Alaf Teknoloji A.Ş. ile PAG mobil uygulamasını kullanan 18 yaşını doldurmuş Kullanıcı arasında akdedilmiştir."
                ),
                LegalSection(
                    title: "2. 18+ Yaş Zorunluluğu",
                    content: "PAG, münhasıran 18 yaş ve üzeri yetişkin bireylere yönelik bir pazar araştırması platformudur. Kullanıcı 18 yaşını doldurduğunu gayrikabili rücu taahhüt eder. 18 yaş altı hesaplar tespit edildiğinde derhal kapatılır."
                ),
                LegalSection(
                    title: "3. Profil Puanı (Profile Score) Kuralları",
                    content: "Profil Puanı para, elektronik para veya kripto varlık DEĞİLDİR. Doğrudan nakde çevrilemez, devredilemez veya satılamaz. Kullanıcının platform içi itibarını ve sonraki anketlerde bildirim önceliğini belirler."
                ),
                LegalSection(
                    title: "4. Anketler ve Ödüller",
                    content: "PAG anketlerine katılım ücretsizdir; herhangi bir satın alma zorunluluğu yoktur. Bazı anketlerde tanımlanan nakit ve hediye çeki ödülleri yalnızca sıralama şartlarını karşılayan kullanıcılara sunucu otoritesiyle tahsis edilir."
                ),
                LegalSection(
                    title: "5. Yasaklı Faaliyetler ve Güvenlik",
                    content: "Bot, otomatik yazılım, sahte hesap veya sahte konum kullanımı yasaktır. Hileli girişimlerde bulunan hesaplar kapatılır ve hak edilmemiş bakiyeler iptal edilir."
                ),
                LegalSection(
                    title: "6. Yürürlük ve Yetkili Mahkeme",
                    content: "İşbu Sözleşme elektronik ortamda onaylandığı anda yürürlüğe girer. Uyuşmazlıklarda İstanbul Anadolu Mahkemeleri ve İcra Daireleri yetkilidir."
                )
            ]
        case "KVKK_NOTICE":
            return [
                LegalSection(
                    title: "1. Veri Sorumlusu",
                    content: "6698 sayılı KVKK uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla Alaf Teknoloji A.Ş. tarafından yasal ilkeler doğrultusunda işlenmektedir."
                ),
                LegalSection(
                    title: "2. İşlenen Veri Kategorileri",
                    content: "Kimlik (ad, soyad, doğum tarihi), iletişim (telefon, e-posta), demografik profil verileri, tekil anket yanıtları, Profil Puanı defter kayıtları ve nakit çekimlerinde TCKN/IBAN bilgileri işlenmektedir."
                ),
                LegalSection(
                    title: "3. İşleme Amaçları ve Anonimlik",
                    content: "Verileriniz anket hedeflemelerinin belirlenmesi, hakkaniyetli bildirim sıralaması ve ödül tahsisleri için işlenir. Kurumsal müşterilere kişisel kimlik bilgileriniz ASLA aktarılmaz; yalnızca toplulaştırılmış anonim istatistikler sunulur."
                ),
                LegalSection(
                    title: "4. KVKK 11. Madde Haklarınız",
                    content: "KVKK 11. maddesi kapsamında verilerinize erişme, düzeltilmesini isteme ve silinmesini talep etme haklarına sahipsiniz. Başvurularınızı info@alafteknoloji.com adresine iletebilirsiniz."
                )
            ]
        case "REWARD_TERMS":
            return [
                LegalSection(
                    title: "1. Ödül Havuzları ve Katılım",
                    content: "Her anket nakit veya hediye çeki ödülü içermek zorunda değildir. Ödüllü anketlerde ödül türü, tutarı ve sıralama şartları anket kartında şeffafça belirtilir."
                ),
                LegalSection(
                    title: "2. Sunucu Otoritesi ve Sıralama",
                    content: "Ödül sıralamasında kullanıcının cihaz yerel saati değil, sunucuya ulaşma anındaki atomik sunucu zaman damgası esastır. Erken bildirim almak ödülü garanti etmez; tamamlama sırası belirleyicidir."
                ),
                LegalSection(
                    title: "3. Nakit Çekim ve IBAN / TCKN Şartı",
                    content: "Nakit ödül çekimlerinde asgari çekim tutarına ulaşılması, 18+ yaş şartı ve kullanıcının kendi adına kayıtlı geçerli TCKN ile TR IBAN bilgisi doğrulanması zorunludur."
                ),
                LegalSection(
                    title: "4. Hediye Çekleri",
                    content: "Tahsis edilen dijital hediye çekleri tek kullanımlık olup ilgili markanın kullanım şartlarına ve son kullanma tarihine tabidir."
                )
            ]
        case "COMMERCIAL_COMMUNICATION":
            return [
                LegalSection(
                    title: "1. İletişim İzinlerinin Niteliği",
                    content: "Ticari elektronik ileti izinleri (Push Bildirim, SMS, E-posta, Telefon) tamamen isteğe bağlıdır. İzin verilmemesi PAG üyeliğini ve anket katılımını engellemez."
                ),
                LegalSection(
                    title: "2. İptal ve Tercih Değişikliği",
                    content: "Verdiğiniz izinleri Profil > Sözleşmeler ve İzinler ekranından dilediğiniz zaman ücretsiz ve tek tıkla geri alabilirsiniz."
                )
            ]
        case "EXPLICIT_CONSENT":
            return [
                LegalSection(
                    title: "1. Açık Rıza Kapsamı",
                    content: "Açık rıza, genel aydınlatma haricinde kalan yurt dışı bulut altyapısı aktarımı ve özel ilgi alanı eşleştirmelerini kapsar. İhtiyari niteliktedir."
                )
            ]
        default:
            return [
                LegalSection(
                    title: "Yasal Bilgilendirme",
                    content: "PAG platformu Alaf Teknoloji A.Ş. tarafından işletilmektedir. Tüm hakları saklıdır."
                )
            ]
        }
    }
}

private struct BottomOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

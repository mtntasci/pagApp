package com.alafteknoloji.pagapp.ui.screens.legal

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.alafteknoloji.pagapp.models.LegalDocument
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun FullScreenDocumentReader(
    document: LegalDocument,
    isAlreadyAccepted: Boolean = false,
    onDismiss: () -> Unit,
    onAccept: (LegalDocument) -> Unit
) {
    var isAccepted by remember { mutableStateOf(isAlreadyAccepted) }
    val scrollState = rememberScrollState()

    val hasReachedBottom by remember {
        derivedStateOf {
            if (scrollState.maxValue == 0) true
            else scrollState.value >= (scrollState.maxValue - 80)
        }
    }

    val actionButtonTitle = if (document.type == "KVKK_NOTICE") {
        if (isAccepted) "Aydınlatma Metni Okundu ✓" else "Okudum ve Bilgilendirildim"
    } else {
        if (isAccepted) "Kabul Edildi ✓" else "Okudum ve Kabul Ediyorum"
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Scaffold(
            topBar = {
                Surface(
                    color = PAGTheme.colors.surfacePrimary,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = document.title,
                            style = PAGTheme.typography.heading,
                            color = PAGTheme.colors.textPrimary,
                            maxLines = 1,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = onDismiss) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Kapat",
                                tint = PAGTheme.colors.textSecondary
                            )
                        }
                    }
                }
            },
            bottomBar = {
                Surface(
                    color = PAGTheme.colors.surfacePrimary,
                    shadowElevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        if (!hasReachedBottom && !isAccepted) {
                            Text(
                                text = "↓ Lütfen metnin sonuna kadar kaydırınız",
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.brandOrange,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )
                        }

                        Button(
                            onClick = {
                                if (hasReachedBottom || isAccepted) {
                                    isAccepted = true
                                    onAccept(document)
                                    onDismiss()
                                }
                            },
                            enabled = hasReachedBottom || isAccepted,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = PAGTheme.colors.brandLime,
                                contentColor = PAGTheme.colors.brandMidnight,
                                disabledContainerColor = PAGTheme.colors.surfaceSecondary,
                                disabledContentColor = PAGTheme.colors.textMuted
                            ),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                if (isAccepted) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                }
                                Text(
                                    text = actionButtonTitle,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                            }
                        }
                    }
                }
            },
            containerColor = PAGTheme.colors.backgroundPrimary
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(scrollState)
                    .padding(20.dp)
            ) {
                // Header Info
                Text(
                    text = document.title,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = PAGTheme.colors.textPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "🏢 Alaf Teknoloji A.Ş.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textSecondary
                    )
                    Text(
                        text = "🔞 18+ Yaş Şartı",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.brandLime
                    )
                }

                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 16.dp),
                    color = PAGTheme.colors.borderDefault
                )

                // Document Sections
                val sections = getLegalSectionsForType(document.type)
                sections.forEach { section ->
                    Column(modifier = Modifier.padding(bottom = 16.dp)) {
                        Text(
                            text = section.first,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = PAGTheme.colors.brandLime
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = section.second,
                            fontSize = 14.sp,
                            color = PAGTheme.colors.textSecondary,
                            lineHeight = 22.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

private fun getLegalSectionsForType(type: String): List<Pair<String, String>> {
    return when (type) {
        "TERMS" -> listOf(
            "1. Taraflar ve Hizmetin Tanımı" to "İşbu Sözleşme, Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul adresinde mukim Alaf Teknoloji A.Ş. ile PAG mobil uygulamasını kullanan 18 yaşını doldurmuş Kullanıcı arasında akdedilmiştir.",
            "2. 18+ Yaş Zorunluluğu" to "PAG, münhasıran 18 yaş ve üzeri yetişkin bireylere yönelik bir pazar araştırması platformudur. Kullanıcı 18 yaşını doldurduğunu gayrikabili rücu taahhüt eder. 18 yaş altı hesaplar tespit edildiğinde derhal kapatılır.",
            "3. Profil Puanı (Profile Score) Kuralları" to "Profil Puanı para, elektronik para veya kripto varlık DEĞİLDİR. Doğrudan nakde çevrilemez, devredilemez veya satılamaz. Kullanıcının platform içi itibarını ve sonraki anketlerde bildirim önceliğini belirler.",
            "4. Anketler ve Ödüller" to "PAG anketlerine katılım ücretsizdir; herhangi bir satın alma zorunluluğu yoktur. Bazı anketlerde tanımlanan nakit ve hediye çeki ödülleri yalnızca sıralama şartlarını karşılayan kullanıcılara sunucu otoritesiyle tahsis edilir.",
            "5. Yasaklı Faaliyetler ve Güvenlik" to "Bot, otomatik yazılım, sahte hesap veya sahte konum kullanımı yasaktır. Hileli girişimlerde bulunan hesaplar kapatılır ve hak edilmemiş bakiyeler iptal edilir.",
            "6. Yürürlük ve Yetkili Mahkeme" to "İşbu Sözleşme elektronik ortamda onaylandığı anda yürürlüğe girer. Uyuşmazlıklarda İstanbul Anadolu Mahkemeleri ve İcra Daireleri yetkilidir."
        )
        "KVKK_NOTICE" -> listOf(
            "1. Veri Sorumlusu" to "6698 sayılı KVKK uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla Alaf Teknoloji A.Ş. tarafından yasal ilkeler doğrultusunda işlenmektedir.",
            "2. İşlenen Veri Kategorileri" to "Kimlik (ad, soyad, doğum tarihi), iletişim (telefon, e-posta), demografik profil verileri, tekil anket yanıtları, Profil Puanı defter kayıtları ve nakit çekimlerinde TCKN/IBAN bilgileri işlenmektedir.",
            "3. İşleme Amaçları ve Anonimlik" to "Verileriniz anket hedeflemelerinin belirlenmesi, hakkaniyetli bildirim sıralaması ve ödül tahsisleri için işlenir. Kurumsal müşterilere kişisel kimlik bilgileriniz ASLA aktarılmaz; yalnızca toplulaştırılmış anonim istatistikler sunulur.",
            "4. KVKK 11. Madde Haklarınız" to "KVKK 11. maddesi kapsamında verilerinize erişme, düzeltilmesini isteme ve silinmesini talep etme haklarına sahipsiniz. Başvurularınızı info@alafteknoloji.com adresine iletebilirsiniz."
        )
        "REWARD_TERMS" -> listOf(
            "1. Ödül Havuzları ve Katılım" to "Her anket nakit veya hediye çeki ödülü içermek zorunda değildir. Ödüllü anketlerde ödül türü, tutarı ve sıralama şartları anket kartında şeffafça belirtilir.",
            "2. Sunucu Otoritesi ve Sıralama" to "Ödül sıralamasında kullanıcının cihaz yerel saati değil, sunucuya ulaşma anındaki atomik sunucu zaman damgası esastır. Erken bildirim almak ödülü garanti etmez; tamamlama sırası belirleyicidir.",
            "3. Nakit Çekim ve IBAN / TCKN Şartı" to "Nakit ödül çekimlerinde asgari çekim tutarına ulaşılması, 18+ yaş şartı ve kullanıcının kendi adına kayıtlı geçerli TCKN ile TR IBAN bilgisi doğrulanması zorunludur.",
            "4. Hediye Çekleri" to "Tahsis edilen dijital hediye çekleri tek kullanımlık olup ilgili markanın kullanım şartlarına ve son kullanma tarihine tabidir."
        )
        "COMMERCIAL_COMMUNICATION" -> listOf(
            "1. İletişim İzinlerinin Niteliği" to "Ticari elektronik ileti izinleri (Push Bildirim, SMS, E-posta, Telefon) tamamen isteğe bağlıdır. İzin verilmemesi PAG üyeliğini ve anket katılımını engellemez.",
            "2. İptal ve Tercih Değişikliği" to "Verdiğiniz izinleri Profil > Sözleşmeler ve İzinler ekranından dilediğiniz zaman ücretsiz ve tek tıkla geri alabilirsiniz."
        )
        "EXPLICIT_CONSENT" -> listOf(
            "1. Açık Rıza Kapsamı" to "Açık rıza, genel aydınlatma haricinde kalan yurt dışı bulut altyapısı aktarımı ve özel ilgi alanı eşleştirmelerini kapsar. İhtiyari niteliktedir."
        )
        else -> listOf(
            "Yasal Bilgilendirme" to "PAG platformu Alaf Teknoloji A.Ş. tarafından işletilmektedir. Tüm hakları saklıdır."
        )
    }
}

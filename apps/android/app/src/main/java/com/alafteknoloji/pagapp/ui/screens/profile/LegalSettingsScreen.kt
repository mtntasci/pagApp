package com.alafteknoloji.pagapp.ui.screens.profile

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationManagerCompat
import com.alafteknoloji.pagapp.models.CommunicationPreferences
import com.alafteknoloji.pagapp.models.LegalDocument
import com.alafteknoloji.pagapp.services.LegalService
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.ui.screens.legal.CommercialSwitchRow
import com.alafteknoloji.pagapp.ui.screens.legal.FullScreenDocumentReader
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import kotlinx.coroutines.launch

@Composable
fun LegalSettingsScreen(
    userService: UserService,
    onBack: () -> Unit,
    legalService: LegalService = remember { LegalService() }
) {
    val context = LocalContext.current
    val currentUser by userService.currentUser.collectAsState()
    val scope = rememberCoroutineScope()

    var pushMarketing by remember { mutableStateOf(currentUser?.communicationPreferences?.pushMarketing ?: false) }
    var smsMarketing by remember { mutableStateOf(currentUser?.communicationPreferences?.smsMarketing ?: false) }
    var emailMarketing by remember { mutableStateOf(currentUser?.communicationPreferences?.emailMarketing ?: false) }
    var phoneMarketing by remember { mutableStateOf(currentUser?.communicationPreferences?.phoneMarketing ?: false) }

    var selectedDocumentForReading by remember { mutableStateOf<LegalDocument?>(null) }
    var activeDocumentsList by remember { mutableStateOf<List<LegalDocument>>(emptyList()) }

    val areNotificationsEnabled = remember {
        NotificationManagerCompat.from(context).areNotificationsEnabled()
    }

    LaunchedEffect(Unit) {
        val docs = legalService.getActiveLegalDocuments()
        activeDocumentsList = docs
    }

    fun savePreferences() {
        val prefs = CommunicationPreferences(
            pushMarketing = pushMarketing,
            smsMarketing = smsMarketing,
            emailMarketing = emailMarketing,
            phoneMarketing = phoneMarketing
        )
        scope.launch {
            legalService.updateCommunicationPreferences(prefs)
            userService.updateCommunicationPreferencesState(prefs)
        }
    }

    val displayDocs = remember(activeDocumentsList) {
        if (activeDocumentsList.isNotEmpty()) activeDocumentsList
        else listOf(
            LegalDocument("TERMS", "TERMS", "1.0", "Kullanım Koşulları ve Üyelik Sözleşmesi", "https://www.pagapp.com.tr/terms", "", true),
            LegalDocument("KVKK_NOTICE", "KVKK_NOTICE", "1.0", "KVKK ve Kullanıcı Gizliliği Aydınlatma Metni", "https://www.pagapp.com.tr/user-privacy", "", true),
            LegalDocument("REWARD_TERMS", "REWARD_TERMS", "1.0", "Ödül ve Kampanya Katılım Koşulları", "https://www.pagapp.com.tr/reward-terms", "", true),
            LegalDocument("COMMERCIAL_COMMUNICATION", "COMMERCIAL_COMMUNICATION", "1.0", "Ticari Elektronik İleti İzni", "https://www.pagapp.com.tr/commercial-communication", "", false),
            LegalDocument("EXPLICIT_CONSENT", "EXPLICIT_CONSENT", "1.0", "Açık Rıza Metni", "https://www.pagapp.com.tr/explicit-consent", "", false),
            LegalDocument("PRIVACY_POLICY", "PRIVACY_POLICY", "1.0", "PAG Gizlilik Politikası", "https://www.pagapp.com.tr/privacy", "", false),
            LegalDocument("AGE_SUITABILITY", "AGE_SUITABILITY", "1.0", "18+ Yaş Uygunluğu Bildirimi", "https://www.pagapp.com.tr/age-suitability", "", false)
        )
    }

    Scaffold(
        topBar = {
            Surface(
                color = PAGTheme.colors.surfacePrimary,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Geri",
                            tint = PAGTheme.colors.textPrimary
                        )
                    }
                    Text(
                        text = "Sözleşmeler ve İzinler",
                        style = PAGTheme.typography.heading,
                        color = PAGTheme.colors.textPrimary
                    )
                }
            }
        },
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Notification warning if push marketing is ON but Android notification is disabled
            if (pushMarketing && !areNotificationsEnabled) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = PAGTheme.colors.surfacePrimary),
                    border = BorderStroke(1.dp, PAGTheme.colors.borderDefault),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = PAGTheme.colors.brandOrange
                            )
                            Text(
                                text = "Cihaz Bildirim İzni Kapalı",
                                style = PAGTheme.typography.body,
                                fontWeight = FontWeight.Bold,
                                color = PAGTheme.colors.textPrimary
                            )
                        }

                        Text(
                            text = "PAG içinde anlık bildirimleri açtınız, ancak Android cihaz ayarlarından PAG bildirimlerine izin verilmemiş görünüyor. Fırsat bildirimlerini alabilmek için lütfen sistem ayarlarını açınız.",
                            style = PAGTheme.typography.caption,
                            color = PAGTheme.colors.textSecondary,
                            lineHeight = 18.sp
                        )

                        Button(
                            onClick = {
                                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                                    data = Uri.fromParts("package", context.packageName, null)
                                }
                                context.startActivity(intent)
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = PAGTheme.colors.brandLime,
                                contentColor = PAGTheme.colors.brandMidnight
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.padding(top = 4.dp)
                        ) {
                            Text(
                                text = "Sistem Ayarlarını Aç",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }

            // 1. Commercial Communication Channels
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Column {
                    Text(
                        text = "Ticari İletişim Tercihleri",
                        style = PAGTheme.typography.heading,
                        color = PAGTheme.colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Pazarlama ve anket bilgilendirme kanallarınızı dilediğiniz an açıp kapatabilirsiniz.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textSecondary
                    )
                }

                Card(
                    colors = CardDefaults.cardColors(containerColor = PAGTheme.colors.surfacePrimary),
                    shape = RoundedCornerShape(14.dp),
                    border = BorderStroke(1.dp, PAGTheme.colors.borderDefault)
                ) {
                    Column {
                        CommercialSwitchRow(
                            title = "Push Bildirimleri",
                            subtitle = "Mobil anlık kampanya ve fırsat bildirimleri",
                            checked = pushMarketing,
                            onCheckedChange = {
                                pushMarketing = it
                                savePreferences()
                            }
                        )
                        HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = PAGTheme.colors.borderDefault)

                        CommercialSwitchRow(
                            title = "SMS ile Bildirim",
                            subtitle = "Kısa mesaj ile önemli fırsat ve davetler",
                            checked = smsMarketing,
                            onCheckedChange = {
                                smsMarketing = it
                                savePreferences()
                            }
                        )
                        HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = PAGTheme.colors.borderDefault)

                        CommercialSwitchRow(
                            title = "E-Posta ile Bülten",
                            subtitle = "Haftalık anket ve ödül özetleri",
                            checked = emailMarketing,
                            onCheckedChange = {
                                emailMarketing = it
                                savePreferences()
                            }
                        )
                        HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = PAGTheme.colors.borderDefault)

                        CommercialSwitchRow(
                            title = "Telefon ile İletişim",
                            subtitle = "Özel araştırma davetleri",
                            checked = phoneMarketing,
                            onCheckedChange = {
                                phoneMarketing = it
                                savePreferences()
                            }
                        )
                    }
                }
            }

            // 2. Legal Documents & Contracts
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Column {
                    Text(
                        text = "Sözleşmeler ve Yasal Metinler",
                        style = PAGTheme.typography.heading,
                        color = PAGTheme.colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "PAG platformunun geçerli yasal belgelerini inceleyebilirsiniz.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textSecondary
                    )
                }

                displayDocs.forEach { doc ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(PAGTheme.colors.surfacePrimary)
                            .border(1.dp, PAGTheme.colors.borderDefault, RoundedCornerShape(12.dp))
                            .clickable { selectedDocumentForReading = doc }
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = PAGTheme.colors.brandLime,
                            modifier = Modifier.size(20.dp)
                        )

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = doc.title,
                                style = PAGTheme.typography.body,
                                fontWeight = FontWeight.SemiBold,
                                color = PAGTheme.colors.textPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Sürüm: v${doc.version}",
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.textSecondary
                            )
                        }

                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = null,
                            tint = PAGTheme.colors.textSecondary
                        )
                    }
                }
            }
        }
    }

    selectedDocumentForReading?.let { doc ->
        FullScreenDocumentReader(
            document = doc,
            isAlreadyAccepted = true,
            onDismiss = { selectedDocumentForReading = null },
            onAccept = {}
        )
    }
}

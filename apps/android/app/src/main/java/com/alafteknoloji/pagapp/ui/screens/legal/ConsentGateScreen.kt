package com.alafteknoloji.pagapp.ui.screens.legal

import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.models.CommunicationPreferences
import com.alafteknoloji.pagapp.models.LegalDocument
import com.alafteknoloji.pagapp.services.LegalService
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import kotlinx.coroutines.launch

@Composable
fun ConsentGateScreen(
    userService: UserService,
    legalService: LegalService = remember { LegalService() }
) {
    val currentUser by userService.currentUser.collectAsState()
    val scope = rememberCoroutineScope()

    // Local accepted documents map during the gate flow
    var acceptedDocs by remember { mutableStateOf<Map<String, LegalDocument>>(emptyMap()) }

    // Optional marketing switches (defaults to FALSE)
    var pushMarketing by remember { mutableStateOf(false) }
    var smsMarketing by remember { mutableStateOf(false) }
    var emailMarketing by remember { mutableStateOf(false) }
    var phoneMarketing by remember { mutableStateOf(false) }

    var selectedDocumentForReading by remember { mutableStateOf<LegalDocument?>(null) }
    var isSubmitting by remember { mutableStateOf(false) }
    var submissionError by remember { mutableStateOf<String?>(null) }
    var activeDocumentsList by remember { mutableStateOf<List<LegalDocument>>(emptyList()) }

    // Android 13+ Notification Permission Launcher
    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { _ ->
            // Permission result handled
        }
    )

    LaunchedEffect(Unit) {
        val docs = legalService.getActiveLegalDocuments()
        activeDocumentsList = docs
    }

    val requiredDocuments = remember(currentUser, activeDocumentsList) {
        if (!currentUser?.missingDocuments.isNullOrEmpty()) {
            currentUser?.missingDocuments ?: emptyList()
        } else if (activeDocumentsList.isNotEmpty()) {
            activeDocumentsList.filter { it.isRequired }
        } else {
            listOf(
                LegalDocument("TERMS", "TERMS", "1.0", "Kullanım Koşulları ve Üyelik Sözleşmesi", "https://www.pagapp.com.tr/terms", "PAG_TERMS_V1.0", true),
                LegalDocument("KVKK_NOTICE", "KVKK_NOTICE", "1.0", "Kullanıcı Gizliliği ve KVKK Aydınlatma Metni", "https://www.pagapp.com.tr/user-privacy", "PAG_KVKK_NOTICE_V1.0", true),
                LegalDocument("REWARD_TERMS", "REWARD_TERMS", "1.0", "Ödül ve Kampanya Katılım Koşulları", "https://www.pagapp.com.tr/reward-terms", "PAG_REWARD_TERMS_V1.0", true)
            )
        }
    }

    val areAllRequiredDocsAccepted = remember(requiredDocuments, acceptedDocs) {
        requiredDocuments.isNotEmpty() && requiredDocuments.all { acceptedDocs.containsKey(it.documentId) }
    }

    Scaffold(
        topBar = {
            Surface(
                color = PAGTheme.colors.surfacePrimary,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "PAG YASAL ONAYLAR",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = PAGTheme.colors.brandLime
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Sözleşmeler ve İzinler",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Black,
                                color = PAGTheme.colors.textPrimary
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = null,
                            tint = PAGTheme.colors.brandLime,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "PAG deneyiminize başlamadan önce yasal sözleşmeleri incelemeniz ve iletişim tercihlerinizi belirlemeniz gerekmektedir.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textSecondary,
                        lineHeight = 18.sp
                    )
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
                        .padding(16.dp)
                ) {
                    Button(
                        onClick = {
                            if (areAllRequiredDocsAccepted && !isSubmitting) {
                                isSubmitting = true
                                submissionError = null
                                scope.launch {
                                    val commPrefs = CommunicationPreferences(
                                        pushMarketing = pushMarketing,
                                        smsMarketing = smsMarketing,
                                        emailMarketing = emailMarketing,
                                        phoneMarketing = phoneMarketing
                                    )
                                    val success = legalService.recordLegalAcceptances(
                                        acceptedDocuments = acceptedDocs.values.toList(),
                                        preferences = commPrefs
                                    )
                                    if (success) {
                                        // Request native Android 13+ push permission only if push marketing is chosen
                                        if (pushMarketing && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                            notificationPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                                        }
                                        userService.completeLegalConsent(commPrefs)
                                    } else {
                                        submissionError = "Sözleşmeler kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz."
                                    }
                                    isSubmitting = false
                                }
                            }
                        },
                        enabled = areAllRequiredDocsAccepted && !isSubmitting,
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
                        if (isSubmitting) {
                            CircularProgressIndicator(
                                color = PAGTheme.colors.brandMidnight,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Text(
                                text = "Onayla ve Devam Et",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                    }
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
            // 1. Required Legal Documents Section
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Zorunlu Sözleşme ve Metinler",
                        style = PAGTheme.typography.heading,
                        color = PAGTheme.colors.textPrimary
                    )
                    Text(
                        text = "${acceptedDocs.size}/${requiredDocuments.size} Okundu",
                        style = PAGTheme.typography.caption,
                        color = if (areAllRequiredDocsAccepted) PAGTheme.colors.brandLime else PAGTheme.colors.textSecondary,
                        fontWeight = FontWeight.Bold
                    )
                }

                requiredDocuments.forEach { doc ->
                    val isDocAccepted = acceptedDocs.containsKey(doc.documentId)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(PAGTheme.colors.surfacePrimary)
                            .border(
                                width = 1.dp,
                                color = if (isDocAccepted) PAGTheme.colors.brandLime.copy(alpha = 0.4f) else PAGTheme.colors.borderDefault,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .clickable { selectedDocumentForReading = doc }
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(if (isDocAccepted) PAGTheme.colors.brandLime.copy(alpha = 0.2f) else PAGTheme.colors.surfaceSecondary),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isDocAccepted) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    tint = PAGTheme.colors.brandLime,
                                    modifier = Modifier.size(18.dp)
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Info,
                                    contentDescription = null,
                                    tint = PAGTheme.colors.brandOrange,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = doc.title,
                                style = PAGTheme.typography.body,
                                fontWeight = FontWeight.SemiBold,
                                color = PAGTheme.colors.textPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = if (isDocAccepted) "Kabul Edildi" else "Okunması Zorunlu",
                                    style = PAGTheme.typography.caption,
                                    color = if (isDocAccepted) PAGTheme.colors.brandLime else PAGTheme.colors.brandOrange,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = "• v${doc.version}",
                                    style = PAGTheme.typography.caption,
                                    color = PAGTheme.colors.textMuted
                                )
                            }
                        }

                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = null,
                            tint = PAGTheme.colors.textSecondary
                        )
                    }
                }
            }

            // 2. Optional Commercial Communication Section
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Column {
                    Text(
                        text = "İletişim Tercihleri (İsteğe Bağlı)",
                        style = PAGTheme.typography.heading,
                        color = PAGTheme.colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Kampanya, fırsat ve anket duyurularını almak istediğiniz kanalları seçebilirsiniz.",
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
                            onCheckedChange = { pushMarketing = it }
                        )
                        HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = PAGTheme.colors.borderDefault)

                        CommercialSwitchRow(
                            title = "SMS ile Bildirim",
                            subtitle = "Kısa mesaj ile özel anket ve kampanya duyuruları",
                            checked = smsMarketing,
                            onCheckedChange = { smsMarketing = it }
                        )
                        HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = PAGTheme.colors.borderDefault)

                        CommercialSwitchRow(
                            title = "E-Posta ile Bülten",
                            subtitle = "Haftalık fırsatlar ve anket özetleri",
                            checked = emailMarketing,
                            onCheckedChange = { emailMarketing = it }
                        )
                        HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = PAGTheme.colors.borderDefault)

                        CommercialSwitchRow(
                            title = "Telefon ile İletişim",
                            subtitle = "Özel araştırma davetleri ve bilgilendirme",
                            checked = phoneMarketing,
                            onCheckedChange = { phoneMarketing = it }
                        )
                    }
                }
            }

            // Error display
            if (submissionError != null) {
                Text(
                    text = submissionError ?: "",
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.brandOrange
                )
            }
        }
    }

    // Document Reader Dialog
    selectedDocumentForReading?.let { doc ->
        FullScreenDocumentReader(
            document = doc,
            isAlreadyAccepted = acceptedDocs.containsKey(doc.documentId),
            onDismiss = { selectedDocumentForReading = null },
            onAccept = { acceptedDoc ->
                acceptedDocs = acceptedDocs + (acceptedDoc.documentId to acceptedDoc)
            }
        )
    }
}

@Composable
fun CommercialSwitchRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = PAGTheme.typography.body,
                fontWeight = FontWeight.SemiBold,
                color = PAGTheme.colors.textPrimary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = PAGTheme.typography.caption,
                color = PAGTheme.colors.textSecondary
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = PAGTheme.colors.brandMidnight,
                checkedTrackColor = PAGTheme.colors.brandLime,
                uncheckedThumbColor = PAGTheme.colors.textMuted,
                uncheckedTrackColor = PAGTheme.colors.surfaceSecondary
            )
        )
    }
}

package com.alafteknoloji.pagapp.ui.screens.legal

import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConsentGateScreen(
    userService: UserService? = null,
    legalService: LegalService = remember { LegalService() },
    onConsentApproved: (() -> Unit)? = null,
    onDismiss: (() -> Unit)? = null
) {
    val currentUser by userService?.currentUser?.collectAsState() ?: remember { mutableStateOf(null) }
    val scope = rememberCoroutineScope()

    // Local accepted documents map during the gate flow
    var acceptedDocs by remember { mutableStateOf<Map<String, LegalDocument>>(emptyMap()) }

    // Unified commercial communication permission
    var allowCommunication by remember { mutableStateOf(false) }

    // 18+ Age & Birth Year Verification
    val currentYear = remember { Calendar.getInstance().get(Calendar.YEAR) }
    val availableYears = remember { (1940..(currentYear - 18)).reversed().toList() }
    var selectedBirthYear by remember { mutableStateOf(2000) }
    var isAgeConfirmed by remember { mutableStateOf(false) }
    var yearDropdownExpanded by remember { mutableStateOf(false) }

    var selectedDocumentForReading by remember { mutableStateOf<LegalDocument?>(null) }
    var isSubmitting by remember { mutableStateOf(false) }
    var submissionError by remember { mutableStateOf<String?>(null) }
    var activeDocumentsList by remember { mutableStateOf<List<LegalDocument>>(emptyList()) }

    // Android 13+ Notification Permission Launcher
    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { _ -> }
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

    val isFormValid = areAllRequiredDocsAccepted && isAgeConfirmed && !isSubmitting

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
                        if (onDismiss != null) {
                            IconButton(onClick = onDismiss) {
                                Icon(
                                    imageVector = Icons.Default.Info,
                                    contentDescription = "Kapat",
                                    tint = PAGTheme.colors.textSecondary
                                )
                            }
                        } else {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                tint = PAGTheme.colors.brandLime,
                                modifier = Modifier.size(32.dp)
                            )
                        }
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
                            if (isFormValid) {
                                isSubmitting = true
                                submissionError = null
                                scope.launch {
                                    val commPrefs = CommunicationPreferences(
                                        pushMarketing = false,
                                        smsMarketing = allowCommunication,
                                        emailMarketing = allowCommunication,
                                        phoneMarketing = allowCommunication
                                    )
                                    if (userService != null && userService.currentUser.value != null) {
                                        val success = legalService.recordLegalAcceptances(
                                            acceptedDocuments = acceptedDocs.values.toList(),
                                            preferences = commPrefs,
                                            birthYear = selectedBirthYear
                                        )
                                        if (success) {
                                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                                notificationPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                                            }
                                            userService.completeLegalConsent(commPrefs)
                                            onConsentApproved?.invoke()
                                            onDismiss?.invoke()
                                        } else {
                                            submissionError = "Sözleşmeler kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz."
                                        }
                                    } else {
                                        onConsentApproved?.invoke()
                                        onDismiss?.invoke()
                                    }
                                    isSubmitting = false
                                }
                            }
                        },
                        enabled = isFormValid,
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
                            tint = PAGTheme.colors.textMuted
                        )
                    }
                }
            }

            // 2. 18+ Age & Birth Year Verification
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(PAGTheme.colors.surfacePrimary)
                    .border(
                        1.dp,
                        if (isAgeConfirmed) PAGTheme.colors.brandLime.copy(alpha = 0.4f) else PAGTheme.colors.borderDefault,
                        RoundedCornerShape(14.dp)
                    )
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "18+ Yaş Uygunluğu ve Doğum Yılı",
                    style = PAGTheme.typography.heading,
                    color = PAGTheme.colors.textPrimary
                )
                Text(
                    text = "PAG platformunda nakit ve hediye çeki para ödülleri dağıtıldığından yasal olarak 18 yaşından büyük olmanız gerekmektedir.",
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.textSecondary
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Doğum Yılınız:",
                        style = PAGTheme.typography.body,
                        color = PAGTheme.colors.textPrimary
                    )

                    Box {
                        Button(
                            onClick = { yearDropdownExpanded = true },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = PAGTheme.colors.surfaceSecondary,
                                contentColor = PAGTheme.colors.brandLime
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(text = selectedBirthYear.toString(), fontWeight = FontWeight.Bold)
                        }

                        DropdownMenu(
                            expanded = yearDropdownExpanded,
                            onDismissRequest = { yearDropdownExpanded = false }
                        ) {
                            availableYears.forEach { year ->
                                DropdownMenuItem(
                                    text = { Text(text = year.toString()) },
                                    onClick = {
                                        selectedBirthYear = year
                                        yearDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }

                Divider(color = PAGTheme.colors.borderDefault)

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { isAgeConfirmed = !isAgeConfirmed },
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Checkbox(
                        checked = isAgeConfirmed,
                        onCheckedChange = { isAgeConfirmed = it },
                        colors = CheckboxDefaults.colors(
                            checkedColor = PAGTheme.colors.brandLime,
                            checkmarkColor = PAGTheme.colors.brandMidnight
                        )
                    )
                    Text(
                        text = "18 yaşından büyük olduğumu ve ödül kazanımı için doğum yılımın doğruluğunu beyan ederim.",
                        style = PAGTheme.typography.body,
                        color = PAGTheme.colors.textPrimary,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }

            // 3. Commercial Communication Channels (Unified single toggle)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "İletişim Tercihleri (İsteğe Bağlı)",
                    style = PAGTheme.typography.heading,
                    color = PAGTheme.colors.textPrimary
                )
                Text(
                    text = "Kampanya, fırsat ve anket duyurularını almak istediğiniz kanalları seçebilirsiniz. İstediğiniz zaman ayarlardan değiştirebilirsiniz.",
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.textSecondary
                )

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(PAGTheme.colors.surfacePrimary)
                        .border(1.dp, PAGTheme.colors.borderDefault, RoundedCornerShape(14.dp))
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = null,
                            tint = if (allowCommunication) PAGTheme.colors.brandLime else PAGTheme.colors.textSecondary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "İletişime İzin Veriyorum",
                                style = PAGTheme.typography.body,
                                fontWeight = FontWeight.Bold,
                                color = PAGTheme.colors.textPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Sms, E-Posta ve Telefon ile Fırsat, Bildirim almayı kabul ediyorum",
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.textSecondary
                            )
                        }
                        Switch(
                            checked = allowCommunication,
                            onCheckedChange = { allowCommunication = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = PAGTheme.colors.brandMidnight,
                                checkedTrackColor = PAGTheme.colors.brandLime
                            )
                        )
                    }
                }
            }

            if (submissionError != null) {
                Surface(
                    color = PAGTheme.colors.brandOrange.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = submissionError ?: "",
                        color = PAGTheme.colors.brandOrange,
                        style = PAGTheme.typography.body,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }
        }
    }

    selectedDocumentForReading?.let { doc ->
        FullScreenDocumentReader(
            document = doc,
            isAlreadyAccepted = acceptedDocs.containsKey(doc.documentId),
            onDismiss = { selectedDocumentForReading = null },
            onAccept = { acceptedDoc ->
                acceptedDocs = acceptedDocs + (acceptedDoc.documentId to acceptedDoc)
                selectedDocumentForReading = null
            }
        )
    }
}

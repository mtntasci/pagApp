package com.alafteknoloji.pagapp.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.models.*
import com.alafteknoloji.pagapp.services.BasicProfileService
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BasicProfileScreen(
    onNavigateBack: () -> Unit = {}
) {
    val context = LocalContext.current
    val service = remember { BasicProfileService(context) }
    val scope = rememberCoroutineScope()

    val profileState by service.basicProfile.collectAsState()
    val locationsState by service.locations.collectAsState()
    val isSaving by service.isSaving.collectAsState()
    val successMsg by service.saveSuccessMessage.collectAsState()
    val errorMsg by service.errorMessage.collectAsState()

    var draftProfile by remember { mutableStateOf(PAGBasicProfile()) }

    LaunchedEffect(Unit) {
        service.fetchBasicProfile()
    }

    LaunchedEffect(profileState) {
        draftProfile = profileState
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Temel Profil", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Geri", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF011033))
            )
        },
        containerColor = Color(0xFF011033)
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Progress Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0A1B44)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Temel Profil Tamamlanma", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("%${draftProfile.completionPercentage}", color = Color(0xFFB7F34A), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }

                    LinearProgressIndicator(
                        progress = { draftProfile.completionPercentage / 100f },
                        modifier = Modifier.fillMaxWidth().height(10.dp),
                        color = Color(0xFFB7F34A),
                        trackColor = Color.White.copy(alpha = 0.1f)
                    )

                    if (draftProfile.scoreAwarded) {
                        Text("✓ 100 Profil Puanı Kazanıldı", color = Color(0xFFB7F34A), fontSize = 12.sp)
                    } else {
                        Text("Profilinizi %100 tamamlayın, +100 Profil Puanı kazanın!", color = Color.Gray, fontSize = 12.sp)
                    }
                }
            }

            // Success / Error Banners
            successMsg?.let {
                Text(it, color = Color(0xFF12B76A), fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
            errorMsg?.let {
                Text(it, color = Color(0xFFF04438), fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }

            // 1. Birth Details
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0A1B44)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("1. Doğum Bilgileri", color = Color(0xFFB7F34A), fontWeight = FontWeight.Bold, fontSize = 16.sp)

                    OutlinedTextField(
                        value = draftProfile.birthDetails.birthDate,
                        onValueChange = { newDate ->
                            draftProfile = draftProfile.copy(birthDetails = draftProfile.birthDetails.copy(birthDate = newDate))
                        },
                        label = { Text("Doğum Tarihi (YYYY-MM-DD)", color = Color.Gray) },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text("Doğum Yeri (İl / İlçe)", color = Color.White, fontSize = 14.sp)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = draftProfile.birthDetails.cityName,
                            onValueChange = { cName ->
                                draftProfile = draftProfile.copy(birthDetails = draftProfile.birthDetails.copy(cityName = cName, cityId = "34"))
                            },
                            label = { Text("İl (Örn: İstanbul)", color = Color.Gray) },
                            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = draftProfile.birthDetails.districtName,
                            onValueChange = { dName ->
                                draftProfile = draftProfile.copy(birthDetails = draftProfile.birthDetails.copy(districtName = dName, districtId = "3401"))
                            },
                            label = { Text("İlçe (Örn: Kadıköy)", color = Color.Gray) },
                            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // 2. Marital Status
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0A1B44)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("2. Medeni Durum", color = Color(0xFFB7F34A), fontWeight = FontWeight.Bold, fontSize = 16.sp)

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("SINGLE" to "Bekar", "MARRIED" to "Evli", "DIVORCED" to "Boşanmış").forEach { (code, label) ->
                            FilterChip(
                                selected = draftProfile.maritalStatus == code,
                                onClick = { draftProfile = draftProfile.copy(maritalStatus = code) },
                                label = { Text(label, color = if (draftProfile.maritalStatus == code) Color.Black else Color.White) },
                                colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Color(0xFFB7F34A))
                            )
                        }
                    }
                }
            }

            // Save Button
            Button(
                onClick = {
                    scope.launch {
                        service.saveBasicProfile(draftProfile)
                    }
                },
                enabled = !isSaving,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFB7F34A)),
                shape = RoundedCornerShape(12.dp)
            ) {
                if (isSaving) {
                    CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(24.dp))
                } else {
                    Text("Temel Profili Kaydet", color = Color(0xFF011033), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }
        }
    }
}

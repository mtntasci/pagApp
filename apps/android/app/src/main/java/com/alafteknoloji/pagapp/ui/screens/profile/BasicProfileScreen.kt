package com.alafteknoloji.pagapp.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.draw.clip
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.DateRange
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
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
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

    var currentStep by remember { mutableStateOf(1) } // 1..5
    var draftProfile by remember { mutableStateOf(PAGBasicProfile()) }
    var inlineErrorMsg by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        service.fetchBasicProfile()
    }

    LaunchedEffect(profileState) {
        draftProfile = profileState
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Temel Profil Düzenle", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PAGTheme.colors.backgroundPrimary)
            )
        },
        bottomBar = {
            // Bottom Action Navigation Bar (Safe Area Aware)
            Surface(
                color = PAGTheme.colors.surfacePrimary,
                tonalElevation = 8.dp,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = PAGTheme.spacing.md, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (currentStep > 1) {
                        OutlinedButton(
                            onClick = {
                                inlineErrorMsg = null
                                currentStep -= 1
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(PAGTheme.colors.borderDefault))
                        ) {
                            Text("Geri", color = PAGTheme.colors.textPrimary, fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = {
                            inlineErrorMsg = null
                            if (currentStep == 1) {
                                if (draftProfile.birthDetails.birthDate.isEmpty()) { inlineErrorMsg = "Lütfen doğum tarihinizi seçiniz."; return@Button }
                                if (draftProfile.birthDetails.cityId.isEmpty()) { inlineErrorMsg = "Lütfen doğum yeri ilini seçiniz."; return@Button }
                                if (draftProfile.birthDetails.districtId.isEmpty()) { inlineErrorMsg = "Lütfen doğum yeri ilçesini seçiniz."; return@Button }
                            } else if (currentStep == 2) {
                                if (draftProfile.maritalStatus.isEmpty()) { inlineErrorMsg = "Lütfen medeni durumunuzu seçiniz."; return@Button }
                            } else if (currentStep == 3) {
                                if (draftProfile.childrenInfo.hasChildren && draftProfile.childrenInfo.children.isEmpty()) {
                                    inlineErrorMsg = "Lütfen çocuk detaylarını doldurunuz."; return@Button
                                }
                            } else if (currentStep == 4) {
                                if (draftProfile.residenceAddress.cityId.isEmpty() || draftProfile.residenceAddress.districtId.isEmpty() || (draftProfile.residenceAddress.neighborhoodId ?: "").isEmpty()) {
                                    inlineErrorMsg = "Lütfen ikametgah il, ilçe ve mahalle seçiniz."; return@Button
                                }
                            } else if (currentStep == 5) {
                                if (draftProfile.hometown.cityId.isEmpty() || draftProfile.hometown.districtId.isEmpty()) {
                                    inlineErrorMsg = "Lütfen memleket il ve ilçesini seçiniz."; return@Button
                                }

                                scope.launch {
                                    val ok = service.saveBasicProfile(draftProfile)
                                    if (ok) {
                                        onNavigateBack()
                                    }
                                }
                                return@Button
                            }

                            currentStep += 1
                        },
                        enabled = !isSaving,
                        modifier = Modifier
                            .weight(1f)
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.brandLime),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (isSaving) {
                            CircularProgressIndicator(color = PAGTheme.colors.brandMidnight, modifier = Modifier.size(24.dp))
                        } else {
                            Text(
                                text = if (currentStep == 5) "Temel Profili Kaydet" else "Devam Et",
                                color = PAGTheme.colors.brandMidnight,
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
                .padding(innerPadding)
                .fillMaxSize()
        ) {
            // Top Step Progress Indicator Bar
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PAGTheme.colors.surfacePrimary)
                    .padding(PAGTheme.spacing.md),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (!draftProfile.scoreAwarded) {
                    Row(
                        modifier = Modifier
                            .background(PAGTheme.colors.brandLime.copy(alpha = 0.12f), RoundedCornerShape(20.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("⚡ Temel profilini tamamla, +100 Profil Puanı kazan!", color = PAGTheme.colors.brandLime, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Adım $currentStep / 5", color = PAGTheme.colors.textMuted, fontSize = 12.sp)
                        Text(
                            text = when (currentStep) {
                                1 -> "Doğum Bilgileri"
                                2 -> "Medeni Durum"
                                3 -> "Çocuk Bilgileri"
                                4 -> "İkametgah Adresi"
                                5 -> "Memleket Bilgisi"
                                else -> ""
                            },
                            style = PAGTheme.typography.heading,
                            color = PAGTheme.colors.textPrimary
                        )
                    }

                    // 5 Step Dots
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        (1..5).forEach { idx ->
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(if (idx <= currentStep) PAGTheme.colors.brandLime else Color.White.copy(alpha = 0.2f))
                            )
                        }
                    }
                }
            }

            HorizontalDivider(color = PAGTheme.colors.borderDefault)

            // Step Content ScrollView
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(PAGTheme.spacing.md),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                inlineErrorMsg?.let { err ->
                    Text(err, color = PAGTheme.colors.error, fontSize = 13.sp, modifier = Modifier.background(PAGTheme.colors.error.copy(alpha = 0.15f), RoundedCornerShape(8.dp)).padding(12.dp).fillMaxWidth())
                }

                when (currentStep) {
                    1 -> Step1BirthDetails(draftProfile, locationsState) { updated -> draftProfile = updated }
                    2 -> Step2MaritalStatus(draftProfile) { updated -> draftProfile = updated }
                    3 -> Step3ChildrenInfo(draftProfile) { updated -> draftProfile = updated }
                    4 -> Step4ResidenceAddress(draftProfile, locationsState) { updated -> draftProfile = updated }
                    5 -> Step5Hometown(draftProfile, locationsState) { updated -> draftProfile = updated }
                }
            }
        }
    }
}

// --------------------------------------------------
// STEP 1: DOĞUM BİLGİLERİ
// --------------------------------------------------
@Composable
private fun Step1BirthDetails(profile: PAGBasicProfile, locations: List<PAGCity>, onUpdate: (PAGBasicProfile) -> Unit) {
    var cityExpanded by remember { mutableStateOf(false) }
    var districtExpanded by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Doğum Tarihi", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            OutlinedTextField(
                value = profile.birthDetails.birthDate,
                onValueChange = { newDate ->
                    onUpdate(profile.copy(birthDetails = profile.birthDetails.copy(birthDate = newDate)))
                },
                placeholder = { Text("YYYY-MM-DD (Örn: 1990-05-15)", color = PAGTheme.colors.textMuted) },
                trailingIcon = { Icon(Icons.Default.DateRange, contentDescription = null, tint = PAGTheme.colors.brandLime) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedContainerColor = PAGTheme.colors.surfacePrimary,
                    unfocusedContainerColor = PAGTheme.colors.surfacePrimary,
                    focusedBorderColor = PAGTheme.colors.brandLime,
                    unfocusedBorderColor = PAGTheme.colors.borderDefault
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Doğum Yeri (İl)", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = profile.birthDetails.cityName.ifEmpty { "İl Seçiniz" },
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = PAGTheme.colors.textMuted) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedContainerColor = PAGTheme.colors.surfacePrimary,
                        unfocusedContainerColor = PAGTheme.colors.surfacePrimary
                    ),
                    modifier = Modifier.fillMaxWidth().clickable { cityExpanded = true }
                )
                DropdownMenu(expanded = cityExpanded, onDismissRequest = { cityExpanded = false }) {
                    locations.forEach { city ->
                        DropdownMenuItem(
                            text = { Text(city.name, color = Color.Black) },
                            onClick = {
                                onUpdate(profile.copy(birthDetails = profile.birthDetails.copy(cityId = city.id, cityName = city.name, districtId = "", districtName = "")))
                                cityExpanded = false
                            }
                        )
                    }
                }
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Doğum Yeri (İlçe)", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            val currentDistricts = locations.firstOrNull { it.id == profile.birthDetails.cityId }?.districts ?: emptyList()

            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = profile.birthDetails.districtName.ifEmpty { "İlçe Seçiniz" },
                    onValueChange = {},
                    readOnly = true,
                    enabled = profile.birthDetails.cityId.isNotEmpty(),
                    trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = PAGTheme.colors.textMuted) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedContainerColor = PAGTheme.colors.surfacePrimary,
                        unfocusedContainerColor = PAGTheme.colors.surfacePrimary
                    ),
                    modifier = Modifier.fillMaxWidth().clickable(enabled = profile.birthDetails.cityId.isNotEmpty()) { districtExpanded = true }
                )
                DropdownMenu(expanded = districtExpanded, onDismissRequest = { districtExpanded = false }) {
                    currentDistricts.forEach { district ->
                        DropdownMenuItem(
                            text = { Text(district.name, color = Color.Black) },
                            onClick = {
                                onUpdate(profile.copy(birthDetails = profile.birthDetails.copy(districtId = district.id, districtName = district.name)))
                                districtExpanded = false
                            }
                        )
                    }
                }
            }
        }
    }
}

// --------------------------------------------------
// STEP 2: MEDENİ DURUM
// --------------------------------------------------
@Composable
private fun Step2MaritalStatus(profile: PAGBasicProfile, onUpdate: (PAGBasicProfile) -> Unit) {
    val options = listOf(
        "SINGLE" to "Bekar",
        "MARRIED" to "Evli",
        "DIVORCED" to "Boşanmış",
        "WIDOWED" to "Dul",
        "OTHER" to "Diğer"
    )

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Medeni durumunuzu seçiniz:", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textMuted)

        options.forEach { (code, label) ->
            val isSelected = profile.maritalStatus == code
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PAGTheme.colors.surfacePrimary, RoundedCornerShape(12.dp))
                    .border(
                        width = if (isSelected) 2.dp else 1.dp,
                        color = if (isSelected) PAGTheme.colors.brandLime else PAGTheme.colors.borderDefault,
                        shape = RoundedCornerShape(12.dp)
                    )
                    .clickable { onUpdate(profile.copy(maritalStatus = code)) }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                RadioButton(
                    selected = isSelected,
                    onClick = { onUpdate(profile.copy(maritalStatus = code)) },
                    colors = RadioButtonDefaults.colors(selectedColor = PAGTheme.colors.brandLime, unselectedColor = PAGTheme.colors.textMuted)
                )
                Text(text = label, style = PAGTheme.typography.bodyLarge, color = Color.White)
            }
        }
    }
}

// --------------------------------------------------
// STEP 3: ÇOCUK BİLGİLERİ
// --------------------------------------------------
@Composable
private fun Step3ChildrenInfo(profile: PAGBasicProfile, onUpdate: (PAGBasicProfile) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Çocuğunuz var mı?", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            val hasChild = profile.childrenInfo.hasChildren
            FilterChip(
                selected = hasChild,
                onClick = {
                    onUpdate(profile.copy(childrenInfo = profile.childrenInfo.copy(
                        hasChildren = true,
                        childrenCount = if (profile.childrenInfo.childrenCount == 0) 1 else profile.childrenInfo.childrenCount,
                        children = if (profile.childrenInfo.children.isEmpty()) listOf(PAGChildInfo()) else profile.childrenInfo.children
                    )))
                },
                label = { Text("Evet", color = if (hasChild) Color.Black else Color.White, fontWeight = FontWeight.Bold) },
                colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PAGTheme.colors.brandLime),
                modifier = Modifier.weight(1f).height(48.dp)
            )
            FilterChip(
                selected = !hasChild,
                onClick = {
                    onUpdate(profile.copy(childrenInfo = profile.childrenInfo.copy(hasChildren = false, childrenCount = 0, children = emptyList())))
                },
                label = { Text("Hayır", color = if (!hasChild) Color.Black else Color.White, fontWeight = FontWeight.Bold) },
                colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PAGTheme.colors.brandLime),
                modifier = Modifier.weight(1f).height(48.dp)
            )
        }

        if (profile.childrenInfo.hasChildren) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PAGTheme.colors.surfacePrimary, RoundedCornerShape(12.dp))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Çocuk Sayısı: ${profile.childrenInfo.childrenCount}", style = PAGTheme.typography.heading, color = Color.White)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    IconButton(
                        onClick = {
                            if (profile.childrenInfo.childrenCount > 1) {
                                val newCount = profile.childrenInfo.childrenCount - 1
                                val newList = profile.childrenInfo.children.dropLast(1)
                                onUpdate(profile.copy(childrenInfo = profile.childrenInfo.copy(childrenCount = newCount, children = newList)))
                            }
                        }
                    ) { Text("-", color = PAGTheme.colors.brandLime, fontSize = 24.sp, fontWeight = FontWeight.Bold) }

                    IconButton(
                        onClick = {
                            val newCount = profile.childrenInfo.childrenCount + 1
                            val newList = profile.childrenInfo.children + PAGChildInfo()
                            onUpdate(profile.copy(childrenInfo = profile.childrenInfo.copy(childrenCount = newCount, children = newList)))
                        }
                    ) { Text("+", color = PAGTheme.colors.brandLime, fontSize = 24.sp, fontWeight = FontWeight.Bold) }
                }
            }

            profile.childrenInfo.children.forEachIndexed { idx, child ->
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PAGTheme.colors.surfacePrimary, RoundedCornerShape(12.dp))
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("${idx + 1}. Çocuk Bilgisi", style = PAGTheme.typography.heading, color = PAGTheme.colors.brandLime)

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("Cinsiyet:", style = PAGTheme.typography.body, color = PAGTheme.colors.textMuted)
                        Spacer(modifier = Modifier.weight(1f))
                        FilterChip(
                            selected = child.gender == "MALE",
                            onClick = {
                                val newList = profile.childrenInfo.children.toMutableList()
                                newList[idx] = child.copy(gender = "MALE")
                                onUpdate(profile.copy(childrenInfo = profile.childrenInfo.copy(children = newList)))
                            },
                            label = { Text("Erkek", color = if (child.gender == "MALE") Color.Black else Color.White) },
                            colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PAGTheme.colors.brandLime)
                        )
                        FilterChip(
                            selected = child.gender == "FEMALE",
                            onClick = {
                                val newList = profile.childrenInfo.children.toMutableList()
                                newList[idx] = child.copy(gender = "FEMALE")
                                onUpdate(profile.copy(childrenInfo = profile.childrenInfo.copy(children = newList)))
                            },
                            label = { Text("Kız", color = if (child.gender == "FEMALE") Color.Black else Color.White) },
                            colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PAGTheme.colors.brandLime)
                        )
                    }

                    OutlinedTextField(
                        value = child.birthDate,
                        onValueChange = { newDate ->
                            val newList = profile.childrenInfo.children.toMutableList()
                            newList[idx] = child.copy(birthDate = newDate)
                            onUpdate(profile.copy(childrenInfo = profile.childrenInfo.copy(children = newList)))
                        },
                        label = { Text("Doğum Tarihi (YYYY-MM-DD)", color = PAGTheme.colors.textMuted) },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}

// --------------------------------------------------
// STEP 4: İKAMETGAH ADRESİ
// --------------------------------------------------
@Composable
private fun Step4ResidenceAddress(profile: PAGBasicProfile, locations: List<PAGCity>, onUpdate: (PAGBasicProfile) -> Unit) {
    var cityExpanded by remember { mutableStateOf(false) }
    var districtExpanded by remember { mutableStateOf(false) }
    var nhExpanded by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("İkametgah (İl)", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = profile.residenceAddress.cityName.ifEmpty { "İl Seçiniz" },
                    onValueChange = {}, readOnly = true,
                    trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = PAGTheme.colors.textMuted) },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                    modifier = Modifier.fillMaxWidth().clickable { cityExpanded = true }
                )
                DropdownMenu(expanded = cityExpanded, onDismissRequest = { cityExpanded = false }) {
                    locations.forEach { city ->
                        DropdownMenuItem(
                            text = { Text(city.name, color = Color.Black) },
                            onClick = {
                                onUpdate(profile.copy(residenceAddress = profile.residenceAddress.copy(cityId = city.id, cityName = city.name, districtId = "", districtName = "", neighborhoodId = null, neighborhoodName = null)))
                                cityExpanded = false
                            }
                        )
                    }
                }
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("İkametgah (İlçe)", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            val currentDistricts = locations.firstOrNull { it.id == profile.residenceAddress.cityId }?.districts ?: emptyList()

            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = profile.residenceAddress.districtName.ifEmpty { "İlçe Seçiniz" },
                    onValueChange = {}, readOnly = true,
                    enabled = profile.residenceAddress.cityId.isNotEmpty(),
                    trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = PAGTheme.colors.textMuted) },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                    modifier = Modifier.fillMaxWidth().clickable(enabled = profile.residenceAddress.cityId.isNotEmpty()) { districtExpanded = true }
                )
                DropdownMenu(expanded = districtExpanded, onDismissRequest = { districtExpanded = false }) {
                    currentDistricts.forEach { district ->
                        DropdownMenuItem(
                            text = { Text(district.name, color = Color.Black) },
                            onClick = {
                                onUpdate(profile.copy(residenceAddress = profile.residenceAddress.copy(districtId = district.id, districtName = district.name, neighborhoodId = null, neighborhoodName = null)))
                                districtExpanded = false
                            }
                        )
                    }
                }
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("İkametgah (Mahalle)", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            val currentDistricts = locations.firstOrNull { it.id == profile.residenceAddress.cityId }?.districts ?: emptyList()
            val neighborhoods = currentDistricts.firstOrNull { it.id == profile.residenceAddress.districtId }?.neighborhoods ?: emptyList()

            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = profile.residenceAddress.neighborhoodName ?: "Mahalle Seçiniz",
                    onValueChange = {}, readOnly = true,
                    enabled = profile.residenceAddress.districtId.isNotEmpty(),
                    trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = PAGTheme.colors.textMuted) },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                    modifier = Modifier.fillMaxWidth().clickable(enabled = profile.residenceAddress.districtId.isNotEmpty()) { nhExpanded = true }
                )
                DropdownMenu(expanded = nhExpanded, onDismissRequest = { nhExpanded = false }) {
                    neighborhoods.forEach { nh ->
                        DropdownMenuItem(
                            text = { Text(nh.name, color = Color.Black) },
                            onClick = {
                                onUpdate(profile.copy(residenceAddress = profile.residenceAddress.copy(neighborhoodId = nh.id, neighborhoodName = nh.name)))
                                nhExpanded = false
                            }
                        )
                    }
                }
            }
        }
    }
}

// --------------------------------------------------
// STEP 5: MEMLEKET BİLGİSİ
// --------------------------------------------------
@Composable
private fun Step5Hometown(profile: PAGBasicProfile, locations: List<PAGCity>, onUpdate: (PAGBasicProfile) -> Unit) {
    var cityExpanded by remember { mutableStateOf(false) }
    var districtExpanded by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Memleket (İl)", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = profile.hometown.cityName.ifEmpty { "İl Seçiniz" },
                    onValueChange = {}, readOnly = true,
                    trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = PAGTheme.colors.textMuted) },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                    modifier = Modifier.fillMaxWidth().clickable { cityExpanded = true }
                )
                DropdownMenu(expanded = cityExpanded, onDismissRequest = { cityExpanded = false }) {
                    locations.forEach { city ->
                        DropdownMenuItem(
                            text = { Text(city.name, color = Color.Black) },
                            onClick = {
                                onUpdate(profile.copy(hometown = profile.hometown.copy(cityId = city.id, cityName = city.name, districtId = "", districtName = "")))
                                cityExpanded = false
                            }
                        )
                    }
                }
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Memleket (İlçe)", style = PAGTheme.typography.bodyLarge, color = PAGTheme.colors.textPrimary)
            val currentDistricts = locations.firstOrNull { it.id == profile.hometown.cityId }?.districts ?: emptyList()

            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = profile.hometown.districtName.ifEmpty { "İlçe Seçiniz" },
                    onValueChange = {}, readOnly = true,
                    enabled = profile.hometown.cityId.isNotEmpty(),
                    trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = PAGTheme.colors.textMuted) },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                    modifier = Modifier.fillMaxWidth().clickable(enabled = profile.hometown.cityId.isNotEmpty()) { districtExpanded = true }
                )
                DropdownMenu(expanded = districtExpanded, onDismissRequest = { districtExpanded = false }) {
                    currentDistricts.forEach { district ->
                        DropdownMenuItem(
                            text = { Text(district.name, color = Color.Black) },
                            onClick = {
                                onUpdate(profile.copy(hometown = profile.hometown.copy(districtId = district.id, districtName = district.name)))
                                districtExpanded = false
                            }
                        )
                    }
                }
            }
        }
    }
}

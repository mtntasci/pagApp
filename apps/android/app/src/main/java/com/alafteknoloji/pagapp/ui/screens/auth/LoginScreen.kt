package com.alafteknoloji.pagapp.ui.screens.auth

import android.app.Activity
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.R
import com.alafteknoloji.pagapp.services.AuthService
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.ui.screens.legal.ConsentGateScreen
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun LoginScreen(
    activity: Activity,
    modifier: Modifier = Modifier
) {
    val isLoading by AuthService.isLoading.collectAsState()
    val errorMessage by AuthService.errorMessage.collectAsState()
    var isLegalConsentAgreed by remember { mutableStateOf(false) }
    var showLegalDialog by remember { mutableStateOf(false) }
    var showEmailComingSoonDialog by remember { mutableStateOf(false) }

    fun checkConsentBeforeLogin(action: () -> Unit) {
        if (!isLegalConsentAgreed) {
            showLegalDialog = true
        } else {
            action()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.brandMidnight)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // Branding Header
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(88.dp)
                        .clip(RoundedCornerShape(22.dp))
                        .background(Color.White.copy(alpha = 0.08f))
                        .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(22.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.pag_symbol),
                        contentDescription = "PAG Logo",
                        modifier = Modifier.size(52.dp)
                    )
                }

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "PAG'a Hoş Geldiniz",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        text = "Anketlere katıl, Profil Puanı kazan ve ödüllerde öncelik kazan.",
                        style = PAGTheme.typography.body,
                        color = Color.White.copy(alpha = 0.7f),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }
            }

            // Bottom Actions (Consent Checkbox + Login Buttons)
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // 1. Consent Checkbox & Link
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = isLegalConsentAgreed,
                        onCheckedChange = { isLegalConsentAgreed = it },
                        colors = CheckboxDefaults.colors(
                            checkedColor = PAGTheme.colors.brandLime,
                            checkmarkColor = PAGTheme.colors.brandMidnight,
                            uncheckedColor = Color.White.copy(alpha = 0.4f)
                        )
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Giriş yaparak ",
                        fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                    Text(
                        text = "Sözleşmeler ve İzinler",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = PAGTheme.colors.brandLime,
                        textDecoration = TextDecoration.Underline,
                        modifier = Modifier.clickable { showLegalDialog = true }
                    )
                    Text(
                        text = "'ni kabul ediyorum.",
                        fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                }

                // 2. Apple Sign In Button
                AuthButton(
                    text = "Apple ile Giriş Yap",
                    icon = Icons.Filled.Person,
                    backgroundColor = Color.White,
                    contentColor = Color.Black,
                    borderColor = Color.Transparent,
                    enabled = !isLoading,
                    onClick = { checkConsentBeforeLogin { AuthService.signInWithApple(activity) } }
                )

                // 3. Google Sign In Button
                AuthButton(
                    text = "Google ile Devam Et",
                    icon = Icons.Filled.Person,
                    backgroundColor = Color.White.copy(alpha = 0.08f),
                    contentColor = Color.White,
                    borderColor = Color.White.copy(alpha = 0.15f),
                    enabled = !isLoading,
                    onClick = { checkConsentBeforeLogin { AuthService.signInWithGoogle(activity) } }
                )

                // 4. Email Button
                AuthButton(
                    text = "E-posta ile Devam Et",
                    icon = Icons.Filled.Email,
                    backgroundColor = Color.Transparent,
                    contentColor = Color.White.copy(alpha = 0.85f),
                    borderColor = Color.White.copy(alpha = 0.08f),
                    enabled = !isLoading,
                    onClick = { showEmailComingSoonDialog = true }
                )
            }
        }

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.6f)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(PAGTheme.colors.surfacePrimary)
                        .padding(24.dp)
                ) {
                    CircularProgressIndicator(color = PAGTheme.colors.brandLime)
                    Text(
                        text = "Giriş yapılıyor...",
                        style = PAGTheme.typography.body,
                        color = Color.White
                    )
                }
            }
        }
    }

    if (showLegalDialog) {
        AlertDialog(
            onDismissRequest = { showLegalDialog = false },
            title = { Text("Sözleşmeler ve İzinler") },
            text = {
                Text("PAG platformuna giriş yapabilmek ve para ödülü kazanabilmek için 18 yaşından büyük olduğunuzu ve kullanıcı sözleşmelerini onaylamanız gerekmektedir.")
            },
            confirmButton = {
                TextButton(onClick = {
                    isLegalConsentAgreed = true
                    showLegalDialog = false
                }) {
                    Text("Okudum, Onaylıyorum", color = PAGTheme.colors.brandLime, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLegalDialog = false }) {
                    Text("Kapat")
                }
            }
        )
    }

    if (showEmailComingSoonDialog) {
        AlertDialog(
            onDismissRequest = { showEmailComingSoonDialog = false },
            title = { Text("E-posta ile Giriş") },
            text = { Text("E-posta ile giriş özelliği çok yakında kullanıma sunulacaktır. Lütfen Google veya Apple ile giriş yapın.") },
            confirmButton = {
                TextButton(onClick = { showEmailComingSoonDialog = false }) {
                    Text("Tamam")
                }
            }
        )
    }

    errorMessage?.let { errorText ->
        AlertDialog(
            onDismissRequest = { AuthService.clearError() },
            title = { Text("Giriş Hatası") },
            text = { Text(errorText) },
            confirmButton = {
                TextButton(onClick = { AuthService.clearError() }) {
                    Text("Tamam")
                }
            }
        )
    }
}

@Composable
private fun AuthButton(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    backgroundColor: Color,
    contentColor: Color,
    borderColor: Color = Color.Transparent,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(if (enabled) backgroundColor else backgroundColor.copy(alpha = 0.5f))
            .border(1.dp, borderColor, RoundedCornerShape(14.dp))
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 16.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = if (enabled) contentColor else contentColor.copy(alpha = 0.5f),
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = text,
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (enabled) contentColor else contentColor.copy(alpha = 0.5f)
        )
    }
}

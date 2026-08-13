package com.alafteknoloji.pagapp.ui.screens.auth

import android.app.Activity
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.R
import com.alafteknoloji.pagapp.services.AuthService
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun LoginScreen(
    activity: Activity,
    modifier: Modifier = Modifier
) {
    val isLoading by AuthService.isLoading.collectAsState()
    val errorMessage by AuthService.errorMessage.collectAsState()
    var showEmailComingSoonDialog by remember { mutableStateOf(false) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.brandMidnight)
            .padding(PAGTheme.spacing.lg)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // PAG Logo Top
            Image(
                painter = painterResource(id = R.drawable.pag_symbol),
                contentDescription = "PAG Logo",
                modifier = Modifier.size(60.dp)
            )
            Spacer(modifier = Modifier.height(PAGTheme.spacing.md))

            Text(
                text = "PAG'a Hoş Geldiniz",
                style = PAGTheme.typography.display,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(PAGTheme.spacing.sm))
            Text(
                text = "Anketlere katıl, Profil Puanı kazan ve ödüllerde öne geç.",
                style = PAGTheme.typography.body,
                color = Color.White.copy(alpha = 0.8f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = PAGTheme.spacing.lg)
            )

            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))
            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))

            // Login Options
            // Google
            AuthButton(
                text = "Google ile Devam Et",
                icon = Icons.Filled.Person,
                backgroundColor = PAGTheme.colors.surfacePrimary,
                contentColor = PAGTheme.colors.textPrimary,
                borderColor = PAGTheme.colors.borderDefault,
                enabled = !isLoading,
                onClick = { AuthService.signInWithGoogle(activity) }
            )
            Spacer(modifier = Modifier.height(PAGTheme.spacing.md))

            // Apple
            AuthButton(
                text = "Apple ile Devam Et",
                icon = Icons.Filled.Person,
                backgroundColor = Color.Black,
                contentColor = Color.White,
                enabled = !isLoading,
                onClick = { AuthService.signInWithApple(activity) }
            )
            Spacer(modifier = Modifier.height(PAGTheme.spacing.md))

            // Email
            AuthButton(
                text = "E-posta ile Devam Et",
                icon = Icons.Filled.Email,
                backgroundColor = PAGTheme.colors.brandBlue,
                contentColor = PAGTheme.colors.textPrimary,
                enabled = !isLoading,
                onClick = { showEmailComingSoonDialog = true }
            )
        }

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.4f)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md),
                    modifier = Modifier
                        .background(PAGTheme.colors.surfacePrimary, PAGTheme.radius.md)
                        .padding(PAGTheme.spacing.xl)
                ) {
                    CircularProgressIndicator(color = PAGTheme.colors.brandLime)
                    Text(
                        text = "Giriş yapılıyor...",
                        style = PAGTheme.typography.body,
                        color = PAGTheme.colors.textPrimary
                    )
                }
            }
        }
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
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .background(if (enabled) backgroundColor else backgroundColor.copy(alpha = 0.5f), PAGTheme.radius.md)
            .border(1.dp, borderColor, PAGTheme.radius.md)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = PAGTheme.spacing.md)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = if (enabled) contentColor else contentColor.copy(alpha = 0.5f),
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(PAGTheme.spacing.md))
        Text(
            text = text,
            style = PAGTheme.typography.heading,
            color = if (enabled) contentColor else contentColor.copy(alpha = 0.5f)
        )
    }
}

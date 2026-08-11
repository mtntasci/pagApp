package com.alafteknoloji.pagapp.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.R
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.backgroundPrimary)
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
                color = PAGTheme.colors.textPrimary
            )
            Spacer(modifier = Modifier.height(PAGTheme.spacing.sm))
            Text(
                text = "Anketlere katıl, Profil Puanı kazan ve ödüllerde öne geç.",
                style = PAGTheme.typography.body,
                color = PAGTheme.colors.textSecondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = PAGTheme.spacing.lg)
            )
            
            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))
            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))
            
            // Login Options
            // Google
            AuthButton(
                text = "Google ile Devam Et",
                icon = Icons.Filled.Person, // Mock Google Icon
                backgroundColor = PAGTheme.colors.surfacePrimary,
                contentColor = PAGTheme.colors.textPrimary,
                borderColor = PAGTheme.colors.borderDefault,
                onClick = onLoginSuccess
            )
            Spacer(modifier = Modifier.height(PAGTheme.spacing.md))
            
            // Apple
            AuthButton(
                text = "Apple ile Devam Et",
                icon = Icons.Filled.Person, // Mock Apple Icon
                backgroundColor = Color.Black,
                contentColor = Color.White,
                onClick = onLoginSuccess
            )
            Spacer(modifier = Modifier.height(PAGTheme.spacing.md))
            
            // Email
            AuthButton(
                text = "E-posta ile Devam Et",
                icon = Icons.Filled.Email,
                backgroundColor = PAGTheme.colors.brandBlue,
                contentColor = PAGTheme.colors.textPrimary,
                onClick = onLoginSuccess
            )
        }
    }
}

@Composable
private fun AuthButton(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    backgroundColor: Color,
    contentColor: Color,
    borderColor: Color = Color.Transparent,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .background(backgroundColor, PAGTheme.radius.md)
            .border(1.dp, borderColor, PAGTheme.radius.md)
            .clickable(onClick = onClick)
            .padding(horizontal = PAGTheme.spacing.md)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = contentColor,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(PAGTheme.spacing.md))
        Text(
            text = text,
            style = PAGTheme.typography.heading,
            color = contentColor
        )
    }
}

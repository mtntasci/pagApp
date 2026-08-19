package com.alafteknoloji.pagapp.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// Formats IBAN ensuring TR prefix and 4-char groups
// Handles pasted "TR..." or raw digits seamlessly
fun formatTRStandardIban(raw: String): String {
    var clean = raw.uppercase().replace(Regex("[^A-Z0-9]"), "")
    if (clean.isEmpty()) return ""

    // Strip leading TR / T if present to prevent TRTR duplication
    if (clean.startsWith("TR")) {
        clean = clean.drop(2)
    } else if (clean.startsWith("T")) {
        clean = clean.drop(1)
    }

    // Up to 24 digits
    clean = clean.take(24)

    val fullIban = "TR$clean"
    val sb = StringBuilder()
    for (i in fullIban.indices) {
        if (i > 0 && i % 4 == 0) {
            sb.append(" ")
        }
        sb.append(fullIban[i])
    }
    return sb.toString()
}

enum class IbanUiState {
    IDLE,
    VERIFYING,
    SUCCESS,
    ERROR
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IbanVerificationDialog(
    initialIban: String,
    initialTckn: String,
    userService: UserService?,
    onDismiss: () -> Unit,
    onSuccess: () -> Unit
) {
    var tcknInput by remember { mutableStateOf(initialTckn.filter { it.isDigit() }.take(11)) }
    var ibanInput by remember { mutableStateOf(formatTRStandardIban(initialIban)) }
    var uiState by remember { mutableStateOf(IbanUiState.IDLE) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val cleanTckn = tcknInput.filter { it.isDigit() }.take(11)
    val cleanIban = ibanInput.replace(" ", "").uppercase()

    val handleVerify = {
        errorMessage = null

        if (cleanTckn.length != 11) {
            errorMessage = "Lütfen 11 haneli TC Kimlik Numaranızı eksiksiz giriniz."
        } else if (cleanTckn.startsWith("0")) {
            errorMessage = "TC Kimlik Numarası '0' ile başlayamaz."
        } else if (cleanIban.length != 26 || !cleanIban.startsWith("TR")) {
            errorMessage = "Lütfen 26 haneli geçerli bir TR IBAN giriniz (TR + 24 hane)."
        } else {
            uiState = IbanUiState.VERIFYING
            scope.launch {
                delay(700) // Simulated banking verification delay
                val ok = userService?.submitIbanAndTckn(cleanIban, cleanTckn) ?: false
                if (ok) {
                    uiState = IbanUiState.SUCCESS
                    delay(1200)
                    onSuccess()
                    onDismiss()
                } else {
                    uiState = IbanUiState.ERROR
                    errorMessage = "IBAN doğrulama servisi yanıt vermedi. Lütfen tekrar deneyiniz."
                }
            }
        }
    }

    AlertDialog(
        onDismissRequest = {
            if (uiState != IbanUiState.VERIFYING) onDismiss()
        },
        title = {
            Text(
                "IBAN Doğrulama",
                color = PAGTheme.colors.textPrimary,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    "Nakit ödül transferleri için TC Kimlik No ve IBAN bilgilerinizi giriniz (+200 PP).",
                    style = PAGTheme.typography.caption,
                    color = PAGTheme.colors.textSecondary
                )

                // 1. TC Kimlik No (Strict 11 digits, Numeric Keyboard)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "TC Kimlik Numarası",
                            style = PAGTheme.typography.caption,
                            fontWeight = FontWeight.Bold,
                            color = PAGTheme.colors.textPrimary
                        )
                        Text(
                            "${cleanTckn.length}/11",
                            style = PAGTheme.typography.caption,
                            fontFamily = FontFamily.Monospace,
                            color = if (cleanTckn.length == 11) Color(0xFF10B981) else PAGTheme.colors.textMuted
                        )
                    }

                    OutlinedTextField(
                        value = cleanTckn,
                        onValueChange = { newValue ->
                            val digits = newValue.filter { it.isDigit() }
                            if (digits.length <= 11) tcknInput = digits
                        },
                        placeholder = { Text("11 haneli kimlik no") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PAGTheme.colors.brandLime,
                            unfocusedBorderColor = PAGTheme.colors.borderDefault
                        )
                    )
                }

                // 2. IBAN No (Numeric Keyboard, Fixed TR badge, Exact 26 chars)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "IBAN Numarası",
                            style = PAGTheme.typography.caption,
                            fontWeight = FontWeight.Bold,
                            color = PAGTheme.colors.textPrimary
                        )
                        Text(
                            "${cleanIban.length}/26",
                            style = PAGTheme.typography.caption,
                            fontFamily = FontFamily.Monospace,
                            color = if (cleanIban.length == 26) Color(0xFF10B981) else PAGTheme.colors.textMuted
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = PAGTheme.colors.surfaceSecondary,
                            modifier = Modifier
                                .padding(end = 8.dp)
                                .height(56.dp)
                        ) {
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier.padding(horizontal = 12.dp)
                            ) {
                                Text(
                                    "TR",
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    color = PAGTheme.colors.brandLime,
                                    fontSize = 16.sp
                                )
                            }
                        }

                        OutlinedTextField(
                            value = if (ibanInput.startsWith("TR")) ibanInput.drop(2).trimStart() else ibanInput,
                            onValueChange = { newValue ->
                                ibanInput = formatTRStandardIban(newValue)
                            },
                            placeholder = { Text("24 haneli hesap no") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = PAGTheme.colors.brandLime,
                                unfocusedBorderColor = PAGTheme.colors.borderDefault
                            )
                        )
                    }
                }

                // Status Message
                if (uiState == IbanUiState.VERIFYING) {
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = PAGTheme.colors.brandLime,
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Banka kayıtları doğrulanıyor...",
                            style = PAGTheme.typography.caption,
                            color = PAGTheme.colors.brandLime,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                } else if (uiState == IbanUiState.SUCCESS) {
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            "Doğrulandı! (+200 PP)",
                            style = PAGTheme.typography.bodySmall,
                            color = Color(0xFF10B981),
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else if (errorMessage != null) {
                    Text(
                        errorMessage!!,
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.error,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { handleVerify() },
                enabled = uiState != IbanUiState.VERIFYING && uiState != IbanUiState.SUCCESS && cleanTckn.length == 11 && cleanIban.length == 26,
                colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.brandLime)
            ) {
                Text(
                    text = if (uiState == IbanUiState.VERIFYING) "Doğrulanıyor..." else "IBAN'ı Doğrula",
                    color = PAGTheme.colors.brandMidnight,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = uiState != IbanUiState.VERIFYING
            ) {
                Text("Kapat", color = Color.White)
            }
        }
    )
}

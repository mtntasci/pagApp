package com.alafteknoloji.pagapp.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
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

// Formats phone ensuring '0 5XX XXX XX XX' format
// User does not need to type 0; if 0 is typed, it's recognized as leading digit without doubling
fun formatTRStandardPhone(raw: String): String {
    var digits = raw.filter { it.isDigit() }
    if (digits.isEmpty()) return ""

    // If user starts with 0, strip it first to get clean 10-digit payload
    if (digits.startsWith("0")) {
        digits = digits.drop(1)
    }

    digits = digits.take(10)
    val full = "0$digits"

    val sb = StringBuilder()
    for (i in full.indices) {
        if (i == 1 || i == 4 || i == 7 || i == 9) sb.append(" ")
        sb.append(full[i])
        if (sb.length >= 15) break
    }
    return sb.toString()
}

enum class PhoneVerificationUiState {
    IDLE,
    CHECKING,
    SUCCESS,
    ERROR
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhoneVerificationDialog(
    initialPhone: String,
    userService: UserService?,
    onDismiss: () -> Unit,
    onSuccess: () -> Unit
) {
    var rawPhone by remember {
        val filtered = initialPhone.filter { it.isDigit() }
        val withoutZero = if (filtered.startsWith("0")) filtered.drop(1) else filtered
        mutableStateOf(withoutZero.take(10))
    }
    var isCodeSent by remember { mutableStateOf(false) }
    var otpDigits by remember { mutableStateOf(listOf("", "", "", "")) }
    var uiState by remember { mutableStateOf(PhoneVerificationUiState.IDLE) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val focusRequesters = remember { List(4) { FocusRequester() } }
    val cleanFullPhone = if (rawPhone.isEmpty()) "" else "0$rawPhone"

    val handleOtpVerify = { fullCode: String ->
        errorMessage = null
        uiState = PhoneVerificationUiState.CHECKING

        scope.launch {
            delay(700) // Simulated realistic verification delay
            if (fullCode == "1111") {
                val ok = userService?.verifyPhone(cleanFullPhone) ?: false
                if (ok) {
                    uiState = PhoneVerificationUiState.SUCCESS
                    delay(1200)
                    onSuccess()
                    onDismiss()
                } else {
                    uiState = PhoneVerificationUiState.ERROR
                    errorMessage = "Telefon doğrulama servisi yanıt vermedi."
                }
            } else {
                uiState = PhoneVerificationUiState.ERROR
                errorMessage = "Kod Yanlış! Lütfen SMS ile iletilen 4 haneli kodu giriniz."
                otpDigits = listOf("", "", "", "")
                focusRequesters[0].requestFocus()
            }
        }
    }

    AlertDialog(
        onDismissRequest = {
            if (uiState != PhoneVerificationUiState.CHECKING) onDismiss()
        },
        title = {
            Text(
                "Telefon Doğrulama",
                color = PAGTheme.colors.textPrimary,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (!isCodeSent) {
                    Text(
                        "Numaranızı onaylayarak hesabınızı güvenceye alın ve anında +200 Profil Puanı kazanın.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textSecondary,
                        textAlign = TextAlign.Center
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "Cep Telefonu Numarası",
                            style = PAGTheme.typography.caption,
                            fontWeight = FontWeight.Bold,
                            color = PAGTheme.colors.textPrimary
                        )
                        Text(
                            "${cleanFullPhone.length}/11",
                            style = PAGTheme.typography.caption,
                            fontFamily = FontFamily.Monospace,
                            color = if (cleanFullPhone.length == 11) Color(0xFF10B981) else PAGTheme.colors.textMuted
                        )
                    }

                    OutlinedTextField(
                        value = formatTRStandardPhone(rawPhone),
                        onValueChange = { newValue ->
                            var clean = newValue.filter { it.isDigit() }
                            if (clean.startsWith("0")) {
                                clean = clean.drop(1)
                            }
                            rawPhone = clean.take(10)
                        },
                        placeholder = { Text("0 5XX XXX XX XX") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PAGTheme.colors.brandLime,
                            unfocusedBorderColor = PAGTheme.colors.borderDefault
                        )
                    )

                    if (errorMessage != null) {
                        Text(
                            errorMessage!!,
                            style = PAGTheme.typography.caption,
                            color = PAGTheme.colors.error,
                            textAlign = TextAlign.Center
                        )
                    }
                } else {
                    // OTP Verification Step
                    Text(
                        "${formatTRStandardPhone(rawPhone)} numarasına iletilen 4 haneli kodu giriniz.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textSecondary,
                        textAlign = TextAlign.Center
                    )

                    // 4-Digit OTP Boxes
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 8.dp)
                    ) {
                        for (i in 0..3) {
                            OutlinedTextField(
                                value = otpDigits[i],
                                onValueChange = { value ->
                                    val digits = value.filter { it.isDigit() }
                                    if (digits.length > 1) {
                                        // Paste multi-character OTP
                                        val chars = digits.take(4)
                                        val newOtp = List(4) { idx ->
                                            if (idx < chars.length) chars[idx].toString() else ""
                                        }
                                        otpDigits = newOtp
                                        if (chars.length == 4) {
                                            handleOtpVerify(chars)
                                        }
                                    } else {
                                        val updated = otpDigits.toMutableList()
                                        updated[i] = digits.take(1)
                                        otpDigits = updated

                                        if (digits.isNotEmpty() && i < 3) {
                                            focusRequesters[i + 1].requestFocus()
                                        }

                                        val fullCode = updated.joinToString("")
                                        if (fullCode.length == 4 && !updated.contains("")) {
                                            handleOtpVerify(fullCode)
                                        }
                                    }
                                },
                                modifier = Modifier
                                    .width(54.dp)
                                    .height(60.dp)
                                    .focusRequester(focusRequesters[i])
                                    .onKeyEvent { event ->
                                        if (event.key == Key.Backspace && otpDigits[i].isEmpty() && i > 0) {
                                            focusRequesters[i - 1].requestFocus()
                                            true
                                        } else {
                                            false
                                        }
                                    },
                                singleLine = true,
                                textStyle = LocalTextStyle.current.copy(
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    textAlign = TextAlign.Center
                                ),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = if (uiState == PhoneVerificationUiState.ERROR) PAGTheme.colors.error else PAGTheme.colors.brandLime,
                                    unfocusedBorderColor = if (uiState == PhoneVerificationUiState.ERROR) PAGTheme.colors.error else PAGTheme.colors.borderDefault
                                )
                            )
                        }
                    }

                    // Verification State Banners
                    if (uiState == PhoneVerificationUiState.CHECKING) {
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 4.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = PAGTheme.colors.brandLime,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Kontrol ediliyor...",
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.brandLime,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    } else if (uiState == PhoneVerificationUiState.SUCCESS) {
                        Text(
                            "✅ Onaylandı! (+200 PP)",
                            style = PAGTheme.typography.bodySmall,
                            color = Color(0xFF10B981),
                            fontWeight = FontWeight.Bold
                        )
                    } else if (errorMessage != null) {
                        Text(
                            errorMessage!!,
                            style = PAGTheme.typography.caption,
                            color = PAGTheme.colors.error,
                            textAlign = TextAlign.Center
                        )
                    }

                    // Resend Action
                    TextButton(
                        onClick = {
                            isCodeSent = false
                            otpDigits = listOf("", "", "", "")
                            errorMessage = null
                            uiState = PhoneVerificationUiState.IDLE
                        }
                    ) {
                        Text(
                            "Numarayı Değiştir",
                            style = PAGTheme.typography.caption,
                            color = PAGTheme.colors.textSecondary
                        )
                    }
                }
            }
        },
        confirmButton = {
            if (!isCodeSent) {
                Button(
                    onClick = {
                        if (cleanFullPhone.length == 11) {
                            errorMessage = null
                            isCodeSent = true
                        } else {
                            errorMessage = "Lütfen 10 haneli telefon numaranızı eksiksiz giriniz."
                        }
                    },
                    enabled = cleanFullPhone.length == 11,
                    colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.brandLime)
                ) {
                    Text(
                        "SMS Kodu Gönder",
                        color = PAGTheme.colors.brandMidnight,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = uiState != PhoneVerificationUiState.CHECKING
            ) {
                Text("Kapat", color = Color.White)
            }
        }
    )
}

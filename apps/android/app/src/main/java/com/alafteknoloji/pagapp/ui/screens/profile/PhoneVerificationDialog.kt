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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alafteknoloji.pagapp.services.UserService
import com.alafteknoloji.pagapp.ui.theme.PAGTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

fun formatTRStandardPhone(raw: String): String {
    var digits = raw.filter { it.isDigit() }
    if (digits.isEmpty()) return ""
    if (!digits.startsWith("0")) {
        digits = "0$digits"
    }
    val sb = StringBuilder()
    for (i in digits.indices) {
        if (i == 1 || i == 4 || i == 7 || i == 9) sb.append(" ")
        sb.append(digits[i])
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
        mutableStateOf(if (filtered.isNotEmpty() && !filtered.startsWith("0")) "0$filtered" else filtered)
    }
    var isCodeSent by remember { mutableStateOf(false) }
    var otpDigits by remember { mutableStateOf(listOf("", "", "", "")) }
    var uiState by remember { mutableStateOf(PhoneVerificationUiState.IDLE) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val focusRequesters = remember { List(4) { FocusRequester() } }

    val handleOtpVerify = { fullCode: String ->
        errorMessage = null
        uiState = PhoneVerificationUiState.CHECKING

        scope.launch {
            delay(700) // Simulated realistic verification delay
            if (fullCode == "1111") {
                val ok = userService?.verifyPhone(rawPhone) ?: false
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

                    OutlinedTextField(
                        value = formatTRStandardPhone(rawPhone),
                        onValueChange = { newValue ->
                            val clean = newValue.filter { it.isDigit() }
                            if (clean.length <= 11) {
                                rawPhone = if (clean.isNotEmpty() && !clean.startsWith("0")) "0$clean" else clean
                            }
                        },
                        label = { Text("0 5XX XXX XX XX") },
                        placeholder = { Text("0 5XX XXX XX XX") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
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
                    Text(
                        "${formatTRStandardPhone(rawPhone)} numaralı telefonunuza gönderilen 4 haneli SMS doğrulama kodunu giriniz.",
                        style = PAGTheme.typography.bodySmall,
                        color = PAGTheme.colors.textSecondary,
                        textAlign = TextAlign.Center
                    )

                    // 4 Separate OTP Boxes
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        for (i in 0 until 4) {
                            OutlinedTextField(
                                value = otpDigits[i],
                                onValueChange = { newValue: String ->
                                    val clean = newValue.filter { c: Char -> c.isDigit() }
                                    if (clean.length > 1) {
                                        // Paste support for 4 digits
                                        val pasted = clean.take(4)
                                        val newList = otpDigits.toMutableList()
                                        for (j in 0 until pasted.length) {
                                            if (j < 4) newList[j] = pasted[j].toString()
                                        }
                                        otpDigits = newList
                                        val full = otpDigits.joinToString("")
                                        if (full.length == 4) handleOtpVerify(full)
                                    } else {
                                        val newList = otpDigits.toMutableList()
                                        newList[i] = clean
                                        otpDigits = newList
                                        if (clean.isNotEmpty() && i < 3) {
                                            focusRequesters[i + 1].requestFocus()
                                        }
                                        val full = newList.joinToString("")
                                        if (full.length == 4) handleOtpVerify(full)
                                    }
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                textStyle = LocalTextStyle.current.copy(
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Black,
                                    textAlign = TextAlign.Center
                                ),
                                enabled = uiState != PhoneVerificationUiState.CHECKING && uiState != PhoneVerificationUiState.SUCCESS,
                                modifier = Modifier
                                    .size(54.dp)
                                    .focusRequester(focusRequesters[i])
                                    .onKeyEvent { event ->
                                        if (event.key == Key.Backspace && otpDigits[i].isEmpty() && i > 0) {
                                            focusRequesters[i - 1].requestFocus()
                                            true
                                        } else false
                                    }
                            )
                        }
                    }

                    if (uiState == PhoneVerificationUiState.CHECKING) {
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 4.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = PAGTheme.colors.brandLime,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Kontrol ediliyor... Lütfen bekleyiniz.",
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
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center
                        )
                    } else if (errorMessage != null) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                "⚠️ $errorMessage",
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.error,
                                textAlign = TextAlign.Center,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Test Doğrulama Kodu: 1111",
                                style = PAGTheme.typography.caption,
                                color = PAGTheme.colors.textMuted,
                                fontSize = 11.sp
                            )
                        }
                    }

                    TextButton(
                        onClick = {
                            isCodeSent = false
                            otpDigits = listOf("", "", "", "")
                            uiState = PhoneVerificationUiState.IDLE
                            errorMessage = null
                        },
                        enabled = uiState != PhoneVerificationUiState.CHECKING
                    ) {
                        Text("Numarayı Değiştir", color = PAGTheme.colors.brandLime, fontSize = 12.sp)
                    }
                }
            }
        },
        confirmButton = {
            if (!isCodeSent) {
                Button(
                    onClick = {
                        if (rawPhone.length >= 11) {
                            errorMessage = null
                            isCodeSent = true
                        } else {
                            errorMessage = "Lütfen 11 haneli geçerli telefon numaranızı giriniz (0 5XX...)."
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.brandLime)
                ) {
                    Text("Kod Gönder", color = PAGTheme.colors.brandMidnight, fontWeight = FontWeight.Bold)
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

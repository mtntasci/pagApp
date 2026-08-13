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
import kotlinx.coroutines.launch

fun formatTRPhone(raw: String): String {
    val digits = raw.filter { it.isDigit() }
    val sb = StringBuilder()
    for (i in digits.indices) {
        if (i == 4 || i == 7 || i == 9) sb.append(" ")
        sb.append(digits[i])
        if (sb.length >= 14) break
    }
    return sb.toString()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhoneVerificationDialog(
    initialPhone: String,
    userService: UserService?,
    onDismiss: () -> Unit,
    onSuccess: () -> Unit
) {
    var rawPhone by remember { mutableStateOf(initialPhone.filter { it.isDigit() }) }
    var isCodeSent by remember { mutableStateOf(false) }
    var otpDigits by remember { mutableStateOf(listOf("", "", "", "")) }
    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val focusRequesters = remember { List(4) { FocusRequester() } }

    val handleOtpVerify = { fullCode: String ->
        // TEMP DEV TEST BYPASS: 1111
        if (fullCode == "1111") {
            errorMessage = null
            isSubmitting = true
            scope.launch {
                val ok = userService?.verifyPhone(rawPhone) ?: false
                isSubmitting = false
                if (ok) {
                    onSuccess()
                    onDismiss()
                } else {
                    errorMessage = "Telefon doğrulama servisi yanıt vermedi."
                }
            }
        } else {
            errorMessage = "Doğrulama kodu hatalı. Lütfen tekrar deneyiniz."
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Telefon Doğrulama (+200 PP)", color = PAGTheme.colors.textPrimary, fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (!isCodeSent) {
                    Text(
                        "Telefon numaranızı onaylayarak +200 Profil Puanı kazanın.",
                        style = PAGTheme.typography.caption,
                        color = PAGTheme.colors.textMuted
                    )

                    OutlinedTextField(
                        value = formatTRPhone(rawPhone),
                        onValueChange = { newValue ->
                            val clean = newValue.filter { it.isDigit() }
                            if (clean.length <= 11) rawPhone = clean
                        },
                        label = { Text("Telefon Numarası") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (errorMessage != null) {
                        Text(errorMessage!!, style = PAGTheme.typography.caption, color = PAGTheme.colors.error)
                    }
                } else {
                    Text(
                        "${formatTRPhone(rawPhone)} numaralı telefonunuza gönderilen 4 haneli doğrulama kodunu giriniz.",
                        style = PAGTheme.typography.bodySmall,
                        color = PAGTheme.colors.textSecondary
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
                                textStyle = LocalTextStyle.current.copy(fontSize = 20.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center),
                                modifier = Modifier
                                    .size(52.dp)
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

                    if (isSubmitting) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp).align(Alignment.CenterHorizontally), color = PAGTheme.colors.brandLime)
                    }

                    if (errorMessage != null) {
                        Text(errorMessage!!, style = PAGTheme.typography.caption, color = PAGTheme.colors.error, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
                    }

                    TextButton(
                        onClick = {
                            isCodeSent = false
                            otpDigits = listOf("", "", "", "")
                            errorMessage = null
                        }
                    ) {
                        Text("Numarayı Değiştir", color = PAGTheme.colors.textMuted, fontSize = 12.sp)
                    }
                }
            }
        },
        confirmButton = {
            if (!isCodeSent) {
                Button(
                    onClick = {
                        if (rawPhone.length >= 10) {
                            errorMessage = null
                            isCodeSent = true
                        } else {
                            errorMessage = "Lütfen geçerli bir telefon numarası giriniz."
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PAGTheme.colors.brandLime)
                ) {
                    Text("Kod Gönder", color = PAGTheme.colors.brandMidnight, fontWeight = FontWeight.Bold)
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Kapat", color = Color.White)
            }
        }
    )

    LaunchedEffect(isCodeSent) {
        if (isCodeSent) {
            focusRequesters[0].requestFocus()
        }
    }
}

import SwiftUI

public struct PhoneVerificationSheetView: View {
    @Binding var phoneInput: String
    @Binding var isPresented: Bool
    var onSuccess: () -> Void
    
    @State private var isCodeSent: Bool = false
    @State private var otpDigits: [String] = ["", "", "", ""]
    @State private var verificationState: VerificationStatus = .idle
    @State private var errorMessage: String? = nil
    
    @FocusState private var activeBox: Int?
    @FocusState private var isPhoneFocused: Bool
    
    private enum VerificationStatus {
        case idle
        case checking
        case success
        case error
    }
    
    public init(
        phoneInput: Binding<String>,
        isPresented: Binding<Bool>,
        onSuccess: @escaping () -> Void
    ) {
        self._phoneInput = phoneInput
        self._isPresented = isPresented
        self.onSuccess = onSuccess
    }
    
    // Turkish Standard Phone Number Formatter (0 5XX XXX XX XX)
    // User doesn't need to type '0'; if they type '0' it is cleanly recognized as first char
    private func formatPhoneNumber(_ raw: String) -> String {
        var digits = raw.filter { $0.isNumber }
        if digits.isEmpty { return "" }
        
        // If user typed leading '0', strip it first to obtain 10-digit payload without doubling
        if digits.hasPrefix("0") {
            digits = String(digits.dropFirst())
        }
        
        // Take up to 10 digits (e.g. 5XX XXX XX XX)
        digits = String(digits.prefix(10))
        
        // Prepend fixed leading '0'
        let full = "0" + digits
        var result = ""
        for (idx, char) in full.enumerated() {
            if idx == 1 || idx == 4 || idx == 7 || idx == 9 {
                result.append(" ")
            }
            result.append(char)
        }
        return result
    }
    
    private var cleanPhoneDigits: String {
        var digits = phoneInput.filter { $0.isNumber }
        if digits.hasPrefix("0") {
            digits = String(digits.dropFirst())
        }
        digits = String(digits.prefix(10))
        return digits.isEmpty ? "" : ("0" + digits)
    }
    
    private func handleOtpEntered(_ fullCode: String) {
        errorMessage = nil
        verificationState = .checking
        
        // Simulate network verification check with server
        Task {
            try? await Task.sleep(nanoseconds: 700_000_000) // 700ms check
            
            if fullCode == "1111" {
                let success = await UserService.shared.verifyPhone(phone: cleanPhoneDigits)
                if success {
                    verificationState = .success
                    try? await Task.sleep(nanoseconds: 1_200_000_000) // 1.2s success preview
                    onSuccess()
                    isPresented = false
                } else {
                    verificationState = .error
                    errorMessage = "Telefon doğrulama servisi yanıt vermedi. Lütfen tekrar deneyiniz."
                }
            } else {
                verificationState = .error
                errorMessage = "Kod Yanlış! Lütfen SMS ile iletilen 4 haneli kodu giriniz."
                otpDigits = ["", "", "", ""]
                activeBox = 0
            }
        }
    }
    
    public var body: some View {
        NavigationStack {
            VStack(alignment: .center, spacing: 20) {
                if !isCodeSent {
                    // Header Badge
                    VStack(spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(PAGTheme.brandNavy.opacity(0.08))
                                .frame(width: 72, height: 72)
                            Image(systemName: "phone.badge.checkmark")
                                .font(.system(size: 32))
                                .foregroundColor(PAGTheme.brandNavy)
                        }
                        
                        Text("Telefon Doğrulama")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        Text("Numaranızı onaylayarak hesabınızı güvenceye alın ve anında +200 Profil Puanı kazanın.")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                    }
                    .padding(.top, 10)
                    
                    // Phone Input Field (Numeric Keyboard, Automatic '0' handling)
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Cep Telefonu Numaranız")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textSecondary)
                                .fontWeight(.semibold)
                            
                            Spacer()
                            
                            Text("\(cleanPhoneDigits.count)/11")
                                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                                .foregroundColor(cleanPhoneDigits.count == 11 ? .green : PAGTheme.textMuted)
                        }
                        
                        HStack(spacing: 12) {
                            Text("🇹🇷 +90")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(PAGTheme.textPrimary)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 12)
                                .background(PAGTheme.surfaceSecondary)
                                .cornerRadius(PAGRadius.small)
                            
                            TextField("0 5XX XXX XX XX", text: Binding(
                                get: { formatPhoneNumber(phoneInput) },
                                set: { newValue in
                                    var digits = newValue.filter { $0.isNumber }
                                    if digits.hasPrefix("0") {
                                        digits = String(digits.dropFirst())
                                    }
                                    digits = String(digits.prefix(10))
                                    phoneInput = digits.isEmpty ? "" : ("0" + digits)
                                }
                            ))
                            .focused($isPhoneFocused)
                            .keyboardType(.numberPad)
                            .font(.system(size: 17, weight: .bold, design: .monospaced))
                            .padding(12)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .overlay(
                                RoundedRectangle(cornerRadius: PAGRadius.medium)
                                    .stroke(isPhoneFocused ? PAGTheme.brandNavy : PAGTheme.borderDefault, lineWidth: 1.5)
                            )
                        }
                    }
                    .padding(.horizontal, 8)
                    
                    if let err = errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(PAGTheme.error)
                            Text(err)
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.error)
                        }
                    }
                    
                    // Action Button
                    PAGButton(
                        title: "SMS Onay Kodu Gönder",
                        iconName: "paperplane.fill",
                        style: .primary
                    ) {
                        let digits = cleanPhoneDigits
                        if digits.count != 11 {
                            errorMessage = "Lütfen 10 haneli telefon numaranızı eksiksiz giriniz."
                            return
                        }
                        errorMessage = nil
                        isCodeSent = true
                        activeBox = 0
                    }
                    .disabled(cleanPhoneDigits.count != 11)
                    
                } else {
                    // OTP Verification Step
                    VStack(spacing: 8) {
                        Image(systemName: "envelope.badge.shield.half.filled")
                            .font(.system(size: 38))
                            .foregroundColor(PAGTheme.brandNavy)
                        
                        Text("SMS Doğrulama Kodu")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        Text("\(formatPhoneNumber(phoneInput)) numarasına iletilen 4 haneli kodu giriniz.")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                    }
                    .padding(.top, 10)
                    
                    // 4-Digit OTP Boxes
                    HStack(spacing: 14) {
                        ForEach(0..<4, id: \.self) { index in
                            ZStack {
                                RoundedRectangle(cornerRadius: PAGRadius.medium)
                                    .fill(PAGTheme.surfacePrimary)
                                    .frame(width: 58, height: 64)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: PAGRadius.medium)
                                            .stroke(
                                                verificationState == .error ? PAGTheme.error :
                                                (verificationState == .success ? Color.green :
                                                (activeBox == index ? PAGTheme.brandNavy : PAGTheme.borderDefault)),
                                                lineWidth: activeBox == index ? 2 : 1.5
                                            )
                                    )
                                
                                TextField("", text: Binding(
                                    get: { otpDigits[index] },
                                    set: { newValue in
                                        handleOtpChange(newValue, at: index)
                                    }
                                ))
                                .focused($activeBox, equals: index)
                                .keyboardType(.numberPad)
                                .font(.system(size: 26, weight: .black, design: .monospaced))
                                .multilineTextAlignment(.center)
                                .foregroundColor(PAGTheme.textPrimary)
                            }
                        }
                    }
                    .padding(.vertical, 10)
                    
                    // Verification State Banners
                    if verificationState == .checking {
                        HStack(spacing: 8) {
                            ProgressView()
                                .tint(PAGTheme.brandNavy)
                            Text("Kontrol ediliyor...")
                                .font(PAGTypography.body)
                                .fontWeight(.semibold)
                                .foregroundColor(PAGTheme.brandNavy)
                        }
                    } else if verificationState == .success {
                        VStack(spacing: 4) {
                            Text("✅ Onaylandı!")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.green)
                            Text("+200 Profil Puanı hesabınıza tanımlandı.")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textSecondary)
                        }
                    } else if let err = errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(PAGTheme.error)
                            Text(err)
                                .font(PAGTypography.caption)
                                .fontWeight(.bold)
                                .foregroundColor(PAGTheme.error)
                        }
                    }
                    
                    // Resend / Change Phone Buttons
                    HStack(spacing: 20) {
                        Button("Numarayı Değiştir") {
                            isCodeSent = false
                            otpDigits = ["", "", "", ""]
                            errorMessage = nil
                            verificationState = .idle
                        }
                        .font(PAGTypography.caption)
                        .foregroundColor(PAGTheme.textSecondary)
                        
                        Button("Tekrar Kod Gönder") {
                            errorMessage = nil
                            otpDigits = ["", "", "", ""]
                            activeBox = 0
                        }
                        .font(PAGTypography.caption)
                        .fontWeight(.bold)
                        .foregroundColor(PAGTheme.brandNavy)
                    }
                    .padding(.top, 6)
                }
                
                Spacer()
            }
            .padding(20)
            .navigationTitle("Telefon Doğrulama")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Kapat") {
                        isPresented = false
                    }
                    .foregroundColor(PAGTheme.textSecondary)
                }
            }
        }
    }
    
    private func handleOtpChange(_ text: String, at index: Int) {
        let filtered = text.filter { $0.isNumber }
        
        // Handle Paste (e.g. "1111")
        if filtered.count > 1 {
            let digits = Array(filtered.prefix(4))
            for (i, d) in digits.enumerated() {
                if i < 4 { otpDigits[i] = String(d) }
            }
            if digits.count == 4 {
                activeBox = nil
                handleOtpEntered(String(digits))
            } else {
                activeBox = min(digits.count, 3)
            }
            return
        }
        
        if filtered.isEmpty {
            otpDigits[index] = ""
            if index > 0 { activeBox = index - 1 }
        } else {
            otpDigits[index] = String(filtered.last!)
            if index < 3 {
                activeBox = index + 1
            } else {
                activeBox = nil
                let full = otpDigits.joined()
                if full.count == 4 {
                    handleOtpEntered(full)
                }
            }
        }
    }
}

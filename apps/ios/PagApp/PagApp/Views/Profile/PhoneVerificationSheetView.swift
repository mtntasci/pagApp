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
    private func formatPhoneNumber(_ raw: String) -> String {
        var digits = raw.filter { $0.isNumber }
        if digits.isEmpty { return "" }
        
        // If user starts without leading 0, prepend 0
        if !digits.hasPrefix("0") {
            digits = "0" + digits
        }
        
        var result = ""
        for (idx, char) in digits.enumerated() {
            if idx == 1 || idx == 4 || idx == 7 || idx == 9 {
                result.append(" ")
            }
            result.append(char)
            if result.count >= 15 { break } // "0 5XX XXX XX XX" has 15 chars
        }
        return result
    }
    
    private var cleanPhoneDigits: String {
        var digits = phoneInput.filter { $0.isNumber }
        if !digits.hasPrefix("0") && !digits.isEmpty {
            digits = "0" + digits
        }
        return digits
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
                    
                    // Phone Input Field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Cep Telefonu Numaranız")
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.textSecondary)
                            .fontWeight(.semibold)
                        
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
                                set: { newValue in phoneInput = newValue.filter { $0.isNumber } }
                            ))
                            .focused($isPhoneFocused)
                            .keyboardType(.phonePad)
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
                    
                    Spacer()
                    
                    PAGButton(title: "Doğrulama Kodu Gönder", iconName: "paperplane.fill", style: .primary) {
                        if cleanPhoneDigits.count >= 11 {
                            errorMessage = nil
                            isCodeSent = true
                            activeBox = 0
                        } else {
                            errorMessage = "Lütfen 11 haneli geçerli telefon numaranızı giriniz (0 5XX...)."
                        }
                    }
                    .padding(.bottom, 8)
                } else {
                    // OTP Verification Step
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(verificationState == .success ? Color.green.opacity(0.12) : verificationState == .error ? Color.red.opacity(0.12) : PAGTheme.brandNavy.opacity(0.08))
                                .frame(width: 68, height: 68)
                            
                            if verificationState == .success {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 34))
                                    .foregroundColor(.green)
                            } else if verificationState == .error {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 34))
                                    .foregroundColor(PAGTheme.error)
                            } else {
                                Image(systemName: "message.fill")
                                    .font(.system(size: 28))
                                    .foregroundColor(PAGTheme.brandNavy)
                            }
                        }
                        
                        Text("SMS Doğrulama Kodu")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        Text("\(formatPhoneNumber(phoneInput)) numarasına gönderilen 4 haneli kodu giriniz.")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                    }
                    .padding(.top, 8)
                    
                    // 4-Digit OTP Boxes
                    HStack(spacing: 14) {
                        ForEach(0..<4, id: \.self) { idx in
                            TextField("", text: Binding(
                                get: { otpDigits[idx] },
                                set: { newValue in
                                    let filtered = newValue.filter { $0.isNumber }
                                    if filtered.count > 1 {
                                        // Paste support for 4 digits
                                        let chars = Array(filtered.prefix(4))
                                        for (i, c) in chars.enumerated() {
                                            if i < 4 { otpDigits[i] = String(c) }
                                        }
                                        let codeStr = otpDigits.joined()
                                        if codeStr.count == 4 {
                                            activeBox = nil
                                            handleOtpEntered(codeStr)
                                        }
                                    } else {
                                        otpDigits[idx] = filtered
                                        if !filtered.isEmpty {
                                            if idx < 3 {
                                                activeBox = idx + 1
                                            } else {
                                                activeBox = nil
                                                let codeStr = otpDigits.joined()
                                                handleOtpEntered(codeStr)
                                            }
                                        }
                                    }
                                }
                            ))
                            .focused($activeBox, equals: idx)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.center)
                            .font(.system(size: 26, weight: .black, design: .rounded))
                            .frame(width: 58, height: 64)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .overlay(
                                RoundedRectangle(cornerRadius: PAGRadius.medium)
                                    .stroke(
                                        verificationState == .success ? Color.green :
                                        verificationState == .error ? PAGTheme.error :
                                        (activeBox == idx ? PAGTheme.brandNavy : PAGTheme.borderDefault),
                                        lineWidth: (activeBox == idx || verificationState != .idle) ? 2 : 1
                                    )
                            )
                            .disabled(verificationState == .checking || verificationState == .success)
                        }
                    }
                    .padding(.vertical, 12)
                    
                    // Status Banners
                    if verificationState == .checking {
                        HStack(spacing: 10) {
                            ProgressView()
                                .tint(PAGTheme.brandNavy)
                            Text("Kontrol ediliyor... Lütfen bekleyiniz.")
                                .font(PAGTypography.body)
                                .fontWeight(.semibold)
                                .foregroundColor(PAGTheme.brandNavy)
                        }
                        .padding(.vertical, 8)
                    } else if verificationState == .success {
                        VStack(spacing: 4) {
                            Text("✅ Onaylandı!")
                                .font(.system(size: 17, weight: .bold))
                                .foregroundColor(.green)
                            Text("+200 Profil Puanı hesabınıza yüklendi.")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textSecondary)
                        }
                        .padding(.vertical, 6)
                    } else if let err = errorMessage {
                        VStack(spacing: 4) {
                            Text("⚠️ \(err)")
                                .font(PAGTypography.caption)
                                .fontWeight(.bold)
                                .foregroundColor(PAGTheme.error)
                                .multilineTextAlignment(.center)
                            Text("Geliştirme / Test Kodu: 1111")
                                .font(.system(size: 11, weight: .medium, design: .monospaced))
                                .foregroundColor(PAGTheme.textMuted)
                        }
                        .padding(.vertical, 4)
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        isCodeSent = false
                        otpDigits = ["", "", "", ""]
                        verificationState = .idle
                        errorMessage = nil
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "pencil")
                            Text("Numarayı Değiştir / Tekrar Gönder")
                        }
                        .font(PAGTypography.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(PAGTheme.brandNavy)
                    }
                    .disabled(verificationState == .checking || verificationState == .success)
                    .padding(.bottom, 8)
                }
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
}

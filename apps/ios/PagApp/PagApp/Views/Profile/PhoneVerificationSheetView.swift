import SwiftUI

public struct PhoneVerificationSheetView: View {
    @Binding var phoneInput: String
    @Binding var isPresented: Bool
    var onSuccess: () -> Void
    
    @State private var isCodeSent: Bool = false
    @State private var otpDigits: [String] = ["", "", "", ""]
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil
    
    @FocusState private var activeBox: Int?
    
    public init(
        phoneInput: Binding<String>,
        isPresented: Binding<Bool>,
        onSuccess: @escaping () -> Void
    ) {
        self._phoneInput = phoneInput
        self._isPresented = isPresented
        self.onSuccess = onSuccess
    }
    
    // Turkish Phone Number Formatter (05XX XXX XX XX)
    private func formatPhoneNumber(_ raw: String) -> String {
        let digits = raw.filter { $0.isNumber }
        var result = ""
        for (idx, char) in digits.enumerated() {
            if idx == 4 || idx == 7 || idx == 9 {
                result.append(" ")
            }
            result.append(char)
            if result.count >= 14 { break }
        }
        return result
    }
    
    private var cleanPhoneDigits: String {
        phoneInput.filter { $0.isNumber }
    }
    
    private func handleOtpEntered(_ fullCode: String) {
        // TEMP DEV TEST BYPASS: 1111
        if fullCode == "1111" {
            errorMessage = nil
            isSubmitting = true
            Task {
                let success = await UserService.shared.verifyPhone(phone: cleanPhoneDigits)
                isSubmitting = false
                if success {
                    onSuccess()
                    isPresented = false
                } else {
                    errorMessage = "Telefon doğrulama servisi yanıt vermedi. Lütfen tekrar deneyiniz."
                }
            }
        } else {
            errorMessage = "Doğrulama kodu hatalı. Lütfen tekrar deneyiniz."
        }
    }
    
    public var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: PAGSpacing.md) {
                if !isCodeSent {
                    Text("Telefon numaranızı onaylayarak +200 Profil Puanı kazanın.")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textSecondary)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Telefon Numarası")
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.textMuted)
                        
                        TextField("05XX XXX XX XX", text: Binding(
                            get: { formatPhoneNumber(phoneInput) },
                            set: { newValue in phoneInput = newValue.filter { $0.isNumber } }
                        ))
                        .keyboardType(.numberPad)
                        .font(PAGTypography.heading)
                        .padding(14)
                        .background(PAGTheme.surfacePrimary)
                        .cornerRadius(PAGRadius.medium)
                        .overlay(RoundedRectangle(cornerRadius: PAGRadius.medium).stroke(PAGTheme.borderDefault, lineWidth: 1))
                    }
                    
                    if let err = errorMessage {
                        Text(err)
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.error)
                    }
                    
                    Spacer()
                    
                    PAGButton(title: "Kod Gönder", iconName: "paperplane.fill", style: .primary) {
                        if cleanPhoneDigits.count >= 10 {
                            errorMessage = nil
                            isCodeSent = true
                            activeBox = 0
                        } else {
                            errorMessage = "Lütfen geçerli bir telefon numarası giriniz."
                        }
                    }
                } else {
                    Text("\(formatPhoneNumber(phoneInput)) numaralı telefonunuza gönderilen 4 haneli doğrulama kodunu giriniz.")
                        .font(PAGTypography.body)
                        .foregroundColor(PAGTheme.textSecondary)
                    
                    // 4 Digit OTP Box Row
                    HStack(spacing: 12) {
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
                            .font(.system(size: 24, weight: .bold))
                            .frame(width: 56, height: 60)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .overlay(
                                RoundedRectangle(cornerRadius: PAGRadius.medium)
                                    .stroke(activeBox == idx ? PAGTheme.brandLime : PAGTheme.borderDefault, lineWidth: 1.5)
                            )
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 16)
                    
                    if isSubmitting {
                        HStack {
                            Spacer()
                            ProgressView()
                                .tint(PAGTheme.brandLime)
                            Text("Doğrulanıyor...")
                                .font(PAGTypography.body)
                                .foregroundColor(PAGTheme.brandLime)
                            Spacer()
                        }
                    }
                    
                    if let err = errorMessage {
                        Text(err)
                            .font(PAGTypography.caption)
                            .foregroundColor(PAGTheme.error)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: .infinity)
                    }
                    
                    Spacer()
                    
                    HStack {
                        Button("Numarayı Değiştir") {
                            isCodeSent = false
                            otpDigits = ["", "", "", ""]
                            errorMessage = nil
                        }
                        .font(PAGTypography.caption)
                        .foregroundColor(PAGTheme.textMuted)
                        
                        Spacer()
                    }
                }
            }
            .padding()
            .navigationTitle("Telefon Doğrulama (+200 PP)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Kapat") {
                        isPresented = false
                    }
                }
            }
        }
    }
}

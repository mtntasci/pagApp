import SwiftUI

public struct IbanVerificationSheetView: View {
    @Binding var ibanInput: String
    @Binding var tcknInput: String
    @Binding var isPresented: Bool
    var onSuccess: () -> Void
    
    @State private var uiState: IbanUiState = .idle
    @State private var errorMessage: String? = nil
    
    @FocusState private var focusedField: Field?
    
    private enum Field {
        case tckn
        case iban
    }
    
    private enum IbanUiState {
        case idle
        case verifying
        case success
        case error
    }
    
    public init(
        ibanInput: Binding<String>,
        tcknInput: Binding<String>,
        isPresented: Binding<Bool>,
        onSuccess: @escaping () -> Void
    ) {
        self._ibanInput = ibanInput
        self._tcknInput = tcknInput
        self._isPresented = isPresented
        self.onSuccess = onSuccess
    }
    
    // Turkish IBAN Formatter (TRXX XXXX XXXX XXXX XXXX XXXX XX)
    // Automatically handles pasted "TR..." or direct numeric typing with numberPad
    private func formatIban(_ raw: String) -> String {
        var clean = raw.uppercased().replacingOccurrences(of: "[^A-Z0-9]", with: "", options: .regularExpression)
        if clean.isEmpty { return "" }
        
        // Strip leading TR / T if present in pasted text to prevent duplication
        if clean.hasPrefix("TR") {
            clean = String(clean.dropFirst(2))
        } else if clean.hasPrefix("T") {
            clean = String(clean.dropFirst(1))
        }
        
        // Max 24 digits after TR
        clean = String(clean.prefix(24))
        
        // Prepend TR
        let fullIban = "TR" + clean
        
        // Group into 4-character blocks
        var result = ""
        for (idx, char) in fullIban.enumerated() {
            if idx > 0 && idx % 4 == 0 {
                result.append(" ")
            }
            result.append(char)
        }
        return result
    }
    
    private var cleanTcknDigits: String {
        String(tcknInput.filter { $0.isNumber }.prefix(11))
    }
    
    private var cleanIbanDigits: String {
        let formatted = formatIban(ibanInput)
        return formatted.replacingOccurrences(of: " ", with: "")
    }
    
    private func handleVerify() {
        errorMessage = nil
        
        let tckn = cleanTcknDigits
        let iban = cleanIbanDigits
        
        if tckn.count != 11 {
            errorMessage = "Lütfen 11 haneli TC Kimlik Numaranızı eksiksiz giriniz."
            focusedField = .tckn
            return
        }
        
        if tckn.hasPrefix("0") {
            errorMessage = "TC Kimlik Numarası '0' ile başlayamaz."
            focusedField = .tckn
            return
        }
        
        if iban.count != 26 || !iban.hasPrefix("TR") {
            errorMessage = "Lütfen 26 haneli TR IBAN numaranızı eksiksiz giriniz (TR + 24 hane)."
            focusedField = .iban
            return
        }
        
        uiState = .verifying
        
        Task {
            // Simulated banking API validation check
            try? await Task.sleep(nanoseconds: 700_000_000)
            
            let success = await UserService.shared.submitIbanAndTckn(iban: iban, tckn: tckn)
            if success {
                uiState = .success
                try? await Task.sleep(nanoseconds: 1_200_000_000)
                onSuccess()
                isPresented = false
            } else {
                uiState = .error
                errorMessage = "IBAN doğrulama servisi yanıt vermedi. Lütfen tekrar deneyiniz."
            }
        }
    }
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header Icon & Description
                    VStack(spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(PAGTheme.brandNavy.opacity(0.08))
                                .frame(width: 72, height: 72)
                            Image(systemName: "creditcard.fill")
                                .font(.system(size: 32))
                                .foregroundColor(PAGTheme.brandNavy)
                        }
                        
                        Text("Banka & Kimlik Bilgileri")
                            .font(PAGTypography.heading)
                            .foregroundColor(PAGTheme.textPrimary)
                        
                        Text("Anketlerden kazanacağınız nakit ödüllerin banka hesabınıza aktarılabilmesi için bilgilerinizi eksiksiz giriniz.")
                            .font(PAGTypography.body)
                            .foregroundColor(PAGTheme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 12)
                    }
                    .padding(.top, 12)
                    
                    // Form Fields Card
                    VStack(alignment: .leading, spacing: 18) {
                        // 1. TC Kimlik Numarası (Strict 11 digits, Numeric Keyboard)
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text("TC Kimlik Numarası")
                                    .font(PAGTypography.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(PAGTheme.textPrimary)
                                
                                Spacer()
                                
                                Text("\(cleanTcknDigits.count)/11")
                                    .font(.system(size: 11, weight: .semibold, design: .monospaced))
                                    .foregroundColor(cleanTcknDigits.count == 11 ? .green : PAGTheme.textMuted)
                            }
                            
                            TextField("11 haneli kimlik numaranız", text: Binding(
                                get: { cleanTcknDigits },
                                set: { newValue in
                                    let digits = newValue.filter { $0.isNumber }
                                    tcknInput = String(digits.prefix(11))
                                }
                            ))
                            .focused($focusedField, equals: .tckn)
                            .keyboardType(.numberPad)
                            .font(.system(size: 16, weight: .bold, design: .monospaced))
                            .padding(14)
                            .background(PAGTheme.surfacePrimary)
                            .cornerRadius(PAGRadius.medium)
                            .overlay(
                                RoundedRectangle(cornerRadius: PAGRadius.medium)
                                    .stroke(focusedField == .tckn ? PAGTheme.brandNavy : PAGTheme.borderDefault, lineWidth: 1.5)
                            )
                        }
                        
                        // 2. IBAN Numarası (Numeric Keyboard, Automatic TR prefix, Exact 26 chars)
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text("IBAN Numarası")
                                    .font(PAGTypography.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(PAGTheme.textPrimary)
                                
                                Spacer()
                                
                                Text("\(cleanIbanDigits.count)/26")
                                    .font(.system(size: 11, weight: .semibold, design: .monospaced))
                                    .foregroundColor(cleanIbanDigits.count == 26 ? .green : PAGTheme.textMuted)
                            }
                            
                            HStack(spacing: 8) {
                                Text("TR")
                                    .font(.system(size: 15, weight: .bold, design: .monospaced))
                                    .foregroundColor(PAGTheme.brandNavy)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 12)
                                    .background(PAGTheme.surfaceSecondary)
                                    .cornerRadius(PAGRadius.small)
                                
                                TextField("24 haneli hesap numaranız", text: Binding(
                                    get: {
                                        let fmt = formatIban(ibanInput)
                                        if fmt.hasPrefix("TR") {
                                            return String(fmt.dropFirst(2)).trimmingCharacters(in: .whitespaces)
                                        }
                                        return fmt
                                    },
                                    set: { newValue in
                                        ibanInput = formatIban(newValue)
                                    }
                                ))
                                .focused($focusedField, equals: .iban)
                                .keyboardType(.numberPad)
                                .font(.system(size: 15, weight: .bold, design: .monospaced))
                                .padding(12)
                                .background(PAGTheme.surfacePrimary)
                                .cornerRadius(PAGRadius.medium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: PAGRadius.medium)
                                        .stroke(focusedField == .iban ? PAGTheme.brandNavy : PAGTheme.borderDefault, lineWidth: 1.5)
                                )
                            }
                        }
                    }
                    .padding(16)
                    .background(PAGTheme.surfaceSecondary)
                    .cornerRadius(PAGRadius.large)
                    
                    // Status Banners
                    if uiState == .verifying {
                        HStack(spacing: 10) {
                            ProgressView()
                                .tint(PAGTheme.brandNavy)
                            Text("Banka ve hesap bilgileri doğrulanıyor...")
                                .font(PAGTypography.body)
                                .fontWeight(.semibold)
                                .foregroundColor(PAGTheme.brandNavy)
                        }
                        .padding(.vertical, 4)
                    } else if uiState == .success {
                        VStack(spacing: 4) {
                            Text("✅ Doğrulandı!")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.green)
                            Text("IBAN bilginiz başarıyla kaydedildi (+200 PP).")
                                .font(PAGTypography.caption)
                                .foregroundColor(PAGTheme.textSecondary)
                        }
                        .padding(.vertical, 4)
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
                    
                    // Submit Button
                    PAGButton(
                        title: uiState == .verifying ? "Doğrulanıyor..." : "IBAN'ı Doğrula & Kaydet",
                        iconName: "checkmark.shield.fill",
                        style: .primary
                    ) {
                        focusedField = nil
                        handleVerify()
                    }
                    .disabled(uiState == .verifying || uiState == .success || cleanTcknDigits.count != 11 || cleanIbanDigits.count != 26)
                    
                    // Info Note
                    HStack(spacing: 8) {
                        Image(systemName: "lock.shield.fill")
                            .font(.system(size: 14))
                            .foregroundColor(PAGTheme.textMuted)
                        Text("Verileriniz 256-bit SSL ve KVKK standartlarında güvenle saklanmaktadır.")
                            .font(.system(size: 11))
                            .foregroundColor(PAGTheme.textMuted)
                    }
                    .padding(.top, 4)
                }
                .padding(20)
            }
            .navigationTitle("IBAN Doğrulama")
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

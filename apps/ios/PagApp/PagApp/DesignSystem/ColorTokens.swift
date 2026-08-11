import SwiftUI
import UIKit

// MARK: - Color Extension for Hex Initialization
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - PAG Centralized Design Tokens
public enum PAGTheme {
    // Brand Colors
    public static let brandMidnight = Color(hex: "#101827")
    public static let brandLime     = Color(hex: "#B7F34A")
    public static let brandBlue     = Color(hex: "#3977F6")

    // Semantic Adaptive Colors
    public static let backgroundPrimary = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(Color(hex: "#0B101B")) : UIColor(Color(hex: "#F7F8FA"))
    })
    
    public static let surfacePrimary = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(Color(hex: "#151D2B")) : UIColor(Color(hex: "#FFFFFF"))
    })
    
    public static let surfaceSecondary = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(Color(hex: "#1C2636")) : UIColor(Color(hex: "#F0F2F5"))
    })

    public static let textPrimary = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(Color(hex: "#F8FAFC")) : UIColor(Color(hex: "#111827"))
    })
    
    public static let textSecondary = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(Color(hex: "#B8C0CC")) : UIColor(Color(hex: "#667085"))
    })

    public static let textMuted = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(Color(hex: "#7E8998")) : UIColor(Color(hex: "#98A2B3"))
    })

    public static let borderDefault = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(Color(hex: "#263244")) : UIColor(Color(hex: "#E4E7EC"))
    })

    public static let borderStrong = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(Color(hex: "#344258")) : UIColor(Color(hex: "#D0D5DD"))
    })

    // Functional State Colors
    public static let success = Color(hex: "#16A34A")
    public static let warning = Color(hex: "#F59E0B")
    public static let error   = Color(hex: "#DC2626")
    public static let info    = Color(hex: "#3977F6")
}

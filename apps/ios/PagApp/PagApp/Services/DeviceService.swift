import Foundation
import UIKit

public final class DeviceService {
    public static let shared = DeviceService()
    
    private let deviceIdKey = "PAGAppScopedDeviceId"
    
    private init() {}
    
    public var deviceId: String {
        if let vendorId = UIDevice.current.identifierForVendor?.uuidString {
            return vendorId
        }
        
        if let storedId = UserDefaults.standard.string(forKey: deviceIdKey) {
            return storedId
        }
        
        let newId = UUID().uuidString
        UserDefaults.standard.set(newId, forKey: deviceIdKey)
        return newId
    }
    
    public var platform: String {
        return "IOS"
    }
    
    public var appVersion: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }
}

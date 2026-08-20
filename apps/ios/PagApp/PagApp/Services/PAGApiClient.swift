import Foundation
import FirebaseAuth

public class PAGApiClient {
    public static let shared = PAGApiClient()
    
    public var baseUrl = "https://app.pagapp.com.tr/api/v1/mobile"
    
    private init() {}
    
    private func getAuthToken() async -> String? {
        guard let currentUser = Auth.auth().currentUser else { return nil }
        do {
            return try await currentUser.getIDToken()
        } catch {
            print("[PAGApiClient] Failed to get Firebase ID token: \(error)")
            return nil
        }
    }
    
    public func get(endpoint: String) async throws -> [String: Any] {
        guard let url = URL(string: "\(baseUrl)\(endpoint)") else {
            throw NSError(domain: "PAGApiClient", code: 400, userInfo: [NSLocalizedDescriptionKey: "Geçersiz URL"])
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("no-cache, no-store, must-revalidate", forHTTPHeaderField: "Cache-Control")
        request.setValue("no-cache", forHTTPHeaderField: "Pragma")
        
        if let token = await getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "PAGApiClient", code: 500, userInfo: [NSLocalizedDescriptionKey: "Geçersiz sunucu yanıtı"])
        }
        
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NSError(domain: "PAGApiClient", code: 500, userInfo: [NSLocalizedDescriptionKey: "JSON ayrıştırma hatası"])
        }
        
        if httpResponse.statusCode >= 400 {
            let errorMsg = json["error"] as? String ?? "İstek başarısız oldu (\(httpResponse.statusCode))"
            throw NSError(domain: "PAGApiClient", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: errorMsg])
        }
        
        return json
    }
    
    public func post(endpoint: String, body: [String: Any]) async throws -> [String: Any] {
        guard let url = URL(string: "\(baseUrl)\(endpoint)") else {
            throw NSError(domain: "PAGApiClient", code: 400, userInfo: [NSLocalizedDescriptionKey: "Geçersiz URL"])
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        if let token = await getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "PAGApiClient", code: 500, userInfo: [NSLocalizedDescriptionKey: "Geçersiz sunucu yanıtı"])
        }
        
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NSError(domain: "PAGApiClient", code: 500, userInfo: [NSLocalizedDescriptionKey: "JSON ayrıştırma hatası"])
        }
        
        if httpResponse.statusCode >= 400 {
            let errorMsg = json["error"] as? String ?? "İstek başarısız oldu (\(httpResponse.statusCode))"
            throw NSError(domain: "PAGApiClient", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: errorMsg])
        }
        
        return json
    }
    
    public func put(endpoint: String, body: [String: Any]) async throws -> [String: Any] {
        guard let url = URL(string: "\(baseUrl)\(endpoint)") else {
            throw NSError(domain: "PAGApiClient", code: 400, userInfo: [NSLocalizedDescriptionKey: "Geçersiz URL"])
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        if let token = await getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "PAGApiClient", code: 500, userInfo: [NSLocalizedDescriptionKey: "Geçersiz sunucu yanıtı"])
        }
        
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NSError(domain: "PAGApiClient", code: 500, userInfo: [NSLocalizedDescriptionKey: "JSON ayrıştırma hatası"])
        }
        
        if httpResponse.statusCode >= 400 {
            let errorMsg = json["error"] as? String ?? "İstek başarısız oldu (\(httpResponse.statusCode))"
            throw NSError(domain: "PAGApiClient", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: errorMsg])
        }
        
        return json
    }
}

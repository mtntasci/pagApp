import Foundation
import Combine
import FirebaseCore
import FirebaseAuth
import GoogleSignIn
import AuthenticationServices


@MainActor
public final class AuthService: ObservableObject {
    public static let shared = AuthService()

    @Published public private(set) var currentUser: AuthUser?
    @Published public private(set) var isAuthenticated: Bool = false
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?

    private var authListenerHandle: AuthStateDidChangeListenerHandle?

    public init() {
        listenToAuthState()
    }

    deinit {
        if let handle = authListenerHandle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
    }

    private func listenToAuthState() {
        authListenerHandle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                if let user = user {
                    self?.currentUser = AuthUser(user: user)
                    self?.isAuthenticated = true
                    Task {
                        await UserService.shared.bootstrapCurrentUser()
                    }
                } else {
                    self?.currentUser = nil
                    self?.isAuthenticated = false
                    UserService.shared.clearUserSession()
                }
            }
        }
    }

    public func signInWithGoogle() {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil

        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
            isLoading = false
            errorMessage = "Görüntüleme penceresi bulunamadı."
            return
        }

        if GIDSignIn.sharedInstance.configuration == nil,
           let clientID = FirebaseApp.app()?.options.clientID {
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
        }

        GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController) { [weak self] result, error in

            guard let self = self else { return }

            if let error = error {
                self.isLoading = false
                let nsError = error as NSError
                // Don't treat cancellation as a heavy error alert
                if nsError.code == GIDSignInError.canceled.rawValue {
                    return
                }
                self.errorMessage = "Google girişi başarısız oldu. Lütfen tekrar deneyin."
                return
            }

            guard let user = result?.user,
                  let idToken = user.idToken?.tokenString else {
                self.isLoading = false
                self.errorMessage = "Google doğrulama token'ı alınamadı."
                return
            }

            let credential = GoogleAuthProvider.credential(withIDToken: idToken, accessToken: user.accessToken.tokenString)

            Auth.auth().signIn(with: credential) { [weak self] _, authError in
                Task { @MainActor in
                    self?.isLoading = false
                    if let authError = authError {
                        self?.errorMessage = "Firebase oturumu açılamadı: \(authError.localizedDescription)"
                    }
                }
            }
        }
    }

    public func signInWithApple() {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil

        AppleSignInDelegate.shared.startAppleSignIn { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                switch result {
                case .success(let payload):
                    let credential = OAuthProvider.credential(withProviderID: "apple.com", idToken: payload.idToken, rawNonce: payload.rawNonce)

                    Auth.auth().signIn(with: credential) { [weak self] _, authError in
                        Task { @MainActor in
                            self?.isLoading = false
                            if let authError = authError {
                                self?.errorMessage = "Apple ile Firebase oturumu açılamadı."
                            }
                        }
                    }
                case .failure(let error):
                    self.isLoading = false
                    let nsError = error as NSError
                    if nsError.code == ASAuthorizationError.canceled.rawValue {
                        return
                    }
                    self.errorMessage = "Apple girişi başarısız oldu. Lütfen tekrar deneyin."
                }
            }
        }
    }

    public func signOut() {
        do {
            try Auth.auth().signOut()
            self.currentUser = nil
            self.isAuthenticated = false
            UserService.shared.clearUserSession()
        } catch {
            self.errorMessage = "Çıkış yapılırken bir hata oluştu."
        }
    }
}

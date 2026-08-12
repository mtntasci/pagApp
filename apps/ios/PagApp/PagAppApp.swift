//
//  PagAppApp.swift
//  PagApp
//
//  Created by Metin TASCI on 11.08.2026.
//

import SwiftUI
import FirebaseCore
import GoogleSignIn

@main
struct PagAppApp: App {
    @StateObject private var authService: AuthService

    init() {
        FirebaseApp.configure()
        _authService = StateObject(wrappedValue: AuthService())
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
                }
        }
    }
}



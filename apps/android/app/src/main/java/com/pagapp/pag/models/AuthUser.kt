package com.pagapp.pag.models

import com.google.firebase.auth.FirebaseUser

data class AuthUser(
    val uid: String,
    val email: String? = null,
    val displayName: String? = null,
    val photoUrl: String? = null,
    val provider: String = "firebase"
) {
    companion object {
        fun fromFirebaseUser(user: FirebaseUser): AuthUser {
            val primaryProvider = user.providerData.firstOrNull()?.providerId ?: "firebase"
            return AuthUser(
                uid = user.uid,
                email = user.email,
                displayName = user.displayName,
                photoUrl = user.photoUrl?.toString(),
                provider = primaryProvider
            )
        }
    }
}

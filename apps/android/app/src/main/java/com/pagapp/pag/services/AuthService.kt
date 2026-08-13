package com.pagapp.pag.services

import android.app.Activity
import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.pagapp.pag.R
import com.pagapp.pag.models.AuthUser
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.OAuthProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.security.MessageDigest
import java.util.UUID

object AuthService {
    private val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }

    private val _currentUser = MutableStateFlow<AuthUser?>(null)
    val currentUser: StateFlow<AuthUser?> = _currentUser.asStateFlow()

    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            if (user != null) {
                _currentUser.value = AuthUser.fromFirebaseUser(user)
                _isAuthenticated.value = true
            } else {
                _currentUser.value = null
                _isAuthenticated.value = false
            }
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }

    fun signInWithGoogle(activity: Activity) {
        if (_isLoading.value) return
        _isLoading.value = true
        _errorMessage.value = null

        val coroutineScope = CoroutineScope(Dispatchers.Main)
        coroutineScope.launch {
            try {
                val credentialManager = CredentialManager.create(activity)

                val rawNonce = UUID.randomUUID().toString()
                val bytes = MessageDigest.getInstance("SHA-256").digest(rawNonce.toByteArray())
                val hashedNonce = bytes.joinToString("") { "%02x".format(it) }

                val webClientId = try {
                    activity.getString(R.string.default_web_client_id)
                } catch (e: Exception) {
                    "1011540629150-7eoq9e295804jjgtmtl6je7i2c72a7qn.apps.googleusercontent.com"
                }

                val googleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId(webClientId)
                    .setNonce(hashedNonce)
                    .build()

                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()

                val result = credentialManager.getCredential(activity, request)
                val credential = result.credential

                if (credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    val firebaseCredential = GoogleAuthProvider.getCredential(googleIdTokenCredential.idToken, null)

                    auth.signInWithCredential(firebaseCredential)
                        .addOnSuccessListener {
                            _isLoading.value = false
                        }
                        .addOnFailureListener { e ->
                            _isLoading.value = false
                            _errorMessage.value = "Google oturumu açılamadı: ${e.localizedMessage}"
                        }
                } else {
                    _isLoading.value = false
                    _errorMessage.value = "Geçersiz Google kimlik bilgisi alındı."
                }
            } catch (e: GetCredentialCancellationException) {
                // User cancelled sign in - do not dramatize
                _isLoading.value = false
            } catch (e: GetCredentialException) {
                _isLoading.value = false
                _errorMessage.value = "Google ile giriş yaparken bir sorun oluştu."
            } catch (e: Exception) {
                _isLoading.value = false
                _errorMessage.value = "Google girişi başlatılamadı."
            }
        }
    }

    fun signInWithApple(activity: Activity) {
        if (_isLoading.value) return
        _isLoading.value = true
        _errorMessage.value = null

        val providerBuilder = OAuthProvider.newBuilder("apple.com")
        providerBuilder.scopes = listOf("email", "name")

        val pendingAuthResult = auth.pendingAuthResult
        if (pendingAuthResult != null) {
            pendingAuthResult
                .addOnSuccessListener {
                    _isLoading.value = false
                }
                .addOnFailureListener { e ->
                    _isLoading.value = false
                    _errorMessage.value = "Apple ile oturum açılamadı."
                }
        } else {
            auth.startActivityForSignInWithProvider(activity, providerBuilder.build())
                .addOnSuccessListener {
                    _isLoading.value = false
                }
                .addOnFailureListener { e ->
                    _isLoading.value = false
                    val message = e.localizedMessage ?: ""
                    if (!message.contains("canceled", ignoreCase = true) && !message.contains("cancelled", ignoreCase = true)) {
                        _errorMessage.value = "Apple ile giriş başarısız oldu. Lütfen tekrar deneyin."
                    }
                }
        }
    }

    fun signOut() {
        auth.signOut()
        _currentUser.value = null
        _isAuthenticated.value = false
    }
}

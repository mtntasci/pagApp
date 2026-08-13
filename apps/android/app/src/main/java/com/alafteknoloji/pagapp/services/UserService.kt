package com.alafteknoloji.pagapp.services

import android.content.Context
import com.alafteknoloji.pagapp.models.PAGUser
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

data class PAGUserRanking(
    val profileScore: Int,
    val rank: Int,
    val totalEligibleUsers: Int,
    val percentileText: String,
    val percentile: Double = run {
        if (rank == 1) {
            1.0
        } else {
            val parsed = percentileText.substringAfter("%", "").trim().toDoubleOrNull()
            parsed ?: if (totalEligibleUsers > 0) (rank.toDouble() / totalEligibleUsers.toDouble() * 100.0) else 100.0
        }
    }
)

class UserService(private val context: Context) {

    private val deviceService = DeviceService(context)
    private val functions = FirebaseFunctions.getInstance()

    private val _currentUser = MutableStateFlow<PAGUser?>(null)
    val currentUser: StateFlow<PAGUser?> = _currentUser.asStateFlow()

    private val _currentRanking = MutableStateFlow<PAGUserRanking?>(null)
    val currentRanking: StateFlow<PAGUserRanking?> = _currentRanking.asStateFlow()

    private val _isBootstrapping = MutableStateFlow(false)
    val isBootstrapping: StateFlow<Boolean> = _isBootstrapping.asStateFlow()

    private val _bootstrapError = MutableStateFlow<String?>(null)
    val bootstrapError: StateFlow<String?> = _bootstrapError.asStateFlow()

    suspend fun bootstrapCurrentUser() {
        if (_isBootstrapping.value) return

        _isBootstrapping.value = true
        _bootstrapError.value = null

        val payload = hashMapOf(
            "deviceId" to deviceService.deviceId,
            "platform" to deviceService.platform,
            "appVersion" to deviceService.appVersion
        )

        try {
            val result = functions.getHttpsCallable("bootstrapCurrentUser")
                .call(payload)
                .await()

            @Suppress("UNCHECKED_CAST")
            val responseMap = result.getData() as? Map<String, Any>
            val success = responseMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val userData = responseMap?.get("data") as? Map<String, Any>
                if (userData != null) {
                    val user = PAGUser(
                        userId = userData["userId"] as? String ?: "",
                        email = userData["email"] as? String,
                        phone = userData["phone"] as? String,
                        displayName = userData["displayName"] as? String,
                        photoUrl = userData["photoUrl"] as? String,
                        authProviders = (userData["authProviders"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                        status = userData["status"] as? String ?: "ACTIVE",
                        profileScore = (userData["profileScore"] as? Number)?.toInt() ?: 0,
                        profileCompleted = userData["profileCompleted"] as? Boolean ?: false,
                        phoneVerified = userData["phoneVerified"] as? Boolean ?: false,
                        emailVerified = userData["emailVerified"] as? Boolean ?: false,
                        kycStatus = userData["kycStatus"] as? String ?: "NOT_STARTED",
                        iban = userData["iban"] as? String,
                        tckn = userData["tckn"] as? String,
                        ibanVerified = userData["ibanVerified"] as? Boolean ?: false,
                        activeDeviceId = userData["activeDeviceId"] as? String
                    )
                    _currentUser.value = user
                    _isBootstrapping.value = false
                    fetchUserRanking()
                    return
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Fallback using active FirebaseAuth user session
        val authUser = FirebaseAuth.getInstance().currentUser
        if (authUser != null) {
            val fallbackUser = PAGUser(
                userId = authUser.uid,
                email = authUser.email,
                phone = authUser.phoneNumber,
                displayName = authUser.displayName ?: authUser.email?.substringBefore("@") ?: "PAG Kullanıcısı",
                photoUrl = authUser.photoUrl?.toString(),
                authProviders = authUser.providerData.map { it.providerId },
                status = "ACTIVE",
                profileScore = 0,
                profileCompleted = false,
                phoneVerified = !authUser.phoneNumber.isNullOrEmpty(),
                emailVerified = authUser.isEmailVerified,
                kycStatus = "NOT_STARTED",
                activeDeviceId = deviceService.deviceId
            )
            _currentUser.value = fallbackUser
            _bootstrapError.value = null
        } else {
            _bootstrapError.value = "Hesabınız hazırlanırken bir sorun oluştu. Lütfen tekrar deneyin."
        }
        _isBootstrapping.value = false
    }

    suspend fun fetchUserRanking() {
        try {
            val result = functions.getHttpsCallable("getCurrentUserRanking").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false
            if (success) {
                @Suppress("UNCHECKED_CAST")
                val rData = resMap?.get("data") as? Map<String, Any>
                if (rData != null) {
                    _currentRanking.value = PAGUserRanking(
                        profileScore = (rData["profileScore"] as? Number)?.toInt() ?: (_currentUser.value?.profileScore ?: 0),
                        rank = (rData["rank"] as? Number)?.toInt() ?: 1,
                        totalEligibleUsers = (rData["totalEligibleUsers"] as? Number)?.toInt() ?: 1,
                        percentileText = rData["percentileText"] as? String ?: "Top %1"
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun verifyPhone(phoneNumber: String): Boolean {
        return try {
            val payload = mapOf("phone" to phoneNumber)
            val result = functions.getHttpsCallable("verifyPhone").call(payload).await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false
            if (success) {
                bootstrapCurrentUser()
            }
            success
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun submitIbanAndTckn(iban: String, tckn: String): Boolean {
        return try {
            val payload = mapOf("iban" to iban, "tckn" to tckn)
            val result = functions.getHttpsCallable("submitIbanAndTckn").call(payload).await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false
            if (success) {
                bootstrapCurrentUser()
            }
            success
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun submitKyc(): Boolean {
        return try {
            val result = functions.getHttpsCallable("submitKyc").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false
            if (success) {
                bootstrapCurrentUser()
            }
            success
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun updateUserProfileScore(newScore: Int) {
        val user = _currentUser.value ?: return
        _currentUser.value = user.copy(profileScore = newScore)
    }

    fun clearUserSession() {
        _currentUser.value = null
        _currentRanking.value = null
        _isBootstrapping.value = false
        _bootstrapError.value = null
    }
}

package com.alafteknoloji.pagapp.services

import android.content.Context
import com.alafteknoloji.pagapp.models.PAGUser
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

data class PAGUserRanking(
    val profileScore: Int,
    val rank: Int,
    val totalEligibleUsers: Int,
    val percentileText: String
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
                        activeDeviceId = userData["activeDeviceId"] as? String
                    )
                    _currentUser.value = user
                    fetchUserRanking()
                } else {
                    _bootstrapError.value = "Hesabınız hazırlanırken bir sorun oluştu. Lütfen tekrar deneyin."
                }
            } else {
                _bootstrapError.value = "Hesabınız hazırlanırken bir sorun oluştu. Lütfen tekrar deneyin."
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _bootstrapError.value = "Hesabınız hazırlanırken bir sorun oluştu. Lütfen tekrar deneyin."
        } finally {
            _isBootstrapping.value = false
        }
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

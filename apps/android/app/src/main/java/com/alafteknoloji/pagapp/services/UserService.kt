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
            // 1. Try High-Speed REST API (~10ms)
            val jsonPayload = org.json.JSONObject()
            jsonPayload.put("deviceId", deviceService.deviceId)
            jsonPayload.put("platform", deviceService.platform)
            jsonPayload.put("appVersion", deviceService.appVersion)

            val apiRes = PAGApiClient.post("/bootstrap", jsonPayload)
            if (apiRes != null && apiRes.optBoolean("success")) {
                val userData = apiRes.optJSONObject("data")
                if (userData != null) {
                    val user = com.alafteknoloji.pagapp.models.PAGUser(
                        userId = userData.optString("userId"),
                        email = if (userData.isNull("email")) null else userData.optString("email"),
                        phone = if (userData.isNull("phone")) null else userData.optString("phone"),
                        displayName = userData.optString("displayName", "Kullanıcı"),
                        profileScore = userData.optInt("profileScore", 0),
                        status = userData.optString("status", "ACTIVE")
                    )
                    _currentUser.value = user
                    _currentRanking.value = PAGUserRanking(
                        profileScore = user.profileScore,
                        rank = 1,
                        totalEligibleUsers = 1,
                        percentileText = "%1"
                    )
                    _isBootstrapping.value = false
                    return
                }
            }

            // 2. Fallback to Firebase Callable
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
                    @Suppress("UNCHECKED_CAST")
                    val commPrefsData = userData["communicationPreferences"] as? Map<String, Any> ?: emptyMap()
                    val commPrefs = com.alafteknoloji.pagapp.models.CommunicationPreferences(
                        pushMarketing = commPrefsData["pushMarketing"] as? Boolean ?: false,
                        smsMarketing = commPrefsData["smsMarketing"] as? Boolean ?: false,
                        emailMarketing = commPrefsData["emailMarketing"] as? Boolean ?: false,
                        phoneMarketing = commPrefsData["phoneMarketing"] as? Boolean ?: false
                    )

                    @Suppress("UNCHECKED_CAST")
                    val missingDocsData = userData["missingDocuments"] as? List<Map<String, Any>> ?: emptyList()
                    val missingDocs = missingDocsData.mapNotNull { d ->
                        val docId = d["documentId"] as? String ?: return@mapNotNull null
                        val type = d["type"] as? String ?: return@mapNotNull null
                        val version = d["version"] as? String ?: return@mapNotNull null
                        val title = d["title"] as? String ?: return@mapNotNull null
                        val url = d["url"] as? String ?: return@mapNotNull null
                        val hash = d["contentHash"] as? String ?: return@mapNotNull null
                        com.alafteknoloji.pagapp.models.LegalDocument(
                            documentId = docId,
                            type = type,
                            version = version,
                            title = title,
                            url = url,
                            contentHash = hash,
                            isRequired = d["isRequired"] as? Boolean ?: true,
                            isActive = d["isActive"] as? Boolean ?: true,
                            requiresReacceptance = d["requiresReacceptance"] as? Boolean ?: false
                        )
                    }

                    val isUnderage = userData["isUnderage"] as? Boolean ?: (userData["status"] as? String == "SUSPENDED_UNDERAGE" || userData["status"] as? String == "UNDERAGE")

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
                        activeDeviceId = userData["activeDeviceId"] as? String,
                        legalConsentRequired = userData["legalConsentRequired"] as? Boolean ?: false,
                        missingDocumentIds = (userData["missingDocumentIds"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                        missingDocuments = missingDocs,
                        communicationPreferences = commPrefs,
                        isUnderage = isUnderage,
                        underageBlocked = isUnderage
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
                activeDeviceId = deviceService.deviceId,
                legalConsentRequired = true,
                missingDocumentIds = listOf("TERMS", "KVKK_NOTICE", "REWARD_TERMS"),
                communicationPreferences = com.alafteknoloji.pagapp.models.CommunicationPreferences(),
                isUnderage = false,
                underageBlocked = false
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

    fun completeLegalConsent(preferences: com.alafteknoloji.pagapp.models.CommunicationPreferences) {
        val user = _currentUser.value ?: return
        _currentUser.value = user.copy(
            legalConsentRequired = false,
            missingDocumentIds = emptyList(),
            missingDocuments = emptyList(),
            communicationPreferences = preferences
        )
    }

    fun updateCommunicationPreferencesState(preferences: com.alafteknoloji.pagapp.models.CommunicationPreferences) {
        val user = _currentUser.value ?: return
        _currentUser.value = user.copy(communicationPreferences = preferences)
    }

    fun clearUserSession() {
        _currentUser.value = null
        _currentRanking.value = null
        _isBootstrapping.value = false
        _bootstrapError.value = null
    }
}

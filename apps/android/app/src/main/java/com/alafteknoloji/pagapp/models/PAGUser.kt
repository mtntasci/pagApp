package com.alafteknoloji.pagapp.models

data class PAGUser(
    val userId: String,
    val email: String? = null,
    val phone: String? = null,
    val displayName: String? = null,
    val photoUrl: String? = null,
    val authProviders: List<String> = emptyList(),
    val status: String = "ACTIVE",
    val profileScore: Int = 0,
    val profileCompleted: Boolean = false,
    val phoneVerified: Boolean = false,
    val emailVerified: Boolean = false,
    val kycStatus: String = "NOT_STARTED",
    val activeDeviceId: String? = null
)

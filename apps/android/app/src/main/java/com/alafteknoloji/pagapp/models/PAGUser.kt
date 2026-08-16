package com.alafteknoloji.pagapp.models

data class PAGUser(
    val userId: String,
    val email: String? = null,
    val phone: String? = null,
    val displayName: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val photoUrl: String? = null,
    val authProviders: List<String> = emptyList(),
    val status: String = "ACTIVE",
    val profileScore: Int = 0,
    val profileCompleted: Boolean = false,
    val phoneVerified: Boolean = false,
    val emailVerified: Boolean = false,
    val kycStatus: String = "NOT_STARTED",
    val iban: String? = null,
    val tckn: String? = null,
    val ibanVerified: Boolean = false,
    val activeDeviceId: String? = null,
    val legalConsentRequired: Boolean = false,
    val missingDocumentIds: List<String> = emptyList(),
    val missingDocuments: List<LegalDocument> = emptyList(),
    val communicationPreferences: CommunicationPreferences = CommunicationPreferences(),
    val isUnderage: Boolean = false,
    val underageBlocked: Boolean = false
)

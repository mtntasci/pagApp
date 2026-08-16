package com.alafteknoloji.pagapp.models

enum class LegalDocumentType(val value: String) {
    TERMS("TERMS"),
    KVKK_NOTICE("KVKK_NOTICE"),
    EXPLICIT_CONSENT("EXPLICIT_CONSENT"),
    COMMERCIAL_COMMUNICATION("COMMERCIAL_COMMUNICATION"),
    REWARD_TERMS("REWARD_TERMS"),
    PRIVACY_POLICY("PRIVACY_POLICY"),
    AGE_SUITABILITY("AGE_SUITABILITY")
}

data class LegalDocument(
    val documentId: String,
    val type: String,
    val version: String,
    val title: String,
    val url: String,
    val contentHash: String,
    val isRequired: Boolean,
    val isActive: Boolean = true,
    val requiresReacceptance: Boolean = false
)

data class UserLegalAcceptance(
    val documentId: String,
    val documentType: String,
    val version: String,
    val contentHash: String,
    val accepted: Boolean = true,
    val source: String = "ANDROID"
)

data class CommunicationPreferences(
    val pushMarketing: Boolean = false,
    val smsMarketing: Boolean = false,
    val emailMarketing: Boolean = false,
    val phoneMarketing: Boolean = false
)

data class LegalConsentStatus(
    val consentRequired: Boolean,
    val activeDocuments: List<LegalDocument> = emptyList(),
    val requiredDocuments: List<LegalDocument> = emptyList(),
    val acceptedDocumentIds: List<String> = emptyList(),
    val missingDocumentIds: List<String> = emptyList(),
    val missingDocuments: List<LegalDocument> = emptyList(),
    val communicationPreferences: CommunicationPreferences = CommunicationPreferences()
)

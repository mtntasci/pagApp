package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.CommunicationPreferences
import com.alafteknoloji.pagapp.models.LegalDocument
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.tasks.await

class LegalService {
    private val functions = FirebaseFunctions.getInstance()

    suspend fun getActiveLegalDocuments(): List<LegalDocument> {
        return try {
            val result = functions.getHttpsCallable("getActiveLegalDocuments").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false
            if (success) {
                @Suppress("UNCHECKED_CAST")
                val docsData = resMap?.get("data") as? List<Map<String, Any>>
                docsData?.mapNotNull { d ->
                    val docId = d["documentId"] as? String ?: return@mapNotNull null
                    val type = d["type"] as? String ?: return@mapNotNull null
                    val version = d["version"] as? String ?: return@mapNotNull null
                    val title = d["title"] as? String ?: return@mapNotNull null
                    val url = d["url"] as? String ?: return@mapNotNull null
                    val hash = d["contentHash"] as? String ?: return@mapNotNull null
                    val isReq = d["isRequired"] as? Boolean ?: false
                    val isAct = d["isActive"] as? Boolean ?: true
                    val reqReacc = d["requiresReacceptance"] as? Boolean ?: false
                    LegalDocument(
                        documentId = docId,
                        type = type,
                        version = version,
                        title = title,
                        url = url,
                        contentHash = hash,
                        isRequired = isReq,
                        isActive = isAct,
                        requiresReacceptance = reqReacc
                    )
                } ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun recordLegalAcceptances(
        acceptedDocuments: List<LegalDocument>,
        preferences: CommunicationPreferences
    ): Boolean {
        return try {
            val acceptancesPayload = acceptedDocuments.map { doc ->
                mapOf(
                    "documentId" to doc.documentId,
                    "version" to doc.version,
                    "contentHash" to doc.contentHash
                )
            }
            val commPrefsPayload = mapOf(
                "pushMarketing" to preferences.pushMarketing,
                "smsMarketing" to preferences.smsMarketing,
                "emailMarketing" to preferences.emailMarketing,
                "phoneMarketing" to preferences.phoneMarketing
            )
            val payload = mapOf(
                "acceptances" to acceptancesPayload,
                "communicationPreferences" to commPrefsPayload,
                "source" to "ANDROID"
            )

            val result = functions.getHttpsCallable("recordLegalAcceptances").call(payload).await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            resMap?.get("success") as? Boolean ?: false
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun updateCommunicationPreferences(preferences: CommunicationPreferences): Boolean {
        return try {
            val payload = mapOf(
                "pushMarketing" to preferences.pushMarketing,
                "smsMarketing" to preferences.smsMarketing,
                "emailMarketing" to preferences.emailMarketing,
                "phoneMarketing" to preferences.phoneMarketing
            )
            val result = functions.getHttpsCallable("updateCommunicationPreferences").call(payload).await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            resMap?.get("success") as? Boolean ?: false
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}

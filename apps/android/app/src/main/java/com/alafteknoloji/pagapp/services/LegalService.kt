package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.CommunicationPreferences
import com.alafteknoloji.pagapp.models.LegalDocument
import org.json.JSONArray
import org.json.JSONObject

class LegalService {

    suspend fun getActiveLegalDocuments(): List<LegalDocument> {
        return try {
            val apiRes = PAGApiClient.get("/legal/documents")
            if (apiRes != null && apiRes.optBoolean("success")) {
                val dataArr = apiRes.optJSONArray("data")
                if (dataArr != null) {
                    val list = mutableListOf<LegalDocument>()
                    for (i in 0 until dataArr.length()) {
                        val d = dataArr.getJSONObject(i)
                        list.add(
                            LegalDocument(
                                documentId = d.optString("documentId"),
                                type = d.optString("type"),
                                version = d.optString("version"),
                                title = d.optString("title"),
                                url = d.optString("url"),
                                contentHash = d.optString("contentHash"),
                                isRequired = d.optBoolean("isRequired", true),
                                isActive = d.optBoolean("isActive", true),
                                requiresReacceptance = d.optBoolean("requiresReacceptance", false)
                            )
                        )
                    }
                    return list
                }
            }
            listOf(
                LegalDocument("TERMS", "TERMS", "1.0", "Kullanım Koşulları ve Üyelik Sözleşmesi", "https://www.pagapp.com.tr/terms", "PAG_TERMS_V1.0", true),
                LegalDocument("KVKK_NOTICE", "KVKK_NOTICE", "1.0", "Kullanıcı Gizliliği ve KVKK Aydınlatma Metni", "https://www.pagapp.com.tr/user-privacy", "PAG_KVKK_NOTICE_V1.0", true),
                LegalDocument("REWARD_TERMS", "REWARD_TERMS", "1.0", "Ödül ve Kampanya Katılım Koşulları", "https://www.pagapp.com.tr/reward-terms", "PAG_REWARD_TERMS_V1.0", true)
            )
        } catch (e: Exception) {
            e.printStackTrace()
            listOf(
                LegalDocument("TERMS", "TERMS", "1.0", "Kullanım Koşulları ve Üyelik Sözleşmesi", "https://www.pagapp.com.tr/terms", "PAG_TERMS_V1.0", true),
                LegalDocument("KVKK_NOTICE", "KVKK_NOTICE", "1.0", "Kullanıcı Gizliliği ve KVKK Aydınlatma Metni", "https://www.pagapp.com.tr/user-privacy", "PAG_KVKK_NOTICE_V1.0", true),
                LegalDocument("REWARD_TERMS", "REWARD_TERMS", "1.0", "Ödül ve Kampanya Katılım Koşulları", "https://www.pagapp.com.tr/reward-terms", "PAG_REWARD_TERMS_V1.0", true)
            )
        }
    }

    suspend fun recordLegalAcceptances(
        acceptedDocuments: List<LegalDocument>,
        preferences: CommunicationPreferences,
        birthYear: Int? = null
    ): Boolean {
        return try {
            val acceptancesArray = JSONArray()
            acceptedDocuments.forEach { doc ->
                val obj = JSONObject()
                obj.put("documentId", doc.documentId)
                obj.put("version", doc.version)
                obj.put("contentHash", doc.contentHash)
                acceptancesArray.put(obj)
            }

            val commPrefsObj = JSONObject()
            commPrefsObj.put("pushMarketing", preferences.pushMarketing)
            commPrefsObj.put("smsMarketing", preferences.smsMarketing)
            commPrefsObj.put("emailMarketing", preferences.emailMarketing)
            commPrefsObj.put("phoneMarketing", preferences.phoneMarketing)

            val payload = JSONObject()
            payload.put("acceptances", acceptancesArray)
            payload.put("communicationPreferences", commPrefsObj)
            payload.put("source", "ANDROID")
            if (birthYear != null) {
                payload.put("birthYear", birthYear)
            }

            val apiRes = PAGApiClient.post("/legal/acceptances", payload)
            apiRes != null && apiRes.optBoolean("success")
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun updateCommunicationPreferences(preferences: CommunicationPreferences): Boolean {
        return try {
            val commPrefsObj = JSONObject()
            commPrefsObj.put("pushMarketing", preferences.pushMarketing)
            commPrefsObj.put("smsMarketing", preferences.smsMarketing)
            commPrefsObj.put("emailMarketing", preferences.emailMarketing)
            commPrefsObj.put("phoneMarketing", preferences.phoneMarketing)

            val payload = JSONObject()
            payload.put("communicationPreferences", commPrefsObj)

            val apiRes = PAGApiClient.post("/legal/acceptances", payload)
            apiRes != null && apiRes.optBoolean("success")
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}

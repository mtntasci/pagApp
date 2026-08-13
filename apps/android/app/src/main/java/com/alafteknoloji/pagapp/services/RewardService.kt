package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.PAGRewardLedgerEntry
import com.alafteknoloji.pagapp.models.PAGVoucher
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

data class PAGScoreLedgerEntry(
    val id: String = "",
    val sourceType: String = "BASIC_PROFILE",
    val amount: Int = 10,
    val reason: String = "Profil Puanı Ödülü",
    val createdAt: String = ""
)

class RewardService {
    private val functions: FirebaseFunctions = FirebaseFunctions.getInstance()

    private val _rewardBalance = MutableStateFlow(0)
    val rewardBalance: StateFlow<Int> = _rewardBalance.asStateFlow()

    private val _profileScore = MutableStateFlow(0)
    val profileScore: StateFlow<Int> = _profileScore.asStateFlow()

    private val _rewardLedgers = MutableStateFlow<List<PAGRewardLedgerEntry>>(emptyList())
    val rewardLedgers: StateFlow<List<PAGRewardLedgerEntry>> = _rewardLedgers.asStateFlow()

    private val _vouchers = MutableStateFlow<List<PAGVoucher>>(emptyList())
    val vouchers: StateFlow<List<PAGVoucher>> = _vouchers.asStateFlow()

    private val _scoreLedgers = MutableStateFlow<List<PAGScoreLedgerEntry>>(emptyList())
    val scoreLedgers: StateFlow<List<PAGScoreLedgerEntry>> = _scoreLedgers.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    suspend fun fetchUserRewards() {
        _isLoading.value = true
        try {
            val result = functions.getHttpsCallable("getUserRewards").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val dataDict = resMap?.get("data") as? Map<String, Any>
                if (dataDict != null) {
                    _rewardBalance.value = (dataDict["rewardBalance"] as? Number)?.toInt() ?: 0
                    _profileScore.value = (dataDict["profileScore"] as? Number)?.toInt() ?: 0

                    @Suppress("UNCHECKED_CAST")
                    val rawLedgers = dataDict["ledgers"] as? List<Map<String, Any>> ?: emptyList()
                    val parsedLedgers = rawLedgers.map { l ->
                        PAGRewardLedgerEntry(
                            id = l["id"] as? String ?: "",
                            surveyId = l["surveyId"] as? String ?: "",
                            type = l["type"] as? String ?: "MONEY",
                            amount = (l["amount"] as? Number)?.toInt() ?: 0,
                            reason = l["reason"] as? String ?: "Anket Ödülü",
                            createdAt = l["createdAt"] as? String ?: ""
                        )
                    }
                    _rewardLedgers.value = parsedLedgers

                    @Suppress("UNCHECKED_CAST")
                    val rawVouchers = dataDict["vouchers"] as? List<Map<String, Any>> ?: emptyList()
                    val parsedVouchers = rawVouchers.map { v ->
                        PAGVoucher(
                            voucherId = v["voucherId"] as? String ?: "",
                            poolId = v["poolId"] as? String ?: "",
                            title = v["title"] as? String ?: "Hediye Çeki",
                            code = v["code"] as? String ?: "",
                            valueAmount = (v["valueAmount"] as? Number)?.toInt() ?: 0,
                            status = v["status"] as? String ?: "ASSIGNED",
                            assignedAt = v["assignedAt"] as? String ?: "",
                            expiresAt = v["expiresAt"] as? String
                        )
                    }
                    _vouchers.value = parsedVouchers

                    @Suppress("UNCHECKED_CAST")
                    val rawScores = dataDict["scoreLedgers"] as? List<Map<String, Any>> ?: emptyList()
                    val parsedScores = rawScores.map { s ->
                        PAGScoreLedgerEntry(
                            id = s["id"] as? String ?: "",
                            sourceType = s["sourceType"] as? String ?: "BASIC_PROFILE",
                            amount = (s["amount"] as? Number)?.toInt() ?: 0,
                            reason = s["reason"] as? String ?: "Profil Puanı Ödülü",
                            createdAt = s["createdAt"] as? String ?: ""
                        )
                    }
                    _scoreLedgers.value = parsedScores
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            _isLoading.value = false
        }
    }
}

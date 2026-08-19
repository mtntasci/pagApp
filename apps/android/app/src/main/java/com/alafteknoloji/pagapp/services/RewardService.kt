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
            val apiRes = PAGApiClient.get("/wallet")
            if (apiRes != null && apiRes.optBoolean("success")) {
                val dataDict = apiRes.optJSONObject("data")
                if (dataDict != null) {
                    _rewardBalance.value = dataDict.optString("rewardBalance").toDoubleOrNull()?.toInt() ?: 0
                    _profileScore.value = dataDict.optInt("profileScore", 0)

                    val rawLedgers = dataDict.optJSONArray("rewardHistory")
                    val parsedLedgers = mutableListOf<PAGRewardLedgerEntry>()
                    if (rawLedgers != null) {
                        for (i in 0 until rawLedgers.length()) {
                            val l = rawLedgers.getJSONObject(i)
                            parsedLedgers.add(
                                PAGRewardLedgerEntry(
                                    id = l.optString("id"),
                                    surveyId = l.optString("surveyId"),
                                    type = l.optString("rewardType", "MONEY"),
                                    amount = l.optString("amount").toDoubleOrNull()?.toInt() ?: 0,
                                    reason = "Anket Ödülü",
                                    createdAt = l.optString("createdAt")
                                )
                            )
                        }
                    }
                    _rewardLedgers.value = parsedLedgers

                    val rawVouchers = dataDict.optJSONArray("vouchers")
                    val parsedVouchers = mutableListOf<PAGVoucher>()
                    if (rawVouchers != null) {
                        for (i in 0 until rawVouchers.length()) {
                            val v = rawVouchers.getJSONObject(i)
                            parsedVouchers.add(
                                PAGVoucher(
                                    voucherId = v.optString("id"),
                                    poolId = v.optString("surveyId"),
                                    title = v.optString("poolName", "Hediye Çeki"),
                                    code = v.optString("code"),
                                    valueAmount = v.optString("amount").toDoubleOrNull()?.toInt() ?: 0,
                                    status = v.optString("status", "ASSIGNED"),
                                    assignedAt = v.optString("assignedAt"),
                                    expiresAt = null
                                )
                            )
                        }
                    }
                    _vouchers.value = parsedVouchers

                    val rawScores = dataDict.optJSONArray("scoreHistory")
                    val parsedScores = mutableListOf<PAGScoreLedgerEntry>()
                    if (rawScores != null) {
                        for (i in 0 until rawScores.length()) {
                            val s = rawScores.getJSONObject(i)
                            parsedScores.add(
                                PAGScoreLedgerEntry(
                                    id = s.optString("id"),
                                    sourceType = s.optString("sourceType", "SURVEY"),
                                    amount = s.optInt("scoreDelta", 0),
                                    reason = "Profil Puanı",
                                    createdAt = s.optString("createdAt")
                                )
                            )
                        }
                    }
                    _scoreLedgers.value = parsedScores
                }
            } else {
                _rewardBalance.value = 0
                _profileScore.value = 0
                _rewardLedgers.value = emptyList()
                _vouchers.value = emptyList()
                _scoreLedgers.value = emptyList()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _rewardBalance.value = 0
            _profileScore.value = 0
            _rewardLedgers.value = emptyList()
            _vouchers.value = emptyList()
            _scoreLedgers.value = emptyList()
        } finally {
            _isLoading.value = false
        }
    }
}

package com.pagapp.pag.models

data class PAGRewardLedgerEntry(
    val id: String,
    val surveyId: String,
    val type: String,
    val amount: Int,
    val reason: String,
    val createdAt: String
) {
    val formattedAmount: String
        get() = "+$amount TL"
}

data class PAGVoucher(
    val voucherId: String,
    val poolId: String,
    val title: String,
    val code: String,
    val valueAmount: Int,
    val status: String,
    val assignedAt: String,
    val expiresAt: String? = null
) {
    val formattedValue: String
        get() = "$valueAmount TL"
}

data class PAGUserRewardsSummary(
    val rewardBalance: Int,
    val ledgers: List<PAGRewardLedgerEntry>,
    val vouchers: List<PAGVoucher>
)

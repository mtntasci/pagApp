package com.alafteknoloji.pagapp.models

import java.util.Date
import java.util.UUID

enum class RewardType {
    PROFILE_SCORE_ONLY,
    MONEY,
    VOUCHER,
    PROFILE_SCORE_AND_MONEY,
    PROFILE_SCORE_AND_VOUCHER
}

data class RewardResultMock(
    val type: RewardType,
    val profileScore: Int?,
    val moneyAmount: Double?,
    val voucherInfo: String?
) {
    companion object {
        val sampleMoney = RewardResultMock(RewardType.PROFILE_SCORE_AND_MONEY, 50, 20.0, null)
        val sampleVoucher = RewardResultMock(RewardType.PROFILE_SCORE_AND_VOUCHER, 35, null, "Menü Kazandınız")
        val sampleProfileOnly = RewardResultMock(RewardType.PROFILE_SCORE_ONLY, 75, null, null)
    }
}

data class VoucherMock(
    val id: String = UUID.randomUUID().toString(),
    val organization: String,
    val title: String,
    val status: String,
    val assignedDate: Date,
    val code: String
) {
    companion object {
        val sampleList = listOf(
            VoucherMock(id = "v-1", organization = "McDonald's", title = "Ücretsiz Big Mac Menü", status = "Kullanılabilir", assignedDate = Date(), code = "DEMO-PAG-MCD1"),
            VoucherMock(id = "v-2", organization = "Starbucks", title = "1 Adet Tall Boy Kahve", status = "Kullanıldı", assignedDate = Date(System.currentTimeMillis() - 86400 * 3000L), code = "DEMO-PAG-STB2")
        )
    }
}

data class RewardHistoryMock(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val amountText: String,
    val date: Date,
    val isVoucher: Boolean
) {
    companion object {
        val sampleList = listOf(
            RewardHistoryMock(id = "h-1", title = "Ford Araştırması", amountText = "+₺20", date = Date(), isVoucher = false),
            RewardHistoryMock(id = "h-2", title = "PAG Genel Araştırması", amountText = "+₺50", date = Date(System.currentTimeMillis() - 86400 * 1000L), isVoucher = false),
            RewardHistoryMock(id = "h-3", title = "McDonald's", amountText = "Hediye Çeki", date = Date(System.currentTimeMillis() - 86400 * 2000L), isVoucher = true)
        )
    }
}

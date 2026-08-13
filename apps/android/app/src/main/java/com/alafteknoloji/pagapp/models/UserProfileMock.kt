package com.alafteknoloji.pagapp.models

import java.util.UUID

data class UserProfileMock(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val profileScore: Int,
    val rankingAdvantageText: String,
    val rankingPercentileText: String
) {
    companion object {
        val sample = UserProfileMock(
            name = "Metin",
            profileScore = 12480,
            rankingAdvantageText = "Öncelikli Sıra",
            rankingPercentileText = "İlk %8"
        )
    }
}

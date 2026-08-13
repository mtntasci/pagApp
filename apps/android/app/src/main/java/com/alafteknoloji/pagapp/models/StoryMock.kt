package com.alafteknoloji.pagapp.models

import java.util.Date

enum class StoryType {
    SURVEY,
    EARN_PROFILE_SCORE
}

data class StoryMock(
    val id: String,
    val type: StoryType,
    val surveyId: String? = null,
    val image: String,
    val shortLabel: String,
    val position: Int,
    val isActive: Boolean = true,
    val startAt: Date? = null,
    val endAt: Date? = null
) {
    companion object {
        val sampleList = listOf(
            StoryMock(id = "st-1", type = StoryType.SURVEY, surveyId = "srv-2", image = "story_coffee", shortLabel = "Kahve", position = 1),
            StoryMock(id = "st-2", type = StoryType.SURVEY, surveyId = "srv-3", image = "story_auto", shortLabel = "Otomotiv", position = 2),
            StoryMock(id = "st-3", type = StoryType.EARN_PROFILE_SCORE, image = "story_score", shortLabel = "Puan Kazan", position = 3),
            StoryMock(id = "st-4", type = StoryType.SURVEY, surveyId = "srv-1", image = "story_tech", shortLabel = "Teknoloji", position = 4)
        )
    }
}

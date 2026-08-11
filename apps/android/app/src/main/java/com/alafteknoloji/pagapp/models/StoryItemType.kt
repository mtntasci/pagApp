package com.alafteknoloji.pagapp.models

sealed class StoryItemType {
    object Home : StoryItemType()
    data class Survey(val survey: SurveyMock) : StoryItemType()
    object EarnProfileScore : StoryItemType()
}

package com.alafteknoloji.pagapp.models

sealed class StoryItemType {
    object Home : StoryItemType()
    data class Story(val story: StoryMock) : StoryItemType()
}

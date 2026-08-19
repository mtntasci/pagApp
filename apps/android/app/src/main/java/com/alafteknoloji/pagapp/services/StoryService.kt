package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.StoryMock
import com.alafteknoloji.pagapp.models.StoryType
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class StoryService {

    private val _stories = MutableStateFlow<List<StoryMock>>(emptyList())
    val stories: StateFlow<List<StoryMock>> = _stories.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    suspend fun fetchStories() {
        _isLoading.value = true
        try {
            val apiRes = PAGApiClient.get("/home")
            if (apiRes != null && apiRes.optBoolean("success")) {
                val dataObj = apiRes.optJSONObject("data")
                val rawList = dataObj?.optJSONArray("stories")
                val parsed = mutableListOf<StoryMock>()
                if (rawList != null) {
                    for (i in 0 until rawList.length()) {
                        val item = rawList.getJSONObject(i)
                        val sid = item.optString("surveyId", java.util.UUID.randomUUID().toString())
                        val surveyId = item.optString("surveyId")
                        val label = item.optString("label", "Anket")
                        val imageCategory = item.optString("category", "story_tech")

                        parsed.add(
                            StoryMock(
                                id = sid,
                                type = StoryType.SURVEY,
                                surveyId = surveyId,
                                image = imageCategory,
                                imageUrl = null,
                                shortLabel = label,
                                position = i + 1,
                                isActive = true
                            )
                        )
                    }
                }
                _stories.value = parsed
            } else {
                _stories.value = emptyList()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _stories.value = emptyList()
        } finally {
            _isLoading.value = false
        }
    }
}

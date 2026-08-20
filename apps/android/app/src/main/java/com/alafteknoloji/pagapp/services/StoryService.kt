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

                        val rawImgUrl = item.optString("imageUrl")
                        val imgUrl = if (rawImgUrl.isNullOrBlank() || rawImgUrl == "null") null else rawImgUrl
                        val pos = item.optInt("position", item.optInt("sortOrder", i + 1))

                        parsed.add(
                            StoryMock(
                                id = sid,
                                type = StoryType.SURVEY,
                                surveyId = surveyId,
                                image = imageCategory,
                                imageUrl = imgUrl,
                                shortLabel = label,
                                position = pos,
                                isActive = true
                            )
                        )
                    }
                }
                _stories.value = parsed.sortedBy { it.position }
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

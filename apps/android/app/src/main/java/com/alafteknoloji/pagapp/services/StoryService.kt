package com.alafteknoloji.pagapp.services

import com.alafteknoloji.pagapp.models.StoryMock
import com.alafteknoloji.pagapp.models.StoryType
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

class StoryService {
    private val functions: FirebaseFunctions = FirebaseFunctions.getInstance()

    private val _stories = MutableStateFlow<List<StoryMock>>(emptyList())
    val stories: StateFlow<List<StoryMock>> = _stories.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    suspend fun fetchStories() {
        _isLoading.value = true
        try {
            val result = functions.getHttpsCallable("getEligibleStories").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val dataDict = resMap?.get("data") as? Map<String, Any>
                @Suppress("UNCHECKED_CAST")
                val rawList = dataDict?.get("stories") as? List<Map<String, Any>> ?: emptyList()

                val parsed = rawList.mapNotNull { item ->
                    val sid = (item["storyId"] as? String) ?: (item["id"] as? String) ?: return@mapNotNull null
                    val surveyId = item["surveyId"] as? String
                    val label = (item["shortLabel"] as? String) ?: (item["label"] as? String) ?: "Anket"
                    val image = (item["imageCategory"] as? String) ?: (item["imageUrl"] as? String) ?: "story_tech"
                    val pos = (item["position"] as? Number)?.toInt() ?: 1
                    val isActive = item["isActive"] as? Boolean ?: true

                    StoryMock(
                        id = sid,
                        type = StoryType.SURVEY,
                        surveyId = surveyId,
                        image = image,
                        shortLabel = label,
                        position = pos,
                        isActive = isActive
                    )
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

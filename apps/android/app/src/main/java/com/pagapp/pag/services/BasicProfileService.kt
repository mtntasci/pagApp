package com.pagapp.pag.services

import android.content.Context
import com.pagapp.pag.models.PAGBasicProfile
import com.pagapp.pag.models.PAGBirthDetails
import com.pagapp.pag.models.PAGChildInfo
import com.pagapp.pag.models.PAGChildrenInfo
import com.pagapp.pag.models.PAGCity
import com.pagapp.pag.models.PAGDistrict
import com.pagapp.pag.models.PAGLocationPair
import com.pagapp.pag.models.PAGNeighborhood
import com.google.firebase.functions.FirebaseFunctions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

class BasicProfileService(private val context: Context) {

    private val functions = FirebaseFunctions.getInstance()

    private val _basicProfile = MutableStateFlow(PAGBasicProfile())
    val basicProfile: StateFlow<PAGBasicProfile> = _basicProfile.asStateFlow()

    private val _locations = MutableStateFlow<List<PAGCity>>(emptyList())
    val locations: StateFlow<List<PAGCity>> = _locations.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isSaving = MutableStateFlow(false)
    val isSaving: StateFlow<Boolean> = _isSaving.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private val _saveSuccessMessage = MutableStateFlow<String?>(null)
    val saveSuccessMessage: StateFlow<String?> = _saveSuccessMessage.asStateFlow()

    init {
        loadLocationsDataset()
    }

    private fun loadLocationsDataset() {
        val sampleCities = listOf(
            PAGCity(
                id = "34",
                name = "İstanbul",
                districts = listOf(
                    PAGDistrict(
                        id = "3401",
                        name = "Kadıköy",
                        neighborhoods = listOf(
                            PAGNeighborhood("340101", "Caferağa Mah."),
                            PAGNeighborhood("340102", "Moda Mah.")
                        )
                    ),
                    PAGDistrict(
                        id = "3402",
                        name = "Beşiktaş",
                        neighborhoods = listOf(
                            PAGNeighborhood("340201", "Bebek Mah."),
                            PAGNeighborhood("340202", "Etiler Mah.")
                        )
                    )
                )
            ),
            PAGCity(
                id = "06",
                name = "Ankara",
                districts = listOf(
                    PAGDistrict(
                        id = "0601",
                        name = "Çankaya",
                        neighborhoods = listOf(
                            PAGNeighborhood("060101", "Kızılay Mah.")
                        )
                    ),
                    PAGDistrict(
                        id = "0602",
                        name = "Yenimahalle",
                        neighborhoods = listOf(
                            PAGNeighborhood("060201", "Batıkent Mah.")
                        )
                    )
                )
            ),
            PAGCity(
                id = "35",
                name = "İzmir",
                districts = listOf(
                    PAGDistrict(
                        id = "3501",
                        name = "Konak",
                        neighborhoods = listOf(
                            PAGNeighborhood("350101", "Alsancak Mah.")
                        )
                    ),
                    PAGDistrict(
                        id = "3502",
                        name = "Karşıyaka",
                        neighborhoods = listOf(
                            PAGNeighborhood("350201", "Bostanlı Mah.")
                        )
                    )
                )
            )
        )
        _locations.value = sampleCities
    }

    suspend fun fetchBasicProfile() {
        _isLoading.value = true
        _errorMessage.value = null

        try {
            val result = functions.getHttpsCallable("getBasicProfile").call().await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val data = resMap?.get("data") as? Map<String, Any>
                val completion = (data?.get("completionPercentage") as? Number)?.toInt() ?: 0
                val scoreAwarded = data?.get("scoreAwarded") as? Boolean ?: false

                @Suppress("UNCHECKED_CAST")
                val pMap = data?.get("profile") as? Map<String, Any>

                var birthDetails = PAGBirthDetails()
                var marital = ""
                var childrenInfo = PAGChildrenInfo()
                var residenceAddress = PAGLocationPair()
                var hometown = PAGLocationPair()

                if (pMap != null) {
                    marital = pMap["maritalStatus"] as? String ?: ""

                    @Suppress("UNCHECKED_CAST")
                    val bMap = pMap["birthDetails"] as? Map<String, Any>
                    if (bMap != null) {
                        birthDetails = PAGBirthDetails(
                            birthDate = bMap["birthDate"] as? String ?: "",
                            cityId = bMap["cityId"] as? String ?: "",
                            cityName = bMap["cityName"] as? String ?: "",
                            districtId = bMap["districtId"] as? String ?: "",
                            districtName = bMap["districtName"] as? String ?: ""
                        )
                    }

                    @Suppress("UNCHECKED_CAST")
                    val cMap = pMap["childrenInfo"] as? Map<String, Any>
                    if (cMap != null) {
                        val childList = mutableListOf<PAGChildInfo>()
                        @Suppress("UNCHECKED_CAST")
                        val cArr = cMap["children"] as? List<Map<String, Any>>
                        cArr?.forEach { cItem ->
                            childList.add(
                                PAGChildInfo(
                                    gender = cItem["gender"] as? String ?: "MALE",
                                    birthDate = cItem["birthDate"] as? String ?: "2020-01-01"
                                )
                            )
                        }

                        childrenInfo = PAGChildrenInfo(
                            hasChildren = cMap["hasChildren"] as? Boolean ?: false,
                            childrenCount = (cMap["childrenCount"] as? Number)?.toInt() ?: 0,
                            children = childList
                        )
                    }

                    @Suppress("UNCHECKED_CAST")
                    val rMap = pMap["residenceAddress"] as? Map<String, Any>
                    if (rMap != null) {
                        residenceAddress = PAGLocationPair(
                            cityId = rMap["cityId"] as? String ?: "",
                            cityName = rMap["cityName"] as? String ?: "",
                            districtId = rMap["districtId"] as? String ?: "",
                            districtName = rMap["districtName"] as? String ?: "",
                            neighborhoodId = rMap["neighborhoodId"] as? String,
                            neighborhoodName = rMap["neighborhoodName"] as? String
                        )
                    }

                    @Suppress("UNCHECKED_CAST")
                    val hMap = pMap["hometown"] as? Map<String, Any>
                    if (hMap != null) {
                        hometown = PAGLocationPair(
                            cityId = hMap["cityId"] as? String ?: "",
                            cityName = hMap["cityName"] as? String ?: "",
                            districtId = hMap["districtId"] as? String ?: "",
                            districtName = hMap["districtName"] as? String ?: ""
                        )
                    }
                }

                _basicProfile.value = PAGBasicProfile(
                    birthDetails = birthDetails,
                    maritalStatus = marital,
                    childrenInfo = childrenInfo,
                    residenceAddress = residenceAddress,
                    hometown = hometown,
                    completionPercentage = completion,
                    scoreAwarded = scoreAwarded
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _errorMessage.value = "Temel profil yüklenemedi: ${e.localizedMessage}"
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun saveBasicProfile(profile: PAGBasicProfile, userService: UserService? = null): Boolean {
        _isSaving.value = true
        _errorMessage.value = null
        _saveSuccessMessage.value = null

        val childrenList = profile.childrenInfo.children.map {
            mapOf("gender" to it.gender, "birthDate" to it.birthDate)
        }

        val payload = hashMapOf(
            "birthDetails" to hashMapOf(
                "birthDate" to profile.birthDetails.birthDate,
                "cityId" to profile.birthDetails.cityId,
                "cityName" to profile.birthDetails.cityName,
                "districtId" to profile.birthDetails.districtId,
                "districtName" to profile.birthDetails.districtName
            ),
            "maritalStatus" to profile.maritalStatus,
            "childrenInfo" to hashMapOf(
                "hasChildren" to profile.childrenInfo.hasChildren,
                "childrenCount" to profile.childrenInfo.childrenCount,
                "children" to childrenList
            ),
            "residenceAddress" to hashMapOf(
                "cityId" to profile.residenceAddress.cityId,
                "cityName" to profile.residenceAddress.cityName,
                "districtId" to profile.residenceAddress.districtId,
                "districtName" to profile.residenceAddress.districtName,
                "neighborhoodId" to (profile.residenceAddress.neighborhoodId ?: ""),
                "neighborhoodName" to (profile.residenceAddress.neighborhoodName ?: "")
            ),
            "hometown" to hashMapOf(
                "cityId" to profile.hometown.cityId,
                "cityName" to profile.hometown.cityName,
                "districtId" to profile.hometown.districtId,
                "districtName" to profile.hometown.districtName
            )
        )

        try {
            val result = functions.getHttpsCallable("updateBasicProfile").call(payload).await()
            @Suppress("UNCHECKED_CAST")
            val resMap = result.getData() as? Map<String, Any>
            val success = resMap?.get("success") as? Boolean ?: false

            if (success) {
                @Suppress("UNCHECKED_CAST")
                val data = resMap?.get("data") as? Map<String, Any>
                val completion = (data?.get("completionPercentage") as? Number)?.toInt() ?: 0
                val scoreAwarded = data?.get("scoreAwarded") as? Boolean ?: false
                val scoreAmount = (data?.get("scoreAmount") as? Number)?.toInt() ?: 0

                _basicProfile.value = profile.copy(
                    completionPercentage = completion,
                    scoreAwarded = scoreAwarded
                )

                if (scoreAwarded && scoreAmount > 0) {
                    _saveSuccessMessage.value = "Profil kaydedildi! +$scoreAmount Profil Puanı Kazandınız! 🎉"
                    val currentScore = userService?.currentUser?.value?.profileScore ?: 0
                    userService?.updateUserProfileScore(currentScore + scoreAmount)
                } else {
                    _saveSuccessMessage.value = "Profil başarıyla kaydedildi."
                }
                return true
            } else {
                _errorMessage.value = "Profil kaydedilemedi. Lütfen girdiğiniz bilgileri kontrol edin."
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _errorMessage.value = "Profil kaydedilirken bir hata oluştu: ${e.localizedMessage}"
        } finally {
            _isSaving.value = false
        }
        return false
    }
}

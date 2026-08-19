package com.alafteknoloji.pagapp.services

import android.content.Context
import com.alafteknoloji.pagapp.models.PAGBasicProfile
import com.alafteknoloji.pagapp.models.PAGBirthDetails
import com.alafteknoloji.pagapp.models.PAGChildInfo
import com.alafteknoloji.pagapp.models.PAGChildrenInfo
import com.alafteknoloji.pagapp.models.PAGCity
import com.alafteknoloji.pagapp.models.PAGDistrict
import com.alafteknoloji.pagapp.models.PAGLocationPair
import com.alafteknoloji.pagapp.models.PAGNeighborhood
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
        try {
            val jsonString = context.assets.open("turkey-locations.json").bufferedReader().use { it.readText() }
            val root = org.json.JSONObject(jsonString)
            val citiesArray = root.getJSONArray("cities")
            val cityList = mutableListOf<PAGCity>()
            for (i in 0 until citiesArray.length()) {
                val cObj = citiesArray.getJSONObject(i)
                val cId = cObj.getString("id")
                val cName = cObj.getString("name")
                val dArray = cObj.getJSONArray("districts")
                val distList = mutableListOf<PAGDistrict>()
                for (j in 0 until dArray.length()) {
                    val dObj = dArray.getJSONObject(j)
                    val dId = dObj.getString("id")
                    val dName = dObj.getString("name")
                    val nArray = dObj.optJSONArray("neighborhoods")
                    val nhList = mutableListOf<PAGNeighborhood>()
                    if (nArray != null) {
                        for (k in 0 until nArray.length()) {
                            val nObj = nArray.getJSONObject(k)
                            nhList.add(PAGNeighborhood(nObj.getString("id"), nObj.getString("name")))
                        }
                    }
                    if (nhList.isEmpty()) {
                        nhList.add(PAGNeighborhood("${dId}01", "Merkez Mah."))
                    }
                    distList.add(PAGDistrict(dId, dName, nhList))
                }
                cityList.add(PAGCity(cId, cName, distList))
            }
            _locations.value = cityList
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun fetchBasicProfile() {
        _isLoading.value = true
        _errorMessage.value = null

        try {
            // 1. Try High-Speed REST API (~10ms)
            val apiRes = PAGApiClient.get("/profile")
            if (apiRes != null && apiRes.optBoolean("success")) {
                val pData = apiRes.optJSONObject("data")
                if (pData != null) {
                    val rawName = pData.optString("displayName", "")
                    val parts = rawName.split(" ")
                    val fName = parts.firstOrNull() ?: ""
                    val lName = if (parts.size > 1) parts.drop(1).joinToString(" ") else ""

                    _basicProfile.value = PAGBasicProfile(
                        firstName = fName,
                        lastName = lName,
                        gender = pData.optString("gender", "PREFER_NOT_TO_SAY"),
                        maritalStatus = pData.optString("maritalStatus", "PREFER_NOT_TO_SAY"),
                        birthDetails = PAGBirthDetails(
                            birthDate = pData.optString("birthDate", "1998-01-01"),
                            cityName = pData.optString("city", "İstanbul"),
                            districtName = pData.optString("district", "")
                        ),
                        residenceAddress = PAGLocationPair(
                            cityName = pData.optString("city", "İstanbul"),
                            districtName = pData.optString("district", "")
                        ),
                        hometown = PAGLocationPair(
                            cityName = pData.optString("hometown", "")
                        ),
                        completionPercentage = 100,
                        scoreAwarded = true
                    )
                    _isLoading.value = false
                    return
                }
            }

            // 2. Fallback to Firebase Callable
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

                var firstName = ""
                var lastName = ""
                var gender = "PREFER_NOT_TO_SAY"
                var birthDetails = PAGBirthDetails()
                var marital = "PREFER_NOT_TO_SAY"
                var childrenInfo = PAGChildrenInfo()
                var residenceAddress = PAGLocationPair()
                var hometown = PAGLocationPair()

                if (pMap != null) {
                    firstName = pMap["firstName"] as? String ?: ""
                    lastName = pMap["lastName"] as? String ?: ""
                    gender = pMap["gender"] as? String ?: "PREFER_NOT_TO_SAY"
                    marital = pMap["maritalStatus"] as? String ?: "PREFER_NOT_TO_SAY"

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
                    firstName = firstName,
                    lastName = lastName,
                    gender = gender,
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
            "firstName" to profile.firstName.trim(),
            "lastName" to profile.lastName.trim(),
            "gender" to profile.gender,
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
            // 1. Try High-Speed REST API (~10ms)
            val jsonBody = org.json.JSONObject()
            val fullName = "${profile.firstName} ${profile.lastName}".trim()
            jsonBody.put("displayName", fullName)
            jsonBody.put("gender", profile.gender)
            jsonBody.put("maritalStatus", profile.maritalStatus)
            jsonBody.put("birthDate", profile.birthDetails.birthDate)
            val chosenCity = if (profile.residenceAddress.cityName.isNotEmpty()) profile.residenceAddress.cityName else profile.birthDetails.cityName
            val chosenDistrict = if (profile.residenceAddress.districtName.isNotEmpty()) profile.residenceAddress.districtName else profile.birthDetails.districtName
            jsonBody.put("city", chosenCity)
            jsonBody.put("district", chosenDistrict)
            jsonBody.put("hometown", profile.hometown.cityName)

            val apiRes = PAGApiClient.put("/profile", jsonBody)
            if (apiRes != null && apiRes.optBoolean("success")) {
                _basicProfile.value = profile.copy(
                    completionPercentage = 100,
                    scoreAwarded = true
                )
                _saveSuccessMessage.value = "Profil başarıyla kaydedildi."
                _isSaving.value = false
                return true
            }

            // 2. Fallback to Firebase Callable
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

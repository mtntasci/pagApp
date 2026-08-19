package com.alafteknoloji.pagapp.services

import android.content.Context
import com.alafteknoloji.pagapp.models.PAGBasicProfile
import com.alafteknoloji.pagapp.models.PAGBirthDetails
import com.alafteknoloji.pagapp.models.PAGCity
import com.alafteknoloji.pagapp.models.PAGDistrict
import com.alafteknoloji.pagapp.models.PAGLocationPair
import com.alafteknoloji.pagapp.models.PAGNeighborhood
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject

class BasicProfileService(private val context: Context) {

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
            val root = JSONObject(jsonString)
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
                        educationLevel = pData.optString("education", ""),
                        occupation = pData.optString("occupation", ""),
                        completionPercentage = 100,
                        scoreAwarded = true
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _errorMessage.value = e.localizedMessage
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun saveBasicProfile(profile: PAGBasicProfile, userService: UserService? = null): Boolean {
        _isSaving.value = true
        _errorMessage.value = null
        _saveSuccessMessage.value = null

        try {
            val jsonBody = JSONObject()
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
            jsonBody.put("education", profile.educationLevel)
            jsonBody.put("occupation", profile.occupation)

            val apiRes = PAGApiClient.put("/profile", jsonBody)
            if (apiRes != null && apiRes.optBoolean("success")) {
                _basicProfile.value = profile.copy(
                    completionPercentage = 100,
                    scoreAwarded = true
                )
                _saveSuccessMessage.value = "Profil başarıyla kaydedildi."
                userService?.bootstrapCurrentUser()
                _isSaving.value = false
                return true
            } else {
                _errorMessage.value = apiRes?.optString("error") ?: "Profil kaydedilemedi."
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

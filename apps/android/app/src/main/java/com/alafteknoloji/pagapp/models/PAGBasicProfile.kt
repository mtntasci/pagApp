package com.alafteknoloji.pagapp.models

data class PAGChildInfo(
    val id: String = java.util.UUID.randomUUID().toString(),
    val gender: String = "MALE", // "MALE" | "FEMALE"
    val birthDate: String = "2020-01-01" // YYYY-MM-DD
)

data class PAGLocationPair(
    val cityId: String = "",
    val cityName: String = "",
    val districtId: String = "",
    val districtName: String = "",
    val neighborhoodId: String? = null,
    val neighborhoodName: String? = null
)

data class PAGBirthDetails(
    val birthDate: String = "",
    val cityId: String = "",
    val cityName: String = "",
    val districtId: String = "",
    val districtName: String = ""
)

data class PAGChildrenInfo(
    val hasChildren: Boolean = false,
    val childrenCount: Int = 0,
    val children: List<PAGChildInfo> = emptyList()
)

data class PAGBasicProfile(
    val birthDetails: PAGBirthDetails = PAGBirthDetails(),
    val maritalStatus: String = "", // SINGLE, MARRIED, DIVORCED, WIDOWED, OTHER
    val childrenInfo: PAGChildrenInfo = PAGChildrenInfo(),
    val residenceAddress: PAGLocationPair = PAGLocationPair(),
    val hometown: PAGLocationPair = PAGLocationPair(),
    val completionPercentage: Int = 0,
    val scoreAwarded: Boolean = false
)

// Location Data Structures
data class PAGNeighborhood(
    val id: String,
    val name: String
)

data class PAGDistrict(
    val id: String,
    val name: String,
    val neighborhoods: List<PAGNeighborhood>? = null
)

data class PAGCity(
    val id: String,
    val name: String,
    val districts: List<PAGDistrict>
)

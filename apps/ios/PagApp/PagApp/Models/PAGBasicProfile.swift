import Foundation

public struct PAGChildInfo: Codable, Identifiable {
    public var id: String = UUID().uuidString
    public var gender: String // "MALE" | "FEMALE"
    public var birthDate: String // YYYY-MM-DD
    
    public init(id: String = UUID().uuidString, gender: String = "MALE", birthDate: String = "2020-01-01") {
        self.id = id
        self.gender = gender
        self.birthDate = birthDate
    }
}

public struct PAGLocationPair: Codable {
    public var cityId: String
    public var cityName: String
    public var districtId: String
    public var districtName: String
    public var neighborhoodId: String?
    public var neighborhoodName: String?
    
    public init(cityId: String = "", cityName: String = "", districtId: String = "", districtName: String = "", neighborhoodId: String? = nil, neighborhoodName: String? = nil) {
        self.cityId = cityId
        self.cityName = cityName
        self.districtId = districtId
        self.districtName = districtName
        self.neighborhoodId = neighborhoodId
        self.neighborhoodName = neighborhoodName
    }
}

public struct PAGBirthDetails: Codable {
    public var birthDate: String
    public var cityId: String
    public var cityName: String
    public var districtId: String
    public var districtName: String
    
    public init(birthDate: String = "", cityId: String = "", cityName: String = "", districtId: String = "", districtName: String = "") {
        self.birthDate = birthDate
        self.cityId = cityId
        self.cityName = cityName
        self.districtId = districtId
        self.districtName = districtName
    }
}

public struct PAGChildrenInfo: Codable {
    public var hasChildren: Bool
    public var childrenCount: Int
    public var children: [PAGChildInfo]
    
    public init(hasChildren: Bool = false, childrenCount: Int = 0, children: [PAGChildInfo] = []) {
        self.hasChildren = hasChildren
        self.childrenCount = childrenCount
        self.children = children
    }
}

public struct PAGBasicProfile: Codable {
    public var birthDetails: PAGBirthDetails
    public var maritalStatus: String // SINGLE, MARRIED, DIVORCED, WIDOWED, OTHER
    public var childrenInfo: PAGChildrenInfo
    public var residenceAddress: PAGLocationPair
    public var hometown: PAGLocationPair
    public var completionPercentage: Int
    public var scoreAwarded: Bool
    
    public init(
        birthDetails: PAGBirthDetails = PAGBirthDetails(),
        maritalStatus: String = "",
        childrenInfo: PAGChildrenInfo = PAGChildrenInfo(),
        residenceAddress: PAGLocationPair = PAGLocationPair(),
        hometown: PAGLocationPair = PAGLocationPair(),
        completionPercentage: Int = 0,
        scoreAwarded: Bool = false
    ) {
        self.birthDetails = birthDetails
        self.maritalStatus = maritalStatus
        self.childrenInfo = childrenInfo
        self.residenceAddress = residenceAddress
        self.hometown = hometown
        self.completionPercentage = completionPercentage
        self.scoreAwarded = scoreAwarded
    }
}

// Central Location Data Structures
public struct PAGNeighborhood: Codable, Identifiable {
    public let id: String
    public let name: String
}

public struct PAGDistrict: Codable, Identifiable {
    public let id: String
    public let name: String
    public let neighborhoods: [PAGNeighborhood]?
}

public struct PAGCity: Codable, Identifiable {
    public let id: String
    public let name: String
    public let districts: [PAGDistrict]
}

public struct PAGTurkeyLocations: Codable {
    public let cities: [PAGCity]
}

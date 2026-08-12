import { calculateAgeFromBirthDate } from './profile';

export interface BasicProfileTargetingConfig {
  type: 'ALL' | 'PROFILE' | 'LOCATION';
  ageFilter?: {
    minAge?: number;
    maxAge?: number;
  };
  maritalStatuses?: ('SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER')[];
  childrenFilter?: {
    hasChildren?: boolean;
    minChildrenCount?: number;
    maxChildrenCount?: number;
    genders?: ('MALE' | 'FEMALE')[];
    minChildAge?: number;
    maxChildAge?: number;
  };
  residenceAddressFilter?: {
    cities?: string[];
    districts?: string[];
    neighborhoods?: string[];
  };
  hometownFilter?: {
    cities?: string[];
    districts?: string[];
  };
  birthPlaceFilter?: {
    cities?: string[];
    districts?: string[];
  };
}

/**
 * Server-authoritative evaluator for survey targeting against a user's Basic Profile.
 * Filter groups are combined with AND logic.
 * Multi-select lists within a single filter group use OR logic.
 * Missing user profile attributes fail the filter evaluation.
 */
export function evaluateSurveyTargeting(
  targeting: BasicProfileTargetingConfig | undefined | null,
  userBasicProfile: any | null | undefined
): boolean {
  // 1. ALL or empty targeting means accessible to everyone
  if (!targeting || targeting.type === 'ALL') {
    return true;
  }

  // 2. If targeting specifies PROFILE or LOCATION, missing profile fails eligibility
  if (!userBasicProfile) {
    return false;
  }

  // 3. Age Filter (AND group)
  if (targeting.ageFilter) {
    const birthDateStr = userBasicProfile.birthDetails?.birthDate;
    const userAge = calculateAgeFromBirthDate(birthDateStr);
    if (userAge === null) return false;

    if (typeof targeting.ageFilter.minAge === 'number' && userAge < targeting.ageFilter.minAge) {
      return false;
    }
    if (typeof targeting.ageFilter.maxAge === 'number' && userAge > targeting.ageFilter.maxAge) {
      return false;
    }
  }

  // 4. Marital Status Filter (OR within list)
  if (targeting.maritalStatuses && targeting.maritalStatuses.length > 0) {
    const userMarital = userBasicProfile.maritalStatus;
    if (!userMarital || !targeting.maritalStatuses.includes(userMarital)) {
      return false;
    }
  }

  // 5. Children Filter
  if (targeting.childrenFilter) {
    const cInfo = userBasicProfile.childrenInfo;
    if (!cInfo) return false;

    if (typeof targeting.childrenFilter.hasChildren === 'boolean') {
      if (cInfo.hasChildren !== targeting.childrenFilter.hasChildren) {
        return false;
      }
    }

    if (cInfo.hasChildren) {
      const count = cInfo.childrenCount || 0;
      if (typeof targeting.childrenFilter.minChildrenCount === 'number' && count < targeting.childrenFilter.minChildrenCount) {
        return false;
      }
      if (typeof targeting.childrenFilter.maxChildrenCount === 'number' && count > targeting.childrenFilter.maxChildrenCount) {
        return false;
      }

      if (Array.isArray(cInfo.children) && cInfo.children.length > 0) {
        if (targeting.childrenFilter.genders && targeting.childrenFilter.genders.length > 0) {
          const hasMatchingGender = cInfo.children.some((child: any) =>
            targeting.childrenFilter!.genders!.includes(child.gender)
          );
          if (!hasMatchingGender) return false;
        }

        if (typeof targeting.childrenFilter.minChildAge === 'number' || typeof targeting.childrenFilter.maxChildAge === 'number') {
          const hasMatchingChildAge = cInfo.children.some((child: any) => {
            const cAge = calculateAgeFromBirthDate(child.birthDate);
            if (cAge === null) return false;
            if (typeof targeting.childrenFilter!.minChildAge === 'number' && cAge < targeting.childrenFilter!.minChildAge!) return false;
            if (typeof targeting.childrenFilter!.maxChildAge === 'number' && cAge > targeting.childrenFilter!.maxChildAge!) return false;
            return true;
          });
          if (!hasMatchingChildAge) return false;
        }
      }
    }
  }

  // 6. Residence Address Filter (OR within list)
  if (targeting.residenceAddressFilter) {
    const addr = userBasicProfile.residenceAddress;
    if (!addr) return false;

    if (targeting.residenceAddressFilter.cities && targeting.residenceAddressFilter.cities.length > 0) {
      if (!addr.cityId || !targeting.residenceAddressFilter.cities.includes(addr.cityId)) {
        return false;
      }
    }
    if (targeting.residenceAddressFilter.districts && targeting.residenceAddressFilter.districts.length > 0) {
      if (!addr.districtId || !targeting.residenceAddressFilter.districts.includes(addr.districtId)) {
        return false;
      }
    }
    if (targeting.residenceAddressFilter.neighborhoods && targeting.residenceAddressFilter.neighborhoods.length > 0) {
      if (!addr.neighborhoodId || !targeting.residenceAddressFilter.neighborhoods.includes(addr.neighborhoodId)) {
        return false;
      }
    }
  }

  // 7. Hometown Filter
  if (targeting.hometownFilter) {
    const ht = userBasicProfile.hometown;
    if (!ht) return false;

    if (targeting.hometownFilter.cities && targeting.hometownFilter.cities.length > 0) {
      if (!ht.cityId || !targeting.hometownFilter.cities.includes(ht.cityId)) {
        return false;
      }
    }
    if (targeting.hometownFilter.districts && targeting.hometownFilter.districts.length > 0) {
      if (!ht.districtId || !targeting.hometownFilter.districts.includes(ht.districtId)) {
        return false;
      }
    }
  }

  // 8. Birth Place Filter
  if (targeting.birthPlaceFilter) {
    const bp = userBasicProfile.birthDetails;
    if (!bp) return false;

    if (targeting.birthPlaceFilter.cities && targeting.birthPlaceFilter.cities.length > 0) {
      if (!bp.cityId || !targeting.birthPlaceFilter.cities.includes(bp.cityId)) {
        return false;
      }
    }
    if (targeting.birthPlaceFilter.districts && targeting.birthPlaceFilter.districts.length > 0) {
      if (!bp.districtId || !targeting.birthPlaceFilter.districts.includes(bp.districtId)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Clean human-readable targeting summary for Admin Web preview (omits raw IDs).
 */
export function summarizeTargetingHumanReadable(targeting?: BasicProfileTargetingConfig | null): string {
  if (!targeting || targeting.type === 'ALL') {
    return 'Herkese Açık (Tüm Kullanıcılar)';
  }

  const parts: string[] = [];

  if (targeting.ageFilter) {
    const { minAge, maxAge } = targeting.ageFilter;
    if (minAge && maxAge) parts.push(`${minAge}–${maxAge} Yaş`);
    else if (minAge) parts.push(`${minAge}+ Yaş`);
    else if (maxAge) parts.push(`${maxAge} Yaş Altı`);
  }

  if (targeting.maritalStatuses && targeting.maritalStatuses.length > 0) {
    const labels: Record<string, string> = {
      SINGLE: 'Bekar',
      MARRIED: 'Evli',
      DIVORCED: 'Boşanmış',
      WIDOWED: 'Dul',
      OTHER: 'Diğer'
    };
    const str = targeting.maritalStatuses.map(s => labels[s] || s).join(' veya ');
    parts.push(str);
  }

  if (targeting.childrenFilter) {
    if (targeting.childrenFilter.hasChildren === true) {
      parts.push('Çocuk Sahibi');
    } else if (targeting.childrenFilter.hasChildren === false) {
      parts.push('Çocuğu Olmayan');
    }
  }

  if (targeting.residenceAddressFilter?.cities && targeting.residenceAddressFilter.cities.length > 0) {
    parts.push(`İkamet: ${targeting.residenceAddressFilter.cities.join(' veya ')}`);
  }

  if (targeting.hometownFilter?.cities && targeting.hometownFilter.cities.length > 0) {
    parts.push(`Memleket: ${targeting.hometownFilter.cities.join(' veya ')}`);
  }

  if (targeting.birthPlaceFilter?.cities && targeting.birthPlaceFilter.cities.length > 0) {
    parts.push(`Doğum Yeri: ${targeting.birthPlaceFilter.cities.join(' veya ')}`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'Özel Hedef Kitle';
}

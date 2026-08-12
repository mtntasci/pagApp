import {
  evaluateSurveyTargeting,
  summarizeTargetingHumanReadable,
  BasicProfileTargetingConfig
} from './targeting';

describe('Server-Authoritative Survey Targeting Evaluator Unit Tests', () => {

  const sampleUserProfile = {
    birthDetails: {
      birthDate: '1995-06-20',
      cityId: '34',
      cityName: 'İstanbul',
      districtId: '3401',
      districtName: 'Kadıköy'
    },
    maritalStatus: 'MARRIED',
    childrenInfo: {
      hasChildren: true,
      childrenCount: 2,
      children: [
        { gender: 'FEMALE', birthDate: '2019-03-10' },
        { gender: 'MALE', birthDate: '2022-08-01' }
      ]
    },
    residenceAddress: {
      cityId: '34',
      cityName: 'İstanbul',
      districtId: '3401',
      districtName: 'Kadıköy',
      neighborhoodId: '340101',
      neighborhoodName: 'Caferağa Mah.'
    },
    hometown: {
      cityId: '06',
      cityName: 'Ankara',
      districtId: '0601',
      districtName: 'Çankaya'
    }
  };

  test('Type ALL allows any user or null profile', () => {
    expect(evaluateSurveyTargeting({ type: 'ALL' }, null)).toBe(true);
    expect(evaluateSurveyTargeting({ type: 'ALL' }, sampleUserProfile)).toBe(true);
  });

  test('PROFILE targeting with null user profile returns false', () => {
    const config: BasicProfileTargetingConfig = {
      type: 'PROFILE',
      maritalStatuses: ['MARRIED']
    };
    expect(evaluateSurveyTargeting(config, null)).toBe(false);
  });

  test('Age Range targeting (AND logic)', () => {
    const config: BasicProfileTargetingConfig = {
      type: 'PROFILE',
      ageFilter: { minAge: 25, maxAge: 35 }
    };
    expect(evaluateSurveyTargeting(config, sampleUserProfile)).toBe(true);

    const configFail: BasicProfileTargetingConfig = {
      type: 'PROFILE',
      ageFilter: { minAge: 40, maxAge: 50 }
    };
    expect(evaluateSurveyTargeting(configFail, sampleUserProfile)).toBe(false);
  });

  test('Marital Status targeting (Same field OR logic)', () => {
    const configMatch: BasicProfileTargetingConfig = {
      type: 'PROFILE',
      maritalStatuses: ['SINGLE', 'MARRIED']
    };
    expect(evaluateSurveyTargeting(configMatch, sampleUserProfile)).toBe(true);

    const configNoMatch: BasicProfileTargetingConfig = {
      type: 'PROFILE',
      maritalStatuses: ['SINGLE', 'DIVORCED']
    };
    expect(evaluateSurveyTargeting(configNoMatch, sampleUserProfile)).toBe(false);
  });

  test('Children filter targeting', () => {
    const configMatch: BasicProfileTargetingConfig = {
      type: 'PROFILE',
      childrenFilter: {
        hasChildren: true,
        minChildrenCount: 1,
        genders: ['FEMALE']
      }
    };
    expect(evaluateSurveyTargeting(configMatch, sampleUserProfile)).toBe(true);

    const configNoMatch: BasicProfileTargetingConfig = {
      type: 'PROFILE',
      childrenFilter: {
        hasChildren: false
      }
    };
    expect(evaluateSurveyTargeting(configNoMatch, sampleUserProfile)).toBe(false);
  });

  test('Residence Address & Hometown targeting', () => {
    const configMatch: BasicProfileTargetingConfig = {
      type: 'LOCATION',
      residenceAddressFilter: {
        cities: ['34', '06']
      },
      hometownFilter: {
        cities: ['06']
      }
    };
    expect(evaluateSurveyTargeting(configMatch, sampleUserProfile)).toBe(true);
  });

  test('Human readable targeting summary generation', () => {
    const config: BasicProfileTargetingConfig = {
      type: 'PROFILE',
      ageFilter: { minAge: 25, maxAge: 35 },
      maritalStatuses: ['MARRIED'],
      childrenFilter: { hasChildren: true },
      residenceAddressFilter: { cities: ['İstanbul', 'Ankara'] }
    };

    const summary = summarizeTargetingHumanReadable(config);
    expect(summary).toContain('25–35 Yaş');
    expect(summary).toContain('Evli');
    expect(summary).toContain('Çocuk Sahibi');
    expect(summary).toContain('İkamet: İstanbul veya Ankara');
  });
});

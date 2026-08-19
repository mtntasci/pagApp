import {
  calculateBasicProfileCompletion,
  calculateAgeFromBirthDate,
  updateBasicProfileHandler
} from './profile';

describe('Basic User Profile Engine Unit Tests', () => {
  const fakeAuthContext = {
    auth: {
      uid: 'usr_test_profile_01',
      token: { email: 'user@example.com' }
    }
  } as any;

  test('Dynamic age calculation from YYYY-MM-DD', () => {
    const age = calculateAgeFromBirthDate('1990-05-15');
    expect(typeof age).toBe('number');
    expect(age).toBeGreaterThanOrEqual(30);
  });

  test('Completion percentage calculation: Partial profile', () => {
    const partialProfile = {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      maritalStatus: 'SINGLE' as const,
      birthDetails: {
        birthDate: '1995-05-20',
        cityId: '34',
        cityName: 'İstanbul',
        districtId: '3401',
        districtName: 'Kadıköy'
      }
    };

    const res = calculateBasicProfileCompletion(partialProfile);
    expect(res.percentage).toBe(50); // 3 out of 6 categories complete (nameInfo, maritalStatus, birthDetails)
    expect(res.completedCategories).toContain('nameInfo');
    expect(res.completedCategories).toContain('maritalStatus');
    expect(res.completedCategories).toContain('birthDetails');
  });

  test('Completion percentage calculation: 100% Complete profile', () => {
    const fullProfile = {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      birthDetails: {
        birthDate: '1990-01-01',
        cityId: '34',
        cityName: 'İstanbul',
        districtId: '3401',
        districtName: 'Kadıköy'
      },
      maritalStatus: 'MARRIED' as const,
      childrenInfo: {
        hasChildren: true,
        childrenCount: 1,
        children: [{ gender: 'MALE' as const, birthDate: '2018-06-12' }]
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

    const res = calculateBasicProfileCompletion(fullProfile);
    expect(res.percentage).toBe(100);
    expect(res.completedCategories.length).toBe(6);
  });

  test('Invalid birthDate format throws invalid-argument error', async () => {
    await expect(
      updateBasicProfileHandler({
        birthDetails: {
          birthDate: '15/05/1990'
        }
      }, fakeAuthContext)
    ).rejects.toThrow('birthDate must be in YYYY-MM-DD or DD.MM.YYYY format.');
  });

  test('Invalid maritalStatus throws invalid-argument error', async () => {
    await expect(
      updateBasicProfileHandler({
        maritalStatus: 'SUPER_MARRIED' as any
      }, fakeAuthContext)
    ).rejects.toThrow('Invalid maritalStatus value.');
  });

  test('Mismatched childrenCount and children array length throws invalid-argument', async () => {
    await expect(
      updateBasicProfileHandler({
        childrenInfo: {
          hasChildren: true,
          childrenCount: 2,
          children: [{ gender: 'FEMALE', birthDate: '2020-01-01' }]
        }
      }, fakeAuthContext)
    ).rejects.toThrow('children array length must equal childrenCount when hasChildren is true.');
  });
});

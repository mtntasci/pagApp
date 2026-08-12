import {
  calculateBasicProfileCompletion,
  updateBasicProfileHandler
} from './profile';

describe('Basic User Profile Engine Unit Tests', () => {
  const fakeAuthContext = {
    auth: {
      uid: 'usr_test_profile_01',
      token: { email: 'user@example.com' }
    }
  } as any;

  test('Completion percentage calculation: Partial profile', () => {
    const partialProfile = {
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
    expect(res.percentage).toBe(40); // 2 out of 5 categories complete
    expect(res.completedCategories).toContain('maritalStatus');
    expect(res.completedCategories).toContain('birthDetails');
  });

  test('Completion percentage calculation: 100% Complete profile', () => {
    const fullProfile = {
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
    expect(res.completedCategories.length).toBe(5);
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

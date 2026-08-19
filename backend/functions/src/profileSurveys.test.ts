import { isGenderEligible, DEFAULT_PROFILE_CATEGORIES } from './profileSurveys';
import { normalizeDateStringToISO, calculateAgeFromBirthDate } from './profile';

describe('Profile Surveys & Gender Targeting Engine Unit Tests', () => {
  describe('Gender Eligibility Evaluator', () => {
    it('should allow ALL questions for any gender including PREFER_NOT_TO_SAY', () => {
      expect(isGenderEligible('ALL', 'MALE')).toBe(true);
      expect(isGenderEligible('ALL', 'FEMALE')).toBe(true);
      expect(isGenderEligible('ALL', 'PREFER_NOT_TO_SAY')).toBe(true);
      expect(isGenderEligible('ALL', undefined)).toBe(true);
    });

    it('should restrict MALE questions exclusively to MALE users', () => {
      expect(isGenderEligible('MALE', 'MALE')).toBe(true);
      expect(isGenderEligible('MALE', 'FEMALE')).toBe(false);
      expect(isGenderEligible('MALE', 'PREFER_NOT_TO_SAY')).toBe(false);
      expect(isGenderEligible('MALE', undefined)).toBe(false);
    });

    it('should restrict FEMALE questions exclusively to FEMALE users', () => {
      expect(isGenderEligible('FEMALE', 'FEMALE')).toBe(true);
      expect(isGenderEligible('FEMALE', 'MALE')).toBe(false);
      expect(isGenderEligible('FEMALE', 'PREFER_NOT_TO_SAY')).toBe(false);
      expect(isGenderEligible('FEMALE', undefined)).toBe(false);
    });
  });

  describe('Date Normalization & Basic Profile Helper', () => {
    it('should normalize Turkish DD.MM.YYYY dates to standard YYYY-MM-DD', () => {
      expect(normalizeDateStringToISO('15.08.2015')).toBe('2015-08-15');
      expect(normalizeDateStringToISO('01.01.2000')).toBe('2000-01-01');
      expect(normalizeDateStringToISO('1995-05-20')).toBe('1995-05-20');
    });

    it('should correctly calculate age from normalized birth dates', () => {
      expect(calculateAgeFromBirthDate('2000-01-01')).toBeGreaterThanOrEqual(25);
      expect(calculateAgeFromBirthDate('15.08.2015')).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Default Profile Categories', () => {
    it('should contain default seed categories', () => {
      expect(DEFAULT_PROFILE_CATEGORIES.length).toBeGreaterThanOrEqual(13);
      expect(DEFAULT_PROFILE_CATEGORIES.some(c => c.id === 'yasam-tarzi')).toBe(true);
      expect(DEFAULT_PROFILE_CATEGORIES.some(c => c.id === 'teknoloji-kullanimi')).toBe(true);
    });
  });
});

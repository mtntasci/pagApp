import {
  DEFAULT_LEGAL_DOCUMENTS,
  computeContentHash
} from './legal';
import { calculateAgeFromBirthDate } from './profile';

describe('PAG Legal Documents & Consent Architecture Unit Tests', () => {
  describe('Default Legal Documents Registry Baseline', () => {
    it('should contain all required production legal documents', () => {
      const docIds = DEFAULT_LEGAL_DOCUMENTS.map(d => d.documentId);
      expect(docIds).toContain('TERMS');
      expect(docIds).toContain('KVKK_NOTICE');
      expect(docIds).toContain('REWARD_TERMS');
      expect(docIds).toContain('EXPLICIT_CONSENT');
      expect(docIds).toContain('COMMERCIAL_COMMUNICATION');
      expect(docIds).toContain('PRIVACY_POLICY');
      expect(docIds).toContain('AGE_SUITABILITY');
    });

    it('should designate only necessary documents as isRequired', () => {
      const requiredDocs = DEFAULT_LEGAL_DOCUMENTS.filter(d => d.isRequired).map(d => d.documentId);
      expect(requiredDocs).toContain('TERMS');
      expect(requiredDocs).toContain('KVKK_NOTICE');
      expect(requiredDocs).toContain('REWARD_TERMS');

      // EXPLICIT_CONSENT & COMMERCIAL_COMMUNICATION must NOT be mandatory for basic registration
      expect(requiredDocs).not.toContain('EXPLICIT_CONSENT');
      expect(requiredDocs).not.toContain('COMMERCIAL_COMMUNICATION');
      expect(requiredDocs).not.toContain('PRIVACY_POLICY');
      expect(requiredDocs).not.toContain('AGE_SUITABILITY');
    });

    it('should have active flags set to true and valid URLs', () => {
      DEFAULT_LEGAL_DOCUMENTS.forEach(doc => {
        expect(doc.isActive).toBe(true);
        expect(doc.version).toBe('1.0');
        expect(doc.url.startsWith('https://www.pagapp.com.tr/')).toBe(true);
        expect(doc.contentHash).toBeDefined();
        expect(doc.contentHash.length).toBe(64); // SHA-256 hex string length
      });
    });
  });

  describe('Content Hash Generation', () => {
    it('should generate deterministic sha256 hashes', () => {
      const sample = 'PAG Kullanım Koşulları Metni';
      const hash1 = computeContentHash(sample);
      const hash2 = computeContentHash(sample);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });
  });

  describe('18+ Age Validation Logic', () => {
    it('should calculate age correctly from birthDate string', () => {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 20);
      const yyyy = eighteenYearsAgo.getFullYear();
      const mm = String(eighteenYearsAgo.getMonth() + 1).padStart(2, '0');
      const dd = String(eighteenYearsAgo.getDate()).padStart(2, '0');
      const birthStr = `${yyyy}-${mm}-${dd}`;

      const age = calculateAgeFromBirthDate(birthStr);
      expect(age).toBeGreaterThanOrEqual(18);
    });

    it('should identify users under 18 years old', () => {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 10);
      const yyyy = fiveYearsAgo.getFullYear();
      const mm = String(fiveYearsAgo.getMonth() + 1).padStart(2, '0');
      const dd = String(fiveYearsAgo.getDate()).padStart(2, '0');
      const birthStr = `${yyyy}-${mm}-${dd}`;

      const age = calculateAgeFromBirthDate(birthStr);
      expect(age).not.toBeNull();
      expect(age!).toBeLessThan(18);
    });
  });
});

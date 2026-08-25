import { describe, it, expect } from 'vitest';
import { hasContactInfo, displayHeading, formatResumeDate } from '../utils/resumeHelpers';

describe('resumeHelpers', () => {
  describe('hasContactInfo', () => {
    it('returns false for null, undefined, or empty object', () => {
      expect(hasContactInfo(null)).toBe(false);
      expect(hasContactInfo({})).toBe(false);
    });

    it('returns true if any contact field exists', () => {
      expect(hasContactInfo({ email: 'test@example.com' })).toBe(true);
      expect(hasContactInfo({ phone: '+33612345678' })).toBe(true);
      expect(hasContactInfo({ location: 'Paris' })).toBe(true);
      expect(hasContactInfo({ github: 'github.com/test' })).toBe(true);
      expect(hasContactInfo({ website: 'https://mysite.com' })).toBe(true);
    });
  });

  describe('displayHeading', () => {
    it('returns translated key if heading value is missing or empty', () => {
      const headingsEmpty = { experience: '' };
      const headingEn = displayHeading(headingsEmpty, 'experience', 'Experience', 'Experience', 'en');
      expect(headingEn).toBe('Experience');

      const headingFr = displayHeading({}, 'experience', 'Experience', 'Experience', 'fr');
      expect(headingFr).toBe('Expériences');
    });

    it('returns custom user value exactly as entered (e.g. Work Experience or custom title)', () => {
      const headings = { experience: 'Work Experience' };
      const customHeading = displayHeading(headings, 'experience', 'Experience', 'Experience', 'fr');
      expect(customHeading).toBe('Work Experience');

      const headings2 = { experience: 'Parcours & Réalisations Clés' };
      const customHeading2 = displayHeading(headings2, 'experience', 'Experience', 'Experience', 'fr');
      expect(customHeading2).toBe('Parcours & Réalisations Clés');
    });
  });

  describe('formatResumeDate & normalizeMonthValue', () => {
    it('formats month and year in English', () => {
      expect(formatResumeDate('Jan', '2024', 'en')).toBe('Jan 2024');
      expect(formatResumeDate('Dec', '2023', 'en')).toBe('Dec 2023');
    });

    it('translates French month names and abbreviations into English', () => {
      expect(formatResumeDate('Avr', '2022', 'en')).toBe('Apr 2022');
      expect(formatResumeDate('Août', '2025', 'en')).toBe('Aug 2025');
      expect(formatResumeDate('Aout', '2025', 'en')).toBe('Aug 2025');
      expect(formatResumeDate('Mars', '2023', 'en')).toBe('Mar 2023');
      expect(formatResumeDate('Janvier', '2024', 'en')).toBe('Jan 2024');
      expect(formatResumeDate('04', '2022', 'en')).toBe('Apr 2022');
    });

    it('formats and translates month and year in French', () => {
      expect(formatResumeDate('Jan', '2024', 'fr')).toBe('Janv. 2024');
      expect(formatResumeDate('May', '2024', 'fr')).toBe('Mai 2024');
      expect(formatResumeDate('Aug', '2022', 'fr')).toBe('Août 2022');
      expect(formatResumeDate('Dec', '2021', 'fr')).toBe('Déc. 2021');
      expect(formatResumeDate('08', '2025', 'fr')).toBe('Août 2025');
    });

    it('formats and translates month and year in Spanish', () => {
      expect(formatResumeDate('Jan', '2024', 'es')).toBe('Ene. 2024');
      expect(formatResumeDate('Apr', '2023', 'es')).toBe('Abr. 2023');
      expect(formatResumeDate('Avr', '2023', 'es')).toBe('Abr. 2023');
      expect(formatResumeDate('Aug', '2022', 'es')).toBe('Ago. 2022');
      expect(formatResumeDate('Dec', '2021', 'es')).toBe('Dic. 2021');
    });

    it('handles lone year or lone month gracefully', () => {
      expect(formatResumeDate('', '2024', 'fr')).toBe('2024');
      expect(formatResumeDate('Jan', '', 'fr')).toBe('Janv.');
      expect(formatResumeDate('Avr', '', 'en')).toBe('Apr');
      expect(formatResumeDate('', '', 'fr')).toBe('');
    });
  });
});

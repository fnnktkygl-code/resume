import { describe, it, expect } from 'vitest';
import { TRANSLATIONS, getTranslation } from '../utils/translations';

describe('translations', () => {
  it('contains dictionaries for en, fr, and es', () => {
    expect(TRANSLATIONS.en).toBeDefined();
    expect(TRANSLATIONS.fr).toBeDefined();
    expect(TRANSLATIONS.es).toBeDefined();
  });

  it('getTranslation returns translated string in target language', () => {
    expect(getTranslation('en', 'Experience')).toBe('Experience');
    expect(getTranslation('fr', 'Experience')).toBe('Expériences');
    expect(getTranslation('es', 'Experience')).toBe('Experiencia');
  });

  it('falls back to key if translation is missing', () => {
    const unknownKey = 'SOME_UNKNOWN_TRANSLATION_KEY_123';
    expect(getTranslation('en', unknownKey)).toBe(unknownKey);
    expect(getTranslation('fr', unknownKey)).toBe(unknownKey);
    expect(getTranslation('es', unknownKey)).toBe(unknownKey);
  });

  it('translates month abbreviations consistently across languages', () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (const m of months) {
      expect(getTranslation('en', m)).toBeDefined();
      expect(getTranslation('fr', m)).toBeDefined();
      expect(getTranslation('es', m)).toBeDefined();
    }
  });

  it('has essential core UI keys in all 3 languages', () => {
    const essentialKeys = [
      'Personal',
      'Summary',
      'Education',
      'Skills',
      'Projects',
      'Certifications',
      'Cover Letter',
      'Manage My Resumes',
      'Export Backup',
      'Import Backup',
      'Close'
    ];

    for (const key of essentialKeys) {
      expect(TRANSLATIONS.en[key], `Missing EN key: ${key}`).toBeDefined();
      expect(TRANSLATIONS.fr[key], `Missing FR key: ${key}`).toBeDefined();
      expect(TRANSLATIONS.es[key], `Missing ES key: ${key}`).toBeDefined();
    }
  });
});

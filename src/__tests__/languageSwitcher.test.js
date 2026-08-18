import { describe, it, expect } from 'vitest';
import { translateHeadings, translateCustomSectionLabels } from '../utils/languageSwitcher';

describe('languageSwitcher', () => {
  describe('translateHeadings', () => {
    it('translates stock English headings to French', () => {
      const enHeadings = {
        summary: 'Summary',
        experience: 'Work Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Projects',
        certifications: 'Certifications',
        present: 'Present'
      };

      const fr = translateHeadings(enHeadings, 'fr');
      expect(fr.summary).toBe('Profil');
      expect(fr.experience).toBe('Expériences Professionnelles');
      expect(fr.education).toBe('Formation');
      expect(fr.skills).toBe('Compétences');
      expect(fr.projects).toBe('Projets');
      expect(fr.certifications).toBe('Certifications');
      expect(fr.present).toBe('Présent');
    });

    it('translates stock French headings to Spanish', () => {
      const frHeadings = {
        summary: 'Profil',
        experience: 'Expériences Professionnelles',
        education: 'Formation',
        skills: 'Compétences',
        present: 'Présent'
      };

      const es = translateHeadings(frHeadings, 'es');
      expect(es.summary).toBe('Resumen Profesional');
      expect(es.experience).toBe('Experiencia Profesional');
      expect(es.education).toBe('Educación');
      expect(es.skills).toBe('Habilidades');
      expect(es.present).toBe('Presente');
    });

    it('preserves custom user-defined headings during translation', () => {
      const customHeadings = {
        summary: 'Summary',
        experience: 'Executive Leadership Track Record', // Custom!
        education: 'Education'
      };

      const fr = translateHeadings(customHeadings, 'fr');
      expect(fr.summary).toBe('Profil');
      expect(fr.experience).toBe('Executive Leadership Track Record'); // Preserved!
      expect(fr.education).toBe('Formation');
    });
  });

  describe('translateCustomSectionLabels', () => {
    it('translates known stock custom section labels', () => {
      const sections = [
        { id: 'custom_langues', label: 'Languages' },
        { id: 'custom_atouts', label: 'Strengths' },
        { id: 'custom_loisirs', label: 'Hobbies' },
        { id: 'custom_xyz', label: 'My Custom Title' }
      ];

      const fr = translateCustomSectionLabels(sections, 'fr');
      expect(fr.find(s => s.id === 'custom_langues').label).toBe('Langues');
      expect(fr.find(s => s.id === 'custom_atouts').label).toBe('Atouts');
      expect(fr.find(s => s.id === 'custom_loisirs').label).toBe('Loisirs');
      expect(fr.find(s => s.id === 'custom_xyz').label).toBe('My Custom Title');
    });
  });
});

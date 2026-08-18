import { describe, it, expect } from 'vitest';
import { auditResumeData, auditCoverLetterText } from '../utils/scientificAuditor';

describe('scientificAuditor (auditResumeData & auditCoverLetterText)', () => {
  describe('auditResumeData', () => {
    it('returns empty nudges when no resumeData is passed', () => {
      expect(auditResumeData(null)).toEqual([]);
      expect(auditResumeData(undefined)).toEqual([]);
    });

    it('triggers informal email warning for inappropriate emails', () => {
      const data = {
        personal: { email: 'dark_boss69@gmail.com', linkedin: 'linkedin.com/in/test' },
        experience: []
      };
      const nudgesFr = auditResumeData(data, 'fr');
      expect(nudgesFr.some(n => n.id === 'nudge_email')).toBe(true);
      expect(nudgesFr.find(n => n.id === 'nudge_email').message).toContain('van Toorenburg');

      const nudgesEn = auditResumeData(data, 'en');
      expect(nudgesEn.find(n => n.id === 'nudge_email').title).toBe('Informal Email Warning');

      const nudgesEs = auditResumeData(data, 'es');
      expect(nudgesEs.find(n => n.id === 'nudge_email').title).toBe('Advertencia de Email Informal');
    });

    it('does not trigger email warning for professional standard emails', () => {
      const data = {
        personal: { email: 'sophie.martin.pro@gmail.com', linkedin: 'linkedin.com/in/sophiemartin' },
        experience: []
      };
      const nudges = auditResumeData(data, 'fr');
      expect(nudges.some(n => n.id === 'nudge_email')).toBe(false);
    });

    it('suggests LinkedIn digital anchor if missing', () => {
      const data = {
        personal: { email: 'richard.f@example.com', linkedin: '' },
        experience: []
      };
      const nudges = auditResumeData(data, 'fr');
      const linkedinNudge = nudges.find(n => n.id === 'nudge_linkedin');
      expect(linkedinNudge).toBeDefined();
      expect(linkedinNudge.message).toContain('ResumeGo');
    });

    it('flags missing metrics in experience bullet points (NACE Study)', () => {
      const data = {
        personal: { email: 'alex@example.com', linkedin: 'linkedin.com/in/alex' },
        experience: [
          {
            title: 'Developer',
            company: 'Acme',
            bullets: [
              'Wrote web application code',
              'Attended daily standups with the team'
            ]
          }
        ]
      };
      const nudges = auditResumeData(data, 'en');
      const metricsNudge = nudges.find(n => n.id === 'nudge_no_metrics');
      expect(metricsNudge).toBeDefined();
      expect(metricsNudge.message).toContain('NACE Study');
    });

    it('recommends front-loading metrics in bullet points (Ladders Eye-Tracking Study)', () => {
      const data = {
        personal: { email: 'alex@example.com', linkedin: 'linkedin.com/in/alex' },
        experience: [
          {
            title: 'Developer',
            company: 'Acme',
            bullets: [
              'Was completely in charge of building the server leading to +45% throughput boost'
            ]
          }
        ]
      };
      const nudges = auditResumeData(data, 'fr');
      const frontLoadNudge = nudges.find(n => n.id === 'nudge_front_loading');
      expect(frontLoadNudge).toBeDefined();
      expect(frontLoadNudge.message).toContain('Ladders Eye-Tracking');
    });

    it('recommends 2-page resume for senior profiles with 4+ experiences (ResumeGo 482 Recruiters Study)', () => {
      const data = {
        personal: { email: 'alex@example.com', linkedin: 'linkedin.com/in/alex' },
        experience: [
          { title: 'Role 1', company: 'C1', bullets: ['10% growth'] },
          { title: 'Role 2', company: 'C2', bullets: ['20% growth'] },
          { title: 'Role 3', company: 'C3', bullets: ['30% growth'] },
          { title: 'Role 4', company: 'C4', bullets: ['40% growth'] }
        ]
      };
      const nudges = auditResumeData(data, 'fr');
      const lengthNudge = nudges.find(n => n.id === 'nudge_length_2page');
      expect(lengthNudge).toBeDefined();
      expect(lengthNudge.message).toContain('ResumeGo');
    });
  });

  describe('auditCoverLetterText', () => {
    it('returns empty nudges for short or empty cover letters', () => {
      expect(auditCoverLetterText('')).toEqual([]);
      expect(auditCoverLetterText('A concise 20-word letter.')).toEqual([]);
    });

    it('flags cover letters exceeding 300 words (SHRM Study)', () => {
      const longLetter = 'Word '.repeat(350);
      const nudgesFr = auditCoverLetterText(longLetter, 'fr');
      expect(nudgesFr.length).toBe(1);
      expect(nudgesFr[0].id).toBe('nudge_cl_wordcount');
      expect(nudgesFr[0].message).toContain('SHRM');

      const nudgesEn = auditCoverLetterText(longLetter, 'en');
      expect(nudgesEn[0].title).toBe('Cover Letter Over 300 Words');

      const nudgesEs = auditCoverLetterText(longLetter, 'es');
      expect(nudgesEs[0].title).toBe('Carta de Más de 300 Palabras');
    });
  });
});

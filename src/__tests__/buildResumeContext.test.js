import { describe, it, expect } from 'vitest';
import { checkResumeReadiness, buildResumeContext } from '../utils/buildResumeContext';

describe('buildResumeContext', () => {
  describe('checkResumeReadiness', () => {
    it('returns isEmpty true for null or empty resume', () => {
      expect(checkResumeReadiness(null).isEmpty).toBe(true);
      expect(checkResumeReadiness({}).isEmpty).toBe(true);
      expect(checkResumeReadiness({ personal: { name: 'John' } }).isEmpty).toBe(true); // Name alone is not enough without title/exp/summary/skills
    });

    it('returns isEmpty false when minimal title, summary, skills or experience exists', () => {
      expect(checkResumeReadiness({ personal: { tagline: 'DevOps Architect' } }).isEmpty).toBe(false);
      expect(checkResumeReadiness({ summary: 'Experienced engineer.' }).isEmpty).toBe(false);
      expect(checkResumeReadiness({ skills: { technical: 'Python, Docker' } }).isEmpty).toBe(false);
      expect(checkResumeReadiness({ experience: [{ company: 'Google', title: 'SRE' }] }).isEmpty).toBe(false);
      expect(checkResumeReadiness({ targetJobDescription: 'Seeking backend developer' }).isEmpty).toBe(false);
    });
  });

  describe('buildResumeContext', () => {
    it('constructs compact context object stripping out spacers and empty items', () => {
      const data = {
        personal: { name: 'Ada Lovelace', tagline: 'First Programmer', location: 'London' },
        summary: 'Pioneered computing concepts.',
        experience: [
          { company: 'Analytical Engine Corp', title: 'Lead Algorithm Engineer', bullets: ['Wrote Bernoulli number computation', ''] },
          { isSpacer: true }
        ],
        education: [
          { institution: 'Self-Taught / Tutored', degree: 'Mathematics' }
        ],
        skills: {
          technical: 'Mechanical Algorithms, Binary Mathematics',
          soft: 'Visionary Thinking'
        },
        projects: [
          { name: 'Bernoulli Program', techStack: 'Punch cards', description: 'Calculated sequences' }
        ]
      };

      const context = buildResumeContext(data);
      expect(context.name).toBe('Ada Lovelace');
      expect(context.title).toBe('First Programmer');
      expect(context.summary).toBe('Pioneered computing concepts.');
      expect(context.experience.length).toBe(1);
      expect(context.experience[0].company).toBe('Analytical Engine Corp');
      expect(context.experience[0].bullets).toEqual(['Wrote Bernoulli number computation']);
      expect(context.education.length).toBe(1);
      expect(context.currentSkills.technical).toBe('Mechanical Algorithms, Binary Mathematics');
      expect(context.projects.length).toBe(1);
    });
  });
});

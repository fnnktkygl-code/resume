import { describe, it, expect } from 'vitest';
import { sanitizeResumeData } from '../utils/sanitize';

describe('sanitizeResumeData', () => {
  it('throws an error if raw data is null, undefined or not an object', () => {
    expect(() => sanitizeResumeData(null)).toThrow();
    expect(() => sanitizeResumeData('invalid')).toThrow();
  });

  it('strips malicious HTML and scripts from personal info', () => {
    const raw = {
      personal: {
        name: '<script>alert("XSS")</script>John Doe',
        email: '<img src=x onerror=alert(1)>john@example.com',
        phone: '<b>+33612345678</b>',
        website: 'javascript:alert(1)',
        github: 'https://github.com/johndoe',
      },
      experience: [],
      education: [],
    };

    const sanitized = sanitizeResumeData(raw);
    expect(sanitized.personal.name).not.toContain('<script>');
    expect(sanitized.personal.name).toContain('John Doe');
    expect(sanitized.personal.email).not.toContain('<img');
    expect(sanitized.personal.website).toBe(''); // Dangerous javascript: protocol stripped
    expect(sanitized.personal.github).toBe('https://github.com/johndoe');
  });

  it('sanitizes experience entries and bullet points', () => {
    const raw = {
      personal: { name: 'Alice' },
      experience: [
        {
          id: 'exp-1',
          company: '<b>Acme Corp</b>',
          title: '<i>Senior Architect</i>',
          startMonth: '01',
          startYear: '2020',
          current: true,
          bullets: ['<p>Designed scalable platform</p>', 'Reduced latency by 30%']
        }
      ]
    };

    const sanitized = sanitizeResumeData(raw);
    expect(sanitized.experience[0].company).toBe('Acme Corp');
    expect(sanitized.experience[0].title).toBe('Senior Architect');
    expect(sanitized.experience[0].bullets[0]).toBe('Designed scalable platform');
    expect(sanitized.experience[0].current).toBe(true);
  });

  it('handles customSections and sectionOrder safely', () => {
    const raw = {
      personal: { name: 'Bob' },
      customSections: [
        {
          id: 'custom_1',
          label: '<b>Publications</b>',
          items: [
            {
              id: 'item_1',
              title: 'Paper on AI',
              subtitle: 'IEEE 2024',
              date: '2024',
              description: 'Research findings'
            }
          ]
        }
      ],
      sectionOrder: ['experience', 'education', 'custom_1', 'malicious_unknown_id']
    };

    const sanitized = sanitizeResumeData(raw);
    expect(sanitized.customSections[0].label).toBe('Publications');
    expect(sanitized.customSections[0].items[0].title).toBe('Paper on AI');
    expect(sanitized.sectionOrder).toEqual(['experience', 'education', 'custom_1']); // unknown id removed
  });

  it('provides default structures for missing fields', () => {
    const raw = {
      personal: {}
    };

    const sanitized = sanitizeResumeData(raw);
    expect(sanitized.experience).toEqual([]);
    expect(sanitized.education).toEqual([]);
    expect(sanitized.skills).toEqual({ technical: '', soft: '', languages: '', highlightedSkills: [] });
    expect(sanitized.projects).toEqual([]);
    expect(sanitized.certifications).toEqual([]);
    expect(sanitized.customSections).toEqual([]);
  });
});

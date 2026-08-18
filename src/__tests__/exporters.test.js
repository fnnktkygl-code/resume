// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportMarkdown, exportJson, exportDocx, importJson } from '../utils/exporters';

describe('exporters', () => {
  const sampleData = {
    personal: {
      name: 'Sarah Connor',
      tagline: 'Cybersecurity Specialist',
      email: 'sarah@resistance.org',
      phone: '+1 555 0199',
      location: 'Los Angeles, CA',
      linkedin: 'linkedin.com/in/sarahconnor',
      github: 'github.com/sarahconnor',
      website: 'sarahconnor.dev'
    },
    summary: 'Dedicated security analyst specializing in defensive systems.',
    experience: [
      {
        company: 'Cyberdyne Systems',
        title: 'Security Lead',
        startMonth: '01',
        startYear: '2020',
        endMonth: '12',
        endYear: '2023',
        current: false,
        bullets: ['Audited defense neural nets', 'Prevented unauthorized access']
      }
    ],
    education: [
      {
        institution: 'UCLA',
        degree: 'B.S.',
        field: 'Computer Engineering',
        startYear: '2015',
        endYear: '2019'
      }
    ],
    skills: {
      technical: 'Threat Intelligence, Reverse Engineering, Cryptography',
      soft: 'Leadership, Crisis Management',
      languages: 'English (Native), Spanish (Fluent)'
    },
    projects: [
      {
        name: 'Skynet Firewall',
        link: 'github.com/sarahconnor/firewall',
        description: 'Autonomous barrier',
        techStack: 'Rust, eBPF',
        highlights: ['Blocked zero-day exploits']
      }
    ],
    certifications: [
      {
        name: 'CISSP',
        issuer: 'ISC2',
        date: '2021',
        credentialUrl: 'verify.isc2.org'
      }
    ],
    customSections: []
  };

  let appendedElement = null;

  beforeEach(() => {
    appendedElement = null;
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      appendedElement = el;
      return el;
    });
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  describe('exportMarkdown', () => {
    it('generates structured markdown file and triggers download', () => {
      exportMarkdown(sampleData);
      expect(appendedElement).not.toBeNull();
      expect(appendedElement.download).toBe('Sarah_Connor_resume.md');
    });
  });

  describe('exportJson', () => {
    it('serializes data into formatted JSON and triggers download', () => {
      exportJson(sampleData);
      expect(appendedElement).not.toBeNull();
      expect(appendedElement.download).toBe('Sarah_Connor_data.json');
    });
  });

  describe('exportDocx', () => {
    it('generates Word HTML document and triggers download', () => {
      exportDocx(sampleData);
      expect(appendedElement).not.toBeNull();
      expect(appendedElement.download).toBe('Sarah_Connor_resume.doc');
    });
  });

  describe('importJson', () => {
    it('parses and sanitizes valid JSON file', async () => {
      const jsonStr = JSON.stringify(sampleData);
      const file = new File([jsonStr], 'resume.json', { type: 'application/json' });

      const result = await importJson(file);
      expect(result.personal.name).toBe('Sarah Connor');
      expect(result.experience.length).toBe(1);
      expect(result.skills.technical).toContain('Threat Intelligence');
    });

    it('rejects files larger than 5MB', async () => {
      const file = { size: 6 * 1024 * 1024, name: 'huge.json' };
      await expect(importJson(file)).rejects.toThrow('File size exceeds the 5MB limit');
    });

    it('rejects invalid malformed JSON files', async () => {
      const file = new File(['invalid json content {[['], 'bad.json', { type: 'application/json' });
      await expect(importJson(file)).rejects.toThrow('Invalid JSON file');
    });
  });
});

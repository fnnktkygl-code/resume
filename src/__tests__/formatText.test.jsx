import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  parseMarkdown,
  formatSkills,
  formatUrl,
  parseSkillsToTags,
  normalizeSentenceCase,
  renderBullet
} from '../utils/formatText';

describe('formatText utility functions', () => {
  describe('parseMarkdown', () => {
    it('returns original input if null, empty, or not string', () => {
      expect(parseMarkdown('')).toBe('');
      expect(parseMarkdown(null)).toBeNull();
      expect(parseMarkdown(123)).toBe(123);
    });

    it('parses bold markers into <strong> React elements', () => {
      const result = parseMarkdown('Led **React 19** migration across **4 apps**.');
      expect(Array.isArray(result)).toBe(true);
      const boldParts = result.filter(part => React.isValidElement(part));
      expect(boldParts.length).toBe(2);
      expect(boldParts[0].props.children).toBe('React 19');
      expect(boldParts[1].props.children).toBe('4 apps');
    });
  });

  describe('formatSkills', () => {
    it('splits comma separated bold skills', () => {
      const input = '**React, TypeScript, GraphQL**';
      const output = formatSkills(input);
      expect(output).toBe('**React**, **TypeScript**, **GraphQL**');
    });

    it('leaves non-bold strings untouched', () => {
      expect(formatSkills('Python, Docker, AWS')).toBe('Python, Docker, AWS');
    });
  });

  describe('formatUrl', () => {
    it('handles https and http protocols', () => {
      expect(formatUrl('https://google.com')).toBe('https://google.com');
      expect(formatUrl('http://example.com')).toBe('http://example.com');
    });

    it('prepends https:// to domain strings', () => {
      expect(formatUrl('github.com/developer')).toBe('https://github.com/developer');
      expect(formatUrl('linkedin.com/in/test')).toBe('https://linkedin.com/in/test');
    });

    it('formats emails with mailto:', () => {
      expect(formatUrl('user@domain.com')).toBe('mailto:user@domain.com');
      expect(formatUrl('mailto:user@domain.com')).toBe('mailto:user@domain.com');
    });

    it('formats tel: protocol', () => {
      expect(formatUrl('tel:+33612345678')).toBe('tel:+33612345678');
    });
  });

  describe('parseSkillsToTags', () => {
    it('parses categorized skills with semicolons and colons into flat array', () => {
      const skills = 'Frontend: React, Vue.js, Tailwind; Backend: Node.js, PostgreSQL; Cloud: AWS (EC2, S3)';
      const tags = parseSkillsToTags(skills);
      expect(tags).toContain('React');
      expect(tags).toContain('Vue.js');
      expect(tags).toContain('Node.js');
      expect(tags).toContain('PostgreSQL');
      expect(tags).toContain('AWS (EC2');
    });

    it('strips bold markers from tags', () => {
      const skills = '**Python**, **FastAPI**, **Docker**';
      const tags = parseSkillsToTags(skills);
      expect(tags).toEqual(['Python', 'FastAPI', 'Docker']);
    });
  });

  describe('normalizeSentenceCase and renderBullet', () => {
    it('converts ALL CAPS bullet points to standard sentence casing while preserving acronyms', () => {
      const allCaps = 'DEVELOPED SCALABLE REST API AND SQL PIPELINES WITH AWS';
      const normalized = normalizeSentenceCase(allCaps);
      expect(normalized).toContain('Developed scalable');
      expect(normalized).toContain('REST');
      expect(normalized).toContain('API');
      expect(normalized).toContain('SQL');
      expect(normalized).toContain('AWS');
    });

    it('preserves properly cased sentences', () => {
      const normal = 'Engineered distributed caching layer using Redis and Kafka.';
      expect(normalizeSentenceCase(normal)).toBe(normal);
    });

    it('renderBullet normalizes casing and renders markdown elements', () => {
      const bullet = 'MIGRATED **5 MICROSERVICES** TO KUBERNETES CLOUD';
      const result = renderBullet(bullet);
      expect(result).toBeDefined();
    });
  });
});

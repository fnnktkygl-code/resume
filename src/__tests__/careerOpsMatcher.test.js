import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistance,
  resolveLocationCoordinates,
  extractResumeKeywords,
  matchResumeWithJob
} from '../utils/careerOpsMatcher';

describe('CareerOps Matcher & Geodesic Calculations', () => {
  it('calculates geodesic Haversine distance accurately between Paris and Lyon', () => {
    // Paris: 48.8566, 2.3522 — Lyon: 45.7640, 4.8357
    const dist = calculateHaversineDistance(48.8566, 2.3522, 45.7640, 4.8357);
    expect(dist).toBeGreaterThan(380);
    expect(dist).toBeLessThan(410);
  });

  it('returns null if coordinates are missing', () => {
    expect(calculateHaversineDistance(null, 2.35, 45.76, 4.83)).toBeNull();
  });

  it('resolves known city coordinates correctly', () => {
    const paris = resolveLocationCoordinates('Paris, 75001');
    expect(paris).not.toBeNull();
    expect(paris.name).toBe('Paris');
    expect(paris.isRemote).toBe(false);

    const remote = resolveLocationCoordinates('100% Télétravail / Remote');
    expect(remote).not.toBeNull();
    expect(remote.isRemote).toBe(true);
  });

  it('extracts keywords accurately from structured resume data', () => {
    const mockResume = {
      personal: {
        tagline: 'Senior React Developer',
        summary: 'Passionate about TypeScript and web performance.'
      },
      skills: ['React', 'Node.js', 'Docker'],
      experiences: [
        {
          role: 'Lead Frontend',
          company: 'TechCorp',
          bulletPoints: ['Architected micro-frontends with Vite and GraphQL.']
        }
      ]
    };

    const keywords = extractResumeKeywords(mockResume);
    expect(keywords.has('react')).toBe(true);
    expect(keywords.has('typescript')).toBe(true);
    expect(keywords.has('docker')).toBe(true);
    expect(keywords.has('vite')).toBe(true);
    expect(keywords.has('graphql')).toBe(true);
  });

  it('computes ATS match score with matched and missing skills breakdown', () => {
    const mockResume = {
      personal: {
        name: 'Alex Martin',
        tagline: 'Développeur React / TypeScript',
        location: 'Paris'
      },
      skills: ['React', 'TypeScript', 'Node.js'],
      experiences: [
        {
          role: 'Développeur React',
          company: 'Acme',
          bulletPoints: ['Développement d\'applications web réactives.']
        }
      ]
    };

    const mockJob = {
      title: 'Développeur Frontend React / TypeScript',
      company: 'Doctolib',
      location: 'Paris',
      isRemote: false,
      skills: ['React', 'TypeScript', 'Docker', 'Kubernetes'],
      description: 'Développement d\'applications de santé avec React et Kubernetes.'
    };

    const result = matchResumeWithJob(mockResume, mockJob, { location: 'Paris', radiusKm: 50 });

    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.matchedSkills).toContain('React');
    expect(result.matchedSkills).toContain('TypeScript');
    expect(result.missingSkills).toContain('Docker');
    expect(result.missingSkills).toContain('Kubernetes');
    expect(result.locationMatch).toBe(true);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('handles remote jobs without penalizing location', () => {
    const mockResume = {
      personal: { tagline: 'Dev', location: 'Marseille' },
      skills: ['React']
    };
    const mockRemoteJob = {
      title: 'React Dev',
      isRemote: true,
      skills: ['React']
    };

    const result = matchResumeWithJob(mockResume, mockRemoteJob, { location: 'Marseille', radiusKm: 25 });
    expect(result.locationMatch).toBe(true);
    expect(result.locationDistanceKm).toBe(0);
  });
});

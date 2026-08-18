import { describe, it, expect } from 'vitest';
import { computeAtsScore } from '../utils/atsScore';

describe('computeAtsScore', () => {
  const emptyResume = {
    personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '' },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: '', soft: '', tools: '' },
    projects: [],
    certifications: [],
    customSections: [],
  };

  it('computes 0 score and returns top 5 missing priority tips for empty resume', () => {
    const result = computeAtsScore(emptyResume);
    expect(result.score).toBe(0);
    expect(result.tips).toContain('ats_tip_add_name');
    expect(result.tips).toContain('ats_tip_add_email');
    expect(result.tips).toContain('ats_tip_add_phone');
    expect(result.tips).toContain('ats_tip_add_location');
    expect(result.tips).toContain('ats_tip_add_summary');
    expect(result.tips.length).toBeLessThanOrEqual(5);
  });

  it('gives points for complete personal contact information', () => {
    const data = {
      ...emptyResume,
      personal: {
        name: 'Jane Doe',
        title: 'Senior Product Manager',
        email: 'jane.doe@example.com',
        phone: '+1 555 123 4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/janedoe'
      }
    };
    const result = computeAtsScore(data);
    expect(result.score).toBe(35);
  });

  it('scores summary if length is greater than 40 chars', () => {
    const data = {
      ...emptyResume,
      summary: 'Experienced developer with 8+ years building scalable distributed web applications.'
    };
    const result = computeAtsScore(data);
    expect(result.score).toBe(10);
    expect(result.tips).not.toContain('ats_tip_add_summary');
  });

  it('evaluates experience, metrics, and dates with domain detection', () => {
    const techResume = {
      ...emptyResume,
      personal: { name: 'Alex Tech', title: 'Senior Software Engineer', email: 'a@b.com', phone: '123', location: 'Paris', linkedin: '' },
      summary: 'Passionate developer specialized in React, Node.js and Cloud architecture systems.',
      experience: [
        {
          company: 'Acme Corp',
          title: 'Lead Frontend Engineer',
          location: 'Paris',
          startMonth: '01',
          startYear: '2021',
          endMonth: '',
          endYear: '',
          current: true,
          bullets: [
            'Led migration to React 19 increasing performance by 45%',
            'Architected CI/CD pipeline managing 500+ daily deployments'
          ]
        }
      ],
      education: [{ institution: 'MIT', degree: 'B.S. Computer Science' }],
      skills: { technical: 'React, TypeScript, Node.js, GraphQL, Docker' },
      projects: [{ name: 'OpenSource CLI', description: 'Developer productivity tool' }],
      certifications: [{ name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' }]
    };

    const result = computeAtsScore(techResume);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.tips.length).toBeLessThanOrEqual(2);
  });

  it('detects domain-specific tips when metrics are missing (healthcare, education, business, creative)', () => {
    const healthResume = {
      ...emptyResume,
      personal: { name: 'Dr. House', title: 'Medical Doctor', email: 'd@h.com', phone: '123', location: 'NJ', linkedin: 'in/house' },
      summary: 'Diagnostic medicine expert with over 15 years in teaching hospital care.',
      experience: [{
        company: 'Princeton Plainsboro Clinic',
        title: 'Chief of Diagnostic Medicine',
        bullets: ['Supervised patient diagnosis', 'Treated complex cases']
      }]
    };
    const result = computeAtsScore(healthResume);
    expect(result.tips).toContain('ats_tip_metrics_health');

    const eduResume = {
      ...emptyResume,
      personal: { name: 'Prof McGonagall', title: 'Professor and Teacher', email: 'm@h.edu', phone: '123', location: 'UK', linkedin: 'in/mcgonagall' },
      summary: 'Senior educator leading transfiguration classes and student research.',
      experience: [{
        company: 'Hogwarts School',
        title: 'Senior Teacher & Formateur',
        bullets: ['Taught transfiguration classes', 'Prepared curriculum']
      }]
    };
    const resultEdu = computeAtsScore(eduResume);
    expect(resultEdu.tips).toContain('ats_tip_metrics_education');
  });

  it('correctly blends AI match score when target job description and analysis are provided', () => {
    const dataWithTarget = {
      ...emptyResume,
      personal: { name: 'Marie Curie', email: 'm@c.fr', phone: '0102030405', location: 'Paris' },
      targetJobDescription: 'We are seeking a senior research scientist with deep expertise in radioactivity and chemistry physics.',
      targetJobAnalysis: {
        matchScore: 85,
        missingKeywords: ['Spectrometry', 'Radioisotopes']
      }
    };
    const result = computeAtsScore(dataWithTarget);
    expect(result.isMatchScore).toBe(true);
    expect(result.score).toBeDefined();
    expect(result.tips[0]).toEqual({
      type: 'missing_keywords',
      keywords: ['Spectrometry', 'Radioisotopes']
    });
  });
});

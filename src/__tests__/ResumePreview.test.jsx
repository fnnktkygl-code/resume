// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ResumePreview from '../components/ResumePreview';

describe('ResumePreview Component', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleData = {
    personal: {
      name: 'Thomas Anderson',
      tagline: 'Principal Matrix Architect',
      email: 'neo@matrix.io',
      phone: '+1 312 555 0100',
      location: 'Zion',
      linkedin: 'linkedin.com/in/neo',
      github: 'github.com/neo'
    },
    headings: {},
    summary: 'Master of machine code and high-performance virtual construct optimization.',
    experience: [
      {
        id: 'exp-1',
        company: 'MetaCortex',
        title: 'Senior Software Programmer',
        location: 'Capital City',
        startMonth: 'Jan',
        startYear: '1999',
        current: true,
        bullets: ['Maintained enterprise application code', 'Achieved 99.99% system uptime']
      }
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Nebuchadnezzar Academy',
        degree: 'Master of Martial Logic',
        startYear: '1999',
        endYear: '2003'
      }
    ],
    skills: {
      technical: 'C++, Assembly, Neural Networking, Kung Fu',
      soft: 'Telekinesis, Fast Learning',
      languages: 'English (Fluent), Binary (Native)',
      highlightedSkills: ['kung fu']
    },
    projects: [
      {
        id: 'proj-1',
        name: 'The Construct Simulator',
        techStack: 'C++, OpenGL',
        description: 'Virtual simulation reality training platform',
        highlights: ['Trained resistance fighters in martial arts']
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Red Pill Certified Operator',
        issuer: 'Morpheus Foundation',
        date: '1999'
      }
    ],
    customSections: [
      {
        id: 'custom_weapons',
        label: 'Tactical Disciplines',
        items: [
          {
            id: 'tac-1',
            title: 'Bullet Time Evasion',
            subtitle: 'Real-time reflexes',
            date: '1999',
            description: 'Dodged hypersonic projectiles'
          }
        ]
      }
    ],
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'custom_weapons']
  };

  const defaultLayout = {
    fontSize: 10.5,
    paddingX: 0.75,
    paddingY: 0.75,
    lineHeight: 1.45,
    sectionSpacing: 8,
    itemSpacing: 12,
    accentColor: '#1B6B3A',
    fontFamily: 'Inter',
    splitLinks: true
  };

  it('renders Standard template correctly with all sections', () => {
    render(
      <ResumePreview
        data={sampleData}
        layout={defaultLayout}
        language="en"
        template="standard"
      />
    );

    expect(screen.getByText('Thomas Anderson')).toBeInTheDocument();
    expect(screen.getByText('Principal Matrix Architect')).toBeInTheDocument();
    expect(screen.getByText('MetaCortex')).toBeInTheDocument();
    expect(screen.getByText('Nebuchadnezzar Academy')).toBeInTheDocument();
    expect(screen.getByText('The Construct Simulator')).toBeInTheDocument();
    expect(screen.getByText('Red Pill Certified Operator')).toBeInTheDocument();
    expect(screen.getByText('Tactical Disciplines')).toBeInTheDocument();
  });

  it('renders Modern template cleanly', () => {
    render(
      <ResumePreview
        data={sampleData}
        layout={defaultLayout}
        language="en"
        template="modern"
      />
    );
    expect(screen.getByText('Thomas Anderson')).toBeInTheDocument();
    expect(screen.getByText('MetaCortex')).toBeInTheDocument();
  });

  it('renders NJM template cleanly', () => {
    render(
      <ResumePreview
        data={sampleData}
        layout={defaultLayout}
        language="fr"
        template="njm"
      />
    );
    expect(screen.getByText('Thomas Anderson')).toBeInTheDocument();
  });

  it('renders Minimalist template cleanly', () => {
    render(
      <ResumePreview
        data={sampleData}
        layout={defaultLayout}
        language="en"
        template="minimalist"
      />
    );
    expect(screen.getByText('Thomas Anderson')).toBeInTheDocument();
  });

  it('handles skill pill highlight click', () => {
    const onSkillHighlightToggle = vi.fn();
    render(
      <ResumePreview
        data={sampleData}
        layout={defaultLayout}
        language="en"
        template="standard"
        onSkillHighlightToggle={onSkillHighlightToggle}
      />
    );

    const cPlusPlusSkill = screen.getByText('C++');
    fireEvent.click(cPlusPlusSkill);
    expect(onSkillHighlightToggle).toHaveBeenCalled();
  });
});

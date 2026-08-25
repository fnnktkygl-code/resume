// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import ExperienceStep from '../components/steps/ExperienceStep';
import EducationStep from '../components/steps/EducationStep';
import ProjectsStep from '../components/steps/ProjectsStep';
import ResumePreview from '../components/ResumePreview';
import { TranslationContext } from '../utils/TranslationContext';
import { DEFAULT_DATA } from '../utils/constants';

afterEach(() => {
  cleanup();
});

beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.__TEST_SKIP_DOWNLOAD__ = true;
  }
  if (typeof global.ResizeObserver === 'undefined') {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('Cognitive Load & Accordion Ergonomics Test Suite', () => {

  it('ExperienceStep collapsible accordions allow expanding and collapsing cards', () => {
    const data = [
      {
        id: 'exp-1',
        company: 'Google',
        title: 'Senior Software Engineer',
        city: 'Paris',
        startDate: 'Jan 2021',
        endDate: 'Present',
        current: true,
        bullets: ['Led migration to distributed microservices.']
      },
      {
        id: 'exp-2',
        company: 'Meta',
        title: 'Fullstack Engineer',
        city: 'London',
        startDate: 'Feb 2019',
        endDate: 'Dec 2020',
        current: false,
        bullets: ['Built real-time collaboration canvas.']
      }
    ];

    render(
      <TranslationContext.Provider value="fr">
        <ExperienceStep data={data} onChange={vi.fn()} />
      </TranslationContext.Provider>
    );

    // Initial state: cards are expanded, field inputs are visible
    expect(screen.getByDisplayValue('Google')).toBeTruthy();
    expect(screen.getByDisplayValue('Meta')).toBeTruthy();

    // Click collapse on first card
    const expandButtons = screen.getAllByRole('button', { name: /Réduire|Collapse/i });
    expect(expandButtons.length).toBe(2);
    fireEvent.click(expandButtons[0]);

    // Google field should be collapsed
    expect(screen.queryByDisplayValue('Google')).toBeNull();
    // Meta field remains visible
    expect(screen.getByDisplayValue('Meta')).toBeTruthy();

    // Click to re-expand first card
    const reexpandButtons = screen.getAllByRole('button', { name: /Déplier|Expand/i });
    expect(reexpandButtons.length).toBeGreaterThan(0);
    fireEvent.click(reexpandButtons[0]);

    // Google field is visible again
    expect(screen.getByDisplayValue('Google')).toBeTruthy();
  });

  it('EducationStep collapsible accordions function properly', () => {
    const data = [
      {
        id: 'edu-1',
        institution: 'École Polytechnique',
        degree: 'Master of Science',
        field: 'Computer Science',
        startYear: '2016',
        endYear: '2019'
      }
    ];

    const { container } = render(
      <TranslationContext.Provider value="fr">
        <EducationStep data={data} onChange={vi.fn()} />
      </TranslationContext.Provider>
    );

    expect(screen.getByDisplayValue('École Polytechnique')).toBeTruthy();

    // Click collapse
    const collapseBtns = screen.getAllByRole('button', { name: /Réduire|Collapse/i });
    fireEvent.click(collapseBtns[0]);

    expect(screen.queryByDisplayValue('École Polytechnique')).toBeNull();
  });

  it('ProjectsStep collapsible accordions function properly', () => {
    const data = [
      {
        id: 'proj-1',
        name: 'AI Agent Playground',
        link: 'github.com/test/agent',
        techStack: 'TypeScript, React, LLM',
        description: 'Autonomous AI pair programmer.',
        highlights: ['Reduced manual testing time by 80%.']
      }
    ];

    const { container } = render(
      <TranslationContext.Provider value="fr">
        <ProjectsStep data={data} onChange={vi.fn()} />
      </TranslationContext.Provider>
    );

    expect(screen.getByDisplayValue('AI Agent Playground')).toBeTruthy();

    // Click collapse
    const collapseBtns = screen.getAllByRole('button', { name: /Réduire|Collapse/i });
    fireEvent.click(collapseBtns[0]);

    expect(screen.queryByDisplayValue('AI Agent Playground')).toBeNull();
  });

  it('ResumePreview in isZenMode=true hides all interactive drag handles & spacer buttons', () => {
    const data = structuredClone(DEFAULT_DATA);
    data.experience = [
      {
        id: 'exp-1',
        company: 'Stripe',
        title: 'Backend Engineer',
        startDate: '2020',
        endDate: '2023',
        bullets: ['Implemented idempotency keys.']
      },
      {
        id: 'exp-2',
        company: 'Vercel',
        title: 'Cloud Architect',
        startDate: '2023',
        endDate: 'Present',
        bullets: ['Optimized edge runtime latency.']
      }
    ];

    const { rerender } = render(
      <TranslationContext.Provider value="fr">
        <ResumePreview
          data={data}
          layout={{ fontSize: 10, lineHeight: 1.3 }}
          template="standard"
          isZenMode={true}
          onItemReorder={vi.fn()}
          onSectionReorder={vi.fn()}
        />
      </TranslationContext.Provider>
    );

    // In isZenMode=true, drag handles and spacer buttons must NOT be rendered
    expect(document.querySelector('.item-drag-handle')).toBeNull();
    expect(document.querySelector('.drag-handle')).toBeNull();
    expect(document.querySelector('.insert-spacer-btn')).toBeNull();

    // Rerender with isZenMode=false (Adjustments mode)
    rerender(
      <TranslationContext.Provider value="fr">
        <ResumePreview
          data={data}
          layout={{ fontSize: 10, lineHeight: 1.3 }}
          template="standard"
          isZenMode={false}
          onItemReorder={vi.fn()}
          onSectionReorder={vi.fn()}
        />
      </TranslationContext.Provider>
    );

    // In isZenMode=false, handles and spacer buttons exist for interactive editing
    expect(document.querySelector('.item-drag-handle')).toBeTruthy();
    expect(document.querySelector('.drag-handle')).toBeTruthy();
  });

});

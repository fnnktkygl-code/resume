// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CareerOpsHub from '../components/career/CareerOpsHub';
import { TranslationContext } from '../utils/TranslationContext';
import { getTranslation } from '../utils/translations';

const mockResumeData = {
  personal: {
    name: 'Jean Dupont',
    tagline: 'Développeur Fullstack React',
    location: 'Paris'
  },
  skills: ['React', 'Node.js', 'JavaScript'],
  experiences: [
    {
      role: 'Développeur Web',
      company: 'StartupLab',
      bulletPoints: ['Création d\'APIs et de composants UI.']
    }
  ]
};

const renderWithContext = (ui, lang = 'fr') => {
  return render(
    <TranslationContext.Provider value={lang}>
      {ui}
    </TranslationContext.Provider>
  );
};

describe('CareerOpsHub Component', () => {
  it('renders correctly when open', async () => {
    renderWithContext(
      <CareerOpsHub
        isOpen={true}
        onClose={() => {}}
        resumeData={mockResumeData}
        onApplyTailoredResume={() => {}}
        language="fr"
      />
    );

    expect(screen.getByText(/Big CareerOps/i)).toBeInTheDocument();
    expect(screen.getByText(/Offres & Matching IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Suivi de Candidatures/i)).toBeInTheDocument();
  });

  it('switches between search tab and application tracker tab', async () => {
    renderWithContext(
      <CareerOpsHub
        isOpen={true}
        onClose={() => {}}
        resumeData={mockResumeData}
        onApplyTailoredResume={() => {}}
        language="fr"
      />
    );

    const trackerTabBtn = screen.getByText(/Suivi de Candidatures/i);
    fireEvent.click(trackerTabBtn);

    expect(screen.getByText(/Pipeline Kanban/i)).toBeInTheDocument();
  });
});

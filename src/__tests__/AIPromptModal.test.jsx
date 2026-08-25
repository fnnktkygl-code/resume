// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AIPromptModal from '../components/AIPromptModal';
import { TranslationContext } from '../utils/TranslationContext';
import * as geminiService from '../services/geminiService';

vi.mock('../services/geminiService', () => ({
  translateWithProxy: vi.fn(),
  translateTextWithProxy: vi.fn(),
  translateSectionWithProxy: vi.fn()
}));

const mockResumeData = {
  personal: {
    name: 'Jean Dupont',
    tagline: 'Développeur Fullstack',
    location: 'Paris, France',
    email: 'jean@example.com'
  },
  summary: 'Développeur passionné avec **5 ans d\'expérience**.',
  skills: {
    technical: 'React, Node.js',
    soft: 'Rigueur, Esprit d\'équipe',
    languages: 'Français (Natif), Anglais (Courant)'
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      title: 'Ingénieur Logiciel',
      location: 'Paris, France',
      date: '2020 - Présent',
      bullets: ['Conception de microservices **haute disponibilité**.']
    }
  ],
  education: [],
  projects: [],
  certifications: [],
  customSections: [],
  headings: {
    summary: 'Profil',
    experience: 'Expériences',
    skills: 'Compétences'
  }
};

const mockTranslatedResume = {
  personal: {
    name: 'Jean Dupont',
    tagline: 'Fullstack Developer',
    location: 'Paris, France',
    email: 'jean@example.com'
  },
  summary: 'Passionate developer with **5 years of experience**.',
  skills: {
    technical: 'React, Node.js',
    soft: 'Rigor, Team spirit',
    languages: 'French (Native), English (Fluent)'
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      title: 'Software Engineer',
      location: 'Paris, France',
      date: '2020 - Present',
      bullets: ['Design of **high availability** microservices.']
    }
  ],
  education: [],
  projects: [],
  certifications: [],
  customSections: [],
  headings: {
    summary: 'Profile',
    experience: 'Experience',
    skills: 'Skills'
  }
};

const renderModal = (props = {}) => {
  return render(
    <TranslationContext.Provider value="fr">
      <AIPromptModal
        isOpen={true}
        onClose={vi.fn()}
        data={mockResumeData}
        language="fr"
        onTranslationSuccess={vi.fn()}
        {...props}
      />
    </TranslationContext.Provider>
  );
};

describe('AIPromptModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders initial language selection state and triggers translation', async () => {
    geminiService.translateWithProxy.mockResolvedValueOnce({
      translatedResume: mockTranslatedResume
    });

    const onClose = vi.fn();
    const onTranslationSuccess = vi.fn();

    renderModal({ onClose, onTranslationSuccess });

    expect(screen.getByText(/Assistant de traduction IA/i)).toBeTruthy();
    
    // Click Translate
    const translateBtn = screen.getByRole('button', { name: /^Traduire$/i });
    fireEvent.click(translateBtn);

    await waitFor(() => {
      expect(geminiService.translateWithProxy).toHaveBeenCalledWith(mockResumeData, 'en');
    });

    // Translation result should show changes and diff items
    await waitFor(() => {
      expect(screen.getByText(/Traduction terminée/i)).toBeTruthy();
      expect(screen.getByText(/Fullstack Developer/i)).toBeTruthy();
      expect(screen.getByText(/Software Engineer/i)).toBeTruthy();
    });

    // Click Apply Selected Changes
    const applyBtn = screen.getByRole('button', { name: /Appliquer les modifications sélectionnées/i });
    fireEvent.click(applyBtn);

    expect(onTranslationSuccess).toHaveBeenCalledTimes(1);
    const appliedData = onTranslationSuccess.mock.calls[0][0];
    expect(appliedData.personal.tagline).toBe('Fullstack Developer');
    expect(appliedData.experience[0].title).toBe('Software Engineer');
    expect(onClose).toHaveBeenCalled();
  });

  it('handles unwrapped proxy response directly', async () => {
    geminiService.translateWithProxy.mockResolvedValueOnce(mockTranslatedResume);

    const onTranslationSuccess = vi.fn();
    renderModal({ onTranslationSuccess });

    const translateBtn = screen.getByRole('button', { name: /^Traduire$/i });
    fireEvent.click(translateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Traduction terminée/i)).toBeTruthy();
      expect(screen.getByText(/Fullstack Developer/i)).toBeTruthy();
    });

    const applyBtn = screen.getByRole('button', { name: /Appliquer les modifications sélectionnées/i });
    fireEvent.click(applyBtn);

    expect(onTranslationSuccess).toHaveBeenCalledTimes(1);
    expect(onTranslationSuccess.mock.calls[0][0].personal.tagline).toBe('Fullstack Developer');
  });

});

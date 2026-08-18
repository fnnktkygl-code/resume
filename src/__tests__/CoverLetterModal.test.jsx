// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CoverLetterModal from '../components/ui/CoverLetterModal';
import { TranslationContext } from '../utils/TranslationContext';

describe('CoverLetterModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleData = {
    personal: { name: 'Lucas Dubois', tagline: 'Consultant Senior', email: 'lucas@example.com' },
    experience: [{ company: 'Capgemini', title: 'Consultant', bullets: ['Led digital transformation'] }],
    coverLetter: 'Madame, Monsieur,\n\nJe vous adresse ma candidature pour le poste...',
    targetJobDescription: 'Entreprise : Airbus\nPoste : Chef de projet transformation agile'
  };

  const renderModal = (props = {}) => {
    return render(
      <TranslationContext.Provider value="fr">
        <CoverLetterModal
          isOpen={true}
          onClose={vi.fn()}
          data={sampleData}
          dispatch={vi.fn()}
          {...props}
        />
      </TranslationContext.Provider>
    );
  };

  it('renders modal header, mobile tabs, and company/role inputs', () => {
    renderModal();
    expect(screen.getByText(/Espace Lettre de Motivation|Cover Letter Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Paramètres & Offre/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Aperçu & Édition A4/i)).toBeInTheDocument();
  });

  it('switches between mobile tabs when tab buttons are clicked', () => {
    renderModal();
    const settingsTab = screen.getByText(/1. Paramètres & Offre/i);
    const previewTab = screen.getByText(/2. Aperçu & Édition A4/i);

    fireEvent.click(settingsTab);
    expect(settingsTab).toHaveClass('active');

    fireEvent.click(previewTab);
    expect(previewTab).toHaveClass('active');
  });

  it('extracts company and role on auto-fill button click', () => {
    renderModal();
    const autoFillBtn = screen.getByText(/Auto-remplir depuis l'offre|Auto-fill from offer/i);
    fireEvent.click(autoFillBtn);
    expect(screen.getByDisplayValue('Airbus')).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    const closeBtn = screen.getByText(/Fermer l'espace|Close Workspace/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});

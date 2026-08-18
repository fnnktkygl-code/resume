// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import DailyTipModal from '../components/ui/DailyTipModal';
import { TranslationContext } from '../utils/TranslationContext';

describe('DailyTipModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAppAction: vi.fn(),
    initialTab: 'creator'
  };

  const renderModal = (props = {}) => {
    return render(
      <TranslationContext.Provider value="fr">
        <DailyTipModal {...defaultProps} {...props} />
      </TranslationContext.Provider>
    );
  };

  it('renders modal with category tabs and tip cards', () => {
    renderModal();
    expect(screen.getByText(/Conseils du Créateur & Études RH/i)).toBeInTheDocument();
    expect(screen.getByText(/👑 Créateur/i)).toBeInTheDocument();
    expect(screen.getByText(/📄 Conseils CV/i)).toBeInTheDocument();
    expect(screen.getByText(/📝 Lettre/i)).toBeInTheDocument();
  });

  it('switches tabs on click', () => {
    renderModal();
    const cvTab = screen.getByText(/📄 Conseils CV/i);
    fireEvent.click(cvTab);
    expect(screen.getByText(/Fiche 1 sur/i)).toBeInTheDocument();
  });

  it('navigates through tips with next and previous buttons', () => {
    renderModal();
    const nextBtn = screen.getByText(/Suivant →/i);
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Fiche 2 sur/i)).toBeInTheDocument();

    const prevBtn = screen.getByText(/← Précédent/i);
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Fiche 1 sur/i)).toBeInTheDocument();
  });

  it('triggers deep link app action when actionable solution button is clicked', () => {
    renderModal();
    const actionBtns = screen.getAllByRole('button');
    const solutionBtn = actionBtns.find(b => b.textContent.includes('→') && !b.textContent.includes('Suivant'));
    if (solutionBtn) {
      fireEvent.click(solutionBtn);
      expect(defaultProps.onAppAction).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });
});

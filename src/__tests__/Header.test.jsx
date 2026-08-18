// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Header from '../components/Header';
import { getTranslation } from '../utils/translations';

describe('Header Component', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    t: (k) => getTranslation('en', k),
    theme: 'light',
    toggleTheme: vi.fn(),
    language: 'en',
    handleLanguageChange: vi.fn(),
    hasContent: true,
    setIsCoverLetterModalOpen: vi.fn(),
    setShowImportModal: vi.fn(),
    setIsCvManagerOpen: vi.fn(),
    loadDemoData: vi.fn(),
    setShowClearConfirm: vi.fn(),
    setIsDailyTipOpen: vi.fn()
  };

  it('renders logo and ATS Ready badge', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByTitle('Back to home')).toBeInTheDocument();
    expect(screen.getByText('ATS Ready')).toBeInTheDocument();
  });

  it('handles theme toggling on click', () => {
    render(<Header {...defaultProps} />);
    const themeBtn = screen.getByLabelText('Toggle theme');
    fireEvent.click(themeBtn);
    expect(defaultProps.toggleTheme).toHaveBeenCalled();
  });

  it('opens and closes mobile menu on toggle', () => {
    render(<Header {...defaultProps} />);
    const menuBtn = screen.getByLabelText('More options');
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');

    // Click demo item
    const demoBtn = screen.getByText('1-Page Demo');
    fireEvent.click(demoBtn);
    expect(defaultProps.loadDemoData).toHaveBeenCalledWith(1);
  });

  it('opens language dropdown and switches language', () => {
    render(<Header {...defaultProps} />);
    const langBtn = screen.getByLabelText('Change language');
    fireEvent.click(langBtn);

    const frOption = screen.getByText('Français');
    fireEvent.click(frOption);
    expect(defaultProps.handleLanguageChange).toHaveBeenCalledWith('fr');
  });

  it('closes dropdown when Escape key is pressed', () => {
    render(<Header {...defaultProps} />);
    const langBtn = screen.getByLabelText('Change language');
    fireEvent.click(langBtn);
    expect(screen.getByText('Français')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
  });
});

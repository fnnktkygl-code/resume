// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import ImportModal from '../components/ui/ImportModal';
import LayoutControls from '../components/LayoutControls';
import { TranslationContext } from '../utils/TranslationContext';
import * as geminiService from '../services/geminiService';

afterEach(() => {
  cleanup();
});

beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.__TEST_SKIP_DOWNLOAD__ = true;
  }
});

describe('Direct-to-Canvas Import & Fit to 1 Page Test Suite', () => {

  it('ImportModal parses text and immediately triggers onImportSuccess without intermediate blind modals', async () => {
    const mockParsedResume = {
      personal: { name: 'Alice Dupont', email: 'alice@example.com' },
      experience: [
        { id: 'exp-1', company: 'Acme Corp', title: 'Lead Developer', bullets: ['Architected cloud infra.'] }
      ],
      education: [
        { id: 'edu-1', institution: 'Sorbonne University', degree: 'Master', startYear: '2018', endYear: '2020' }
      ],
      skills: { technical: 'React, Node.js, Cloud' }
    };

    vi.spyOn(geminiService, 'importResumeWithProxy').mockResolvedValueOnce(mockParsedResume);

    const onImportSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <TranslationContext.Provider value="fr">
        <ImportModal isOpen={true} onClose={onClose} onImportSuccess={onImportSuccess} />
      </TranslationContext.Provider>
    );

    // Switch to text mode
    const textModeBtn = screen.getByRole('button', { name: /Coller du texte brut|Paste Raw Text/i });
    fireEvent.click(textModeBtn);

    // Enter raw resume text
    const textarea = screen.getByPlaceholderText(/Collez|Paste/i);
    fireEvent.change(textarea, { target: { value: 'Alice Dupont - Lead Developer at Acme Corp. React, Node.js.' } });

    // Submit import
    const submitBtn = screen.getByRole('button', { name: /Importer|Import/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(geminiService.importResumeWithProxy).toHaveBeenCalledTimes(1);
      expect(onImportSuccess).toHaveBeenCalledTimes(1);
      expect(onImportSuccess).toHaveBeenCalledWith(
        mockParsedResume,
        mockParsedResume,
        expect.objectContaining({ type: 'text' })
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('LayoutControls "Fit to 1 Page" button applies calibrated 1-page compact layout preset', () => {
    const initialLayout = {
      isCompact: false,
      fontSize: 11,
      paddingX: 0.75,
      paddingY: 0.75,
      lineHeight: 1.45,
      sectionSpacing: 10,
      itemSpacing: 12,
      accentColor: '#1B6B3A',
      fontFamily: 'Inter'
    };

    const onChange = vi.fn();

    render(
      <TranslationContext.Provider value="fr">
        <LayoutControls layout={initialLayout} onChange={onChange} />
      </TranslationContext.Provider>
    );

    // Click "Fit to 1 Page"
    const fitBtn = screen.getByRole('button', { name: /Ajuster sur 1 page|Fit to 1 Page/i });
    fireEvent.click(fitBtn);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isCompact: true,
        fontSize: 9.75,
        lineHeight: 1.3,
        paddingX: 0.5,
        paddingY: 0.5,
        sectionSpacing: 5,
        itemSpacing: 6
      })
    );

    // Click "Reset Layout"
    const resetBtn = screen.getByRole('button', { name: /Réinitialiser|Reset Layout/i });
    fireEvent.click(resetBtn);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isCompact: false,
        fontSize: 10.5,
        paddingX: 0.75,
        paddingY: 0.75,
        lineHeight: 1.45,
        sectionSpacing: 8,
        itemSpacing: 12
      })
    );
  });

});

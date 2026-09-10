// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ImportModal from '../components/ui/ImportModal';
import { TranslationContext } from '../utils/TranslationContext';
import * as geminiService from '../services/geminiService';

afterEach(() => {
  cleanup();
});

describe('ImportModal Component', () => {
  it('parses raw text and immediately triggers onImportSuccess without intermediate blind modals', async () => {
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

    // Switch to raw text mode
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
});

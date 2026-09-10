// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SectionHeader from '../components/ui/SectionHeader';
import { WysiwygEditor } from '../components/ui/FormFields';
import { TranslationContext } from '../utils/TranslationContext';

afterEach(() => {
  cleanup();
});

describe('FormFields Component Suite (WysiwygEditor & SectionHeader)', () => {
  it('WysiwygEditor renders clean editable content and handles keyboard shortcut commands', () => {
    const onChange = vi.fn();
    const onAIRewrite = vi.fn();
    const onAIBold = vi.fn();
    const onAITranslate = vi.fn();

    const { container } = render(
      <TranslationContext.Provider value="fr">
        <WysiwygEditor
          value="Optimized system latency by 45%."
          onChange={onChange}
          placeholder="Enter bullet point..."
          onAIRewrite={onAIRewrite}
          onAIBold={onAIBold}
          onAITranslate={onAITranslate}
        />
      </TranslationContext.Provider>
    );

    const editor = container.querySelector('.wysiwyg-editor');
    expect(editor).toBeTruthy();
    expect(editor.textContent).toContain('Optimized system latency by 45%.');

    // Trigger keyboard shortcut
    fireEvent.keyDown(editor, { key: 'b', metaKey: true });
    expect(editor).toBeTruthy();
  });

  it('SectionHeader renders title input, translation button and style dropdown controls', () => {
    const onTranslate = vi.fn();
    const onTitleChange = vi.fn();

    const { container } = render(
      <TranslationContext.Provider value="fr">
        <SectionHeader
          title="Expérience Professionnelle"
          onTitleChange={onTitleChange}
          onTranslate={onTranslate}
          isTranslating={false}
          styleControls={{
            label: "Style d'affichage",
            dropdowns: [
              {
                value: "pill",
                onChange: vi.fn(),
                options: [{ value: "pill", label: "Pilules" }, { value: "text", label: "Texte" }]
              }
            ]
          }}
        />
      </TranslationContext.Provider>
    );

    // Open options
    const optionsBtn = container.querySelector('button.control-btn') || screen.getByRole('button', { name: /⚙️/i });
    fireEvent.click(optionsBtn);

    const translateBtn = screen.getByRole('button', { name: /Traduire cette section/i });
    expect(translateBtn).toBeInTheDocument();
    fireEvent.click(translateBtn);
    expect(onTranslate).toHaveBeenCalledTimes(1);
  });
});

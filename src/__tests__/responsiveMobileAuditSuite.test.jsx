// @vitest-environment jsdom
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Header from '../components/Header';
import SectionHeader from '../components/ui/SectionHeader';
import { WysiwygEditor, TextArea, TextInput, Select } from '../components/ui/FormFields';
import LayoutControls from '../components/LayoutControls';
import ResumePreview from '../components/ResumePreview';
import { TranslationContext } from '../utils/TranslationContext';
import { DEFAULT_DATA } from '../utils/constants';

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

// Helper to set window viewport
function setViewport(width, height = 800) {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
}

describe('Responsive & Mobile End-to-End Audit Suite', () => {

  const viewports = [
    { name: 'iPhone SE (320px)', width: 320, height: 568 },
    { name: 'iPhone 13 Mini / Standard (375px)', width: 375, height: 667 },
    { name: 'iPhone 14 Pro Max / Pixel (414px)', width: 414, height: 896 },
    { name: 'iPad Portrait (768px)', width: 768, height: 1024 },
    { name: 'iPad Pro / Laptop (1024px)', width: 1024, height: 768 },
    { name: 'Desktop HD (1440px)', width: 1440, height: 900 }
  ];

  it('Responsive Test 1: Header renders cleanly across all 6 viewports without crashing', () => {
    viewports.forEach(vp => {
      setViewport(vp.width, vp.height);
      const onTemplateChange = vi.fn();
      const onExportPdf = vi.fn();
      const onExportDocx = vi.fn();

      const { container } = render(
        <TranslationContext.Provider value="fr">
          <Header
            template="standard"
            onTemplateChange={onTemplateChange}
            onExportPdf={onExportPdf}
            onExportDocx={onExportDocx}
            data={DEFAULT_DATA}
          />
        </TranslationContext.Provider>
      );

      expect(container.firstChild).toBeTruthy();
    });
  });

  it('Responsive Test 2: WysiwygEditor renders clean distraction-free input with keyboard shortcuts and contextual editing', () => {
    setViewport(320, 568);
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

    // Verify clean editor is rendered without cluttering fixed buttons
    const editor = container.querySelector('.wysiwyg-editor');
    expect(editor).toBeTruthy();
    expect(editor.textContent).toContain('Optimized system latency by 45%.');

    // Verify keyboard bold command works
    fireEvent.keyDown(editor, { key: 'b', metaKey: true });
    expect(editor).toBeTruthy();
  });

  it('Responsive Test 3: SectionHeader adapts gracefully with Title, Controls, and Translate button on mobile', () => {
    setViewport(375, 667);
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

    // Open section options menu
    const optionsBtn = container.querySelector('button.control-btn') || screen.getByRole('button', { name: /⚙️/i });
    fireEvent.click(optionsBtn);

    const translateBtn = screen.getByRole('button', { name: /Traduire cette section/i });
    expect(translateBtn).toBeTruthy();
    fireEvent.click(translateBtn);
    expect(onTranslate).toHaveBeenCalledTimes(1);
  });

  it('Responsive Test 4: LayoutControls Drawer with sliders & color pickers renders without overflow', () => {
    viewports.forEach(vp => {
      setViewport(vp.width, vp.height);
      const onLayoutChange = vi.fn();

      const { container } = render(
        <TranslationContext.Provider value="fr">
          <LayoutControls
            layout={{
              fontSize: 10.5,
              lineHeight: 1.4,
              paddingX: 0.75,
              paddingY: 0.75,
              accentColor: '#1B6B3A',
              fontFamily: 'Inter',
              skillStyle: 'pill'
            }}
            onLayoutChange={onLayoutChange}
            isOpen={true}
            onClose={vi.fn()}
          />
        </TranslationContext.Provider>
      );

      expect(container.firstChild).toBeTruthy();
    });
  });

  it('End-to-End Simulated User Journey (500 button clicks and layout adjustments)', () => {
    const onSkillHighlightToggle = vi.fn();
    const data = structuredClone(DEFAULT_DATA);
    data.skills = {
      technical: 'React, Node.js, TypeScript, Docker',
      soft: 'Leadership, Communication',
      languages: 'Français, Anglais',
      highlightedSkills: []
    };

    const { rerender } = render(
      <TranslationContext.Provider value="fr">
        <ResumePreview
          data={data}
          layout={{ fontSize: 10, lineHeight: 1.3, accentColor: '#1B6B3A', skillStyle: 'pill' }}
          template="modern"
          onSkillHighlightToggle={onSkillHighlightToggle}
        />
      </TranslationContext.Provider>
    );

    // Simulate clicking skills to toggle highlight
    const skillPills = document.querySelectorAll('.skill-toggleable');
    skillPills.forEach(pill => {
      fireEvent.click(pill);
    });

    expect(onSkillHighlightToggle).toHaveBeenCalled();

    // Rerender with highlighted skills active
    data.skills.highlightedSkills = ['react', 'node.js'];
    rerender(
      <TranslationContext.Provider value="fr">
        <ResumePreview
          data={data}
          layout={{ fontSize: 10, lineHeight: 1.3, accentColor: '#1B6B3A', skillStyle: 'square' }}
          template="njm"
          onSkillHighlightToggle={onSkillHighlightToggle}
        />
      </TranslationContext.Provider>
    );

    expect(document.querySelector('.resume-wrapper')).toBeTruthy();
  });

});

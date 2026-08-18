// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LayoutControls from '../components/LayoutControls';
import { TranslationContext } from '../utils/TranslationContext';

describe('LayoutControls Component', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleLayout = {
    isCompact: false,
    fontSize: 10.5,
    paddingX: 0.75,
    paddingY: 0.75,
    lineHeight: 1.45,
    sectionSpacing: 8,
    itemSpacing: 12,
    accentColor: '#1B6B3A',
    fontFamily: 'Inter',
    splitLinks: true
  };

  const renderWithContext = (props) => {
    return render(
      <TranslationContext.Provider value="en">
        <LayoutControls {...props} />
      </TranslationContext.Provider>
    );
  };

  it('renders layout sliders, color palettes, and font selector', () => {
    const onChange = vi.fn();
    renderWithContext({ layout: sampleLayout, onChange });

    expect(screen.getByText(/Layout Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Accent Color/i)).toBeInTheDocument();
    expect(screen.getByText(/Font Family/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Font Family/i)).toHaveValue('Inter');
  });

  it('triggers accentColor update when palette swatch is clicked', () => {
    const onChange = vi.fn();
    renderWithContext({ layout: sampleLayout, onChange });

    const swatches = screen.getAllByRole('button', { name: '' });
    // Click Navy Blue (#0F3A8C)
    fireEvent.click(swatches[0]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ accentColor: '#0F3A8C' }));
  });

  it('updates font family on select change', () => {
    const onChange = vi.fn();
    renderWithContext({ layout: sampleLayout, onChange });

    const fontSelect = screen.getByLabelText(/Font Family/i);
    fireEvent.change(fontSelect, { target: { value: 'Roboto, sans-serif' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fontFamily: 'Roboto, sans-serif' }));
  });

  it('resets layout to defaults when reset button is clicked', () => {
    const onChange = vi.fn();
    renderWithContext({ layout: { ...sampleLayout, fontSize: 14, accentColor: '#800020' }, onChange });

    const resetBtn = screen.getByText(/Reset Layout/i);
    fireEvent.click(resetBtn);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      fontSize: 10.5,
      accentColor: '#1B6B3A',
      fontFamily: 'Inter'
    }));
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TagInput from '../components/ui/TagInput';

afterEach(() => {
  cleanup();
});

describe('TagInput Component (ADR 2026-08-25: Multi-Separators & Inline Editing)', () => {
  it('splits skills by commas, semicolons, and newlines into distinct chips', () => {
    const value = 'Python; TypeScript, React\nNode.js; Docker';
    render(<TagInput value={value} onChange={vi.fn()} placeholder="Add skills..." />);

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('toggles bold marker on a skill chip when clicking B button', () => {
    const onChange = vi.fn();
    render(<TagInput value="React, Node.js" onChange={onChange} />);

    const boldButtons = screen.getAllByTitle(/Mettre en gras/i);
    fireEvent.click(boldButtons[0]);

    expect(onChange).toHaveBeenCalledWith('**React**, Node.js');
  });

  it('allows inline editing of an individual skill chip', () => {
    const onChange = vi.fn();
    render(<TagInput value="HVAC (CVC), Electrical Systems" onChange={onChange} />);

    // Click on the skill label to trigger edit mode
    const skillLabel = screen.getByText('HVAC (CVC)');
    fireEvent.click(skillLabel);

    // An input field should appear inside the chip
    const editInput = screen.getByDisplayValue('HVAC (CVC)');
    expect(editInput).toBeInTheDocument();

    // Modify the text and press Enter
    fireEvent.change(editInput, { target: { value: 'HVAC & Cooling (CVC)' } });
    fireEvent.keyDown(editInput, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('HVAC & Cooling (CVC), Electrical Systems');
  });

  it('toggles raw text mode and back to chips mode', () => {
    const onChange = vi.fn();
    render(<TagInput value="React, Vite" onChange={onChange} placeholder="Skills" />);

    // Click "Mode texte brut"
    const rawModeBtn = screen.getByText(/Mode texte brut/i);
    fireEvent.click(rawModeBtn);

    // Textarea should now be visible
    const textarea = screen.getByPlaceholderText('Skills');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('React, Vite');

    // Switch back to tags mode
    const tagsModeBtn = screen.getByText(/Mode Tags/i);
    fireEvent.click(tagsModeBtn);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vite')).toBeInTheDocument();
  });

  it('removes a chip when clicking the remove button', () => {
    const onChange = vi.fn();
    render(<TagInput value="Docker, Kubernetes" onChange={onChange} />);

    const removeBtn = screen.getByLabelText(/Remove Docker/i);
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledWith('Kubernetes');
  });
});

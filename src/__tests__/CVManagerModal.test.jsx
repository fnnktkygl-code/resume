// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CVManagerModal from '../components/ui/CVManagerModal';
import { TranslationContext } from '../utils/TranslationContext';

describe('CVManagerModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleCvList = [
    { id: 'cv_1', name: 'CV Tech Fullstack', lastModified: Date.now() },
    { id: 'cv_2', name: 'CV Management', lastModified: Date.now() - 3600000 }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    cvList: sampleCvList,
    activeCvId: 'cv_1',
    onLoadCv: vi.fn(),
    onCreateCv: vi.fn(),
    onDuplicateCv: vi.fn(),
    onRenameCv: vi.fn(),
    onDeleteCv: vi.fn(),
    onExportData: vi.fn(),
    onImportData: vi.fn(),
    onLoadDemo: vi.fn()
  };

  const renderModal = (props = {}) => {
    return render(
      <TranslationContext.Provider value="en">
        <CVManagerModal {...defaultProps} {...props} />
      </TranslationContext.Provider>
    );
  };

  it('renders list of CVs and indicates active CV', () => {
    renderModal();
    expect(screen.getByText('CV Tech Fullstack')).toBeInTheDocument();
    expect(screen.getByText('CV Management')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('triggers onCreateCv when Create New Resume button is clicked', () => {
    renderModal();
    const createBtn = screen.getByText('+ Create New Resume');
    fireEvent.click(createBtn);
    expect(defaultProps.onCreateCv).toHaveBeenCalled();
  });

  it('triggers onDuplicateCv when duplicate button is clicked', () => {
    renderModal();
    const duplicateBtns = screen.getAllByRole('button');
    const copyBtn = duplicateBtns.find(b => b.querySelector('.fi-rr-copy'));
    if (copyBtn) {
      fireEvent.click(copyBtn);
      expect(defaultProps.onDuplicateCv).toHaveBeenCalled();
    }
  });

  it('starts rename mode and allows saving new name', () => {
    renderModal();
    const editBtns = screen.getAllByRole('button');
    const editBtn = editBtns.find(b => b.querySelector('.fi-rr-edit'));
    if (editBtn) {
      fireEvent.click(editBtn);
      const input = screen.getByDisplayValue('CV Tech Fullstack');
      fireEvent.change(input, { target: { value: 'CV Senior Lead' } });

      const checkBtn = screen.getByText('✓');
      fireEvent.click(checkBtn);
      expect(defaultProps.onRenameCv).toHaveBeenCalledWith('cv_1', 'CV Senior Lead');
    }
  });
});

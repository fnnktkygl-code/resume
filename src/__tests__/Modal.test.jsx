// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Modal from '../components/ui/Modal';

describe('Modal Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders modal title, body, and actions when isOpen is true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Active Modal Title"
        actions={<button>Confirm Action</button>}
      >
        <p>Modal Body Content</p>
      </Modal>
    );

    expect(screen.getByText('Active Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Body Content')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('triggers onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Escape Test">
        <p>Pressing escape should close this modal</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('triggers onClose when backdrop overlay is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Overlay Test">
        <p>Click outside to close</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });
});

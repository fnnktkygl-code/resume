import React from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';

export default function OnboardingModal({ isOpen, onClose, onSelectOption }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Welcome to ResuMe! 🚀')}
      ariaLabelledby="onboarding-modal-title"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '10px 0' }}>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          {t('How would you like to start building your recruiter-optimized, ATS-friendly resume?')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          {/* Option 1: Import */}
          <button
            onClick={() => onSelectOption('import')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            <span style={{ fontSize: '24px' }}>🪄</span>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-text)', marginBottom: '2px' }}>
                {t('Import an existing CV (PDF/Text)')}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {t('AI automatically extracts and formats your details in seconds')}
              </span>
            </div>
          </button>

          {/* Option 2: Demo */}
          <button
            onClick={() => onSelectOption('demo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            <span style={{ fontSize: '24px' }}>📄</span>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-text)', marginBottom: '2px' }}>
                {t('Load a pre-filled demo template')}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {t('Start with a complete profile to see how it works')}
              </span>
            </div>
          </button>

          {/* Option 3: Scratch */}
          <button
            onClick={() => onSelectOption('scratch')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            <span style={{ fontSize: '24px' }}>✏️</span>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-text)', marginBottom: '2px' }}>
                {t('Start from scratch')}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {t('Build it field-by-field manually')}
              </span>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}

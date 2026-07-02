import React from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';

export default function ReorderSectionsModal({ isOpen, onClose, sectionOrder, customSections, onReorder }) {
  const { t, language } = useTranslation();

  if (!isOpen) return null;

  const moveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...sectionOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    onReorder(newOrder);
  };

  const moveDown = (index) => {
    if (index === sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    onReorder(newOrder);
  };

  const getSectionLabel = (id) => {
    if (id === 'contact') return t('Contact Information');
    if (id === 'summary') return t('Summary');
    if (id === 'experience') return t('Experience');
    if (id === 'education') return t('Education');
    if (id === 'skills') return t('Skills');
    if (id === 'projects') return t('Projects');
    if (id === 'certifications') return t('Certifications');
    if (id.startsWith('custom_')) {
      const sec = customSections?.find(s => s.id === id);
      return sec?.label || 'Custom';
    }
    if (id.startsWith('spacer_')) {
      if (id.includes('_sidebar_')) return `${t('Spacer')} (Sidebar)`;
      if (id.includes('_main_')) return `${t('Spacer')} (Main)`;
      return t('Spacer');
    }
    return id;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Reorder Sections')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {t('Change the display order of sections on your resume. (Note: some templates may have fixed positions for certain sections).')}
        </p>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px',
          backgroundColor: 'var(--color-surface-alt)',
          maxHeight: '50vh',
          overflowY: 'auto'
        }}>
          {sectionOrder.map((sectionId, index) => (
            <div 
              key={sectionId} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ fontWeight: 500, fontSize: '14px' }}>
                {getSectionLabel(sectionId)}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  type="button"
                  className="control-btn" 
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  style={{ padding: '6px', opacity: index === 0 ? 0.3 : 1, cursor: index === 0 ? 'default' : 'pointer' }}
                >
                  <i className="fi fi-rr-arrow-up"></i>
                </button>
                <button 
                  type="button"
                  className="control-btn" 
                  onClick={() => moveDown(index)}
                  disabled={index === sectionOrder.length - 1}
                  style={{ padding: '6px', opacity: index === sectionOrder.length - 1 ? 0.3 : 1, cursor: index === sectionOrder.length - 1 ? 'default' : 'pointer' }}
                >
                  <i className="fi fi-rr-arrow-down"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          type="button"
          className="btn-primary" 
          onClick={onClose}
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          {t('Done')}
        </button>
      </div>
    </Modal>
  );
}

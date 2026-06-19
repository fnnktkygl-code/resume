import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';

export default function CVManagerModal({ isOpen, onClose, cvList, activeCvId, onLoadCv, onCreateCv, onDuplicateCv, onRenameCv, onDeleteCv, onExportData, onImportData }) {
  const { t, language } = useTranslation();
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  const handleStartRename = (cv) => {
    setEditingId(cv.id);
    setNewName(cv.name);
  };

  const handleSaveRename = (id) => {
    if (newName.trim()) {
      onRenameCv(id, newName.trim());
      setEditingId(null);
    }
  };

  const dateLocale = language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('My Resumes 📂')}
      ariaLabelledby="cv-manager-modal-title"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {t('Manage different versions of your resumes to target different jobs.')}
        </p>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px', 
          maxHeight: '300px', 
          overflowY: 'auto',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px',
          backgroundColor: 'var(--color-surface-alt)'
        }}>
          {cvList.map(cv => {
            const isActive = cv.id === activeCvId;
            const dateStr = new Date(cv.lastModified).toLocaleDateString(dateLocale, {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={cv.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface)',
                  border: isActive ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <div style={{ flex: 1, marginRight: '12px' }}>
                  {editingId === cv.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          fontSize: '13px',
                          border: '1px solid var(--color-accent)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)'
                        }}
                        autoFocus
                      />
                      <button 
                        type="button"
                        className="btn-primary" 
                        onClick={() => handleSaveRename(cv.id)}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span 
                        onClick={() => { if (!isActive) onLoadCv(cv.id); }}
                        style={{ 
                          fontWeight: isActive ? '700' : '500', 
                          fontSize: '14px', 
                          cursor: 'pointer',
                          color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {cv.name} {isActive && <span style={{ fontSize: '10px', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '2px 6px', borderRadius: '4px' }}>{t('Active')}</span>}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>
                        {t('Modified')} {dateStr}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {!isActive && editingId !== cv.id && (
                    <button 
                      type="button"
                      className="control-btn" 
                      onClick={() => onLoadCv(cv.id)}
                      title={t('Open')}
                      style={{ padding: '6px' }}
                    >
                      <i className="fi fi-rr-folder-open"></i>
                    </button>
                  )}
                  {editingId !== cv.id && (
                    <>
                      <button 
                        type="button"
                        className="control-btn" 
                        onClick={() => handleStartRename(cv)}
                        title={t('Rename')}
                        style={{ padding: '6px' }}
                      >
                        <i className="fi fi-rr-edit"></i>
                      </button>
                      <button 
                        type="button"
                        className="control-btn" 
                        onClick={() => onDuplicateCv(cv.id)}
                        title={t('Duplicate')}
                        style={{ padding: '6px' }}
                      >
                        <i className="fi fi-rr-copy"></i>
                      </button>
                      {cvList.length > 1 && (
                        <button 
                          type="button"
                          className="control-btn" 
                          onClick={() => { if (confirm(t('Permanently delete this CV?'))) onDeleteCv(cv.id); }}
                          title={t('Delete')}
                          style={{ padding: '6px', color: 'var(--color-danger)' }}
                        >
                          <i className="fi fi-rr-trash"></i>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          type="button"
          className="btn-primary" 
          onClick={onCreateCv}
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          + {t('Create New Resume')}
        </button>

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button 
            type="button"
            className="btn-secondary" 
            onClick={onExportData}
            style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}
          >
            💾 {t('Export Backup')}
          </button>
          <button 
            type="button"
            className="btn-secondary" 
            onClick={() => fileInputRef.current?.click()}
            style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}
          >
            📥 {t('Import Backup')}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".json" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const importedData = JSON.parse(event.target.result);
                  onImportData(importedData);
                } catch (err) {
                  alert(t('Invalid backup file.'));
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }} 
          />
        </div>
      </div>
    </Modal>
  );
}

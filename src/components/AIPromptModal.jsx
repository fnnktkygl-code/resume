import { useState, useEffect } from 'react';
import { useTranslation } from '../utils/TranslationContext';
import Modal from './ui/Modal';
import { translateWithProxy } from '../services/geminiService';
import VisualDiff from './ui/VisualDiff';

export default function AIPromptModal({ isOpen, onClose, data, language, onTranslationSuccess }) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState('');
  const [translatedData, setTranslatedData] = useState(null);

  useEffect(() => {
    if (isOpen && data) {
      setIsGenerating(true);
      setError('');
      translateWithProxy(data, language)
        .then(result => {
          setTranslatedData(result);
          setIsGenerating(false);
        })
        .catch(err => {
          setError(err.message || t('An error occurred during translation.'));
          setIsGenerating(false);
        });
    }
  }, [isOpen, data, language, t]);

  const handleApply = () => {
    if (onTranslationSuccess && translatedData) {
      onTranslationSuccess(translatedData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`✨ ${t('AI Translation Assistant')}`}
      actions={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={isGenerating}>{t('Cancel')}</button>
          <button className="btn-primary" onClick={handleApply} disabled={isGenerating || !translatedData}>
            {t('Apply Translation')}
          </button>
        </>
      }
    >
      {isGenerating ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <svg style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.93m14.142 14.142l-1.414-1.414" />
          </svg>
          <p style={{ marginTop: '16px', fontWeight: '500' }}>{t('Translating...')}</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ color: 'var(--color-danger)', padding: '20px 0', textAlign: 'center' }}>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            padding: '16px', 
            backgroundColor: 'rgba(var(--success-rgb, 16, 185, 129), 0.1)', 
            border: '1px solid rgba(var(--success-rgb, 16, 185, 129), 0.2)',
            borderRadius: '6px',
            color: 'var(--color-text)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {t('Translation Complete')}
            </h4>
            <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
              {t('AI has successfully translated your resume. Please verify the differences below before applying:')}
            </p>
          </div>
          <VisualDiff original={data} modified={translatedData} />
        </div>
      )}
    </Modal>
  );
}

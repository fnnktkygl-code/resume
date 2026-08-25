import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../utils/TranslationContext';
import Modal from './ui/Modal';
import { translateWithProxy } from '../services/geminiService';
import VisualDiff from './ui/VisualDiff';
import { mergeSelected } from '../utils/mergeSelected';
import { TRANSLATION_LANGUAGES } from '../utils/languageSwitcher';

export default function AIPromptModal({ isOpen, onClose, data, language, onTranslationSuccess }) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [translatedData, setTranslatedData] = useState(null);
  const [targetLang, setTargetLang] = useState('');
  const selectedRef = useRef(new Set());

  const languageOptions = TRANSLATION_LANGUAGES;

  useEffect(() => {
    if (isOpen) {
      // Default target language = the "other" language
      setTargetLang(language === 'fr' ? 'en' : language === 'es' ? 'en' : 'fr');
      setTranslatedData(null);
      setError('');
      setIsGenerating(false);
      selectedRef.current = new Set();
    }
  }, [isOpen, language]);

  const handleTranslate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const raw = await translateWithProxy(data, targetLang);
      const result = raw?.translatedResume || raw;
      setTranslatedData(result);
    } catch (err) {
      setError(err.message || t('An error occurred during translation.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectionChange = useCallback((ids) => {
    selectedRef.current = ids;
  }, []);

  const handleApply = () => {
    if (translatedData) {
      const merged = mergeSelected(data, translatedData, selectedRef.current);
      if (onTranslationSuccess) {
        onTranslationSuccess(merged);
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="680px"
      title={`✨ ${t('AI Translation Assistant')}`}
      actions={
        translatedData ? (
          <>
            <button className="btn-secondary" onClick={() => setTranslatedData(null)}>
              {t('Cancel')}
            </button>
            <button className="btn-primary" onClick={handleApply}>
              {t('Apply Selected Changes')}
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={onClose} disabled={isGenerating}>{t('Cancel')}</button>
            <button className="btn-primary" onClick={handleTranslate} disabled={isGenerating}>
              {isGenerating ? t('Translating...') : t('Translate')}
            </button>
          </>
        )
      }
    >
      {isGenerating ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <svg style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.93m14.142 14.142l-1.414-1.414" />
          </svg>
          <p style={{ marginTop: '16px', fontWeight: '500' }}>{t('Translating entire resume with ATS precision...')}</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ color: 'var(--color-danger)', padding: '20px 0', textAlign: 'center' }}>
          <p>{error}</p>
          <button className="btn-secondary" onClick={handleTranslate} style={{ marginTop: '8px' }}>
            {t('Retry')}
          </button>
        </div>
      ) : translatedData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            padding: '14px 16px', 
            backgroundColor: 'rgba(var(--success-rgb, 16, 185, 129), 0.1)', 
            border: '1px solid rgba(var(--success-rgb, 16, 185, 129), 0.25)',
            borderRadius: '8px',
            color: 'var(--color-text)'
          }}>
            <h4 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: '700' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {t('Translation Complete')}
            </h4>
            <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.4', color: 'var(--color-text-secondary)' }}>
              {t('Select the changes you want to apply:')}
            </p>
          </div>
          <VisualDiff original={data} modified={translatedData} onSelectionChange={handleSelectionChange} />
        </div>
      ) : (
        /* Language selector */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            {t('Choose the target language and click Translate. The AI will translate all text content in your resume while preserving the structure and formatting.')}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--color-surface-alt)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
              🌎 {t('Target Language')} :
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '13.5px',
                fontWeight: '550',
                outline: 'none'
              }}
            >
              {languageOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </Modal>
  );
}

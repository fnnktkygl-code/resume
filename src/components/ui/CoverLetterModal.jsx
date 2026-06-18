import React, { useState } from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';
import { generateCoverLetterWithProxy } from '../../services/geminiService';

export default function CoverLetterModal({ isOpen, onClose, data }) {
  const { t, language } = useTranslation();
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    setError(null);
    setCoverLetter(null);

    try {
      const result = await generateCoverLetterWithProxy(data, jobDescription, language);
      setCoverLetter(result);
    } catch (err) {
      setError(err.message || t('An error occurred during generation.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Cover Letter Generator')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {t('Paste the job description below to generate a tailored cover letter based on your resume.')}
        </p>

        <textarea
          className="resume-input"
          style={{ minHeight: '120px', resize: 'vertical' }}
          placeholder={t('Paste job description here...')}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        {error && (
          <div style={{ padding: '12px', backgroundColor: 'var(--color-danger-light, #ffe6e6)', color: 'var(--color-danger, #d32f2f)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button 
          type="button"
          className="btn-primary" 
          onClick={handleGenerate}
          disabled={!jobDescription.trim() || isGenerating}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: (!jobDescription.trim() || isGenerating) ? 0.7 : 1 }}
        >
          {isGenerating ? (
            <><i className="fi fi-rr-spinner" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i> {t('Generating...')}</>
          ) : (
            <><i className="fi fi-rr-magic-wand" style={{ marginRight: '8px' }}></i> {t('Generate Cover Letter')}</>
          )}
        </button>

        {coverLetter && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('Your Cover Letter')}</h3>
              <button
                type="button"
                onClick={copyToClipboard}
                title={t('Copy to clipboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                <i className="fi fi-rr-copy"></i> {t('Copy')}
              </button>
            </div>
            
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'var(--color-surface-alt)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--color-border)',
              whiteSpace: 'pre-wrap',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              maxHeight: '300px',
              overflowY: 'auto',
              fontFamily: 'var(--font-family, sans-serif)'
            }}>
              {coverLetter}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

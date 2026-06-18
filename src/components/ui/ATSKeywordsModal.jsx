import React, { useState } from 'react';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';
import { matchKeywordsWithProxy } from '../../services/geminiService';

export default function ATSKeywordsModal({ isOpen, onClose, data }) {
  const { t, language } = useTranslation();
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await matchKeywordsWithProxy(data, jobDescription, language);
      setResult(analysis);
    } catch (err) {
      setError(err.message || t('An error occurred during analysis.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreColor = result?.matchScore >= 80 ? 'var(--color-success, #28a745)' : 
                     result?.matchScore >= 50 ? 'var(--color-warning, #ffc107)' : 
                     'var(--color-danger, #dc3545)';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('ATS Keyword Matcher')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {t('Paste the job description below to see how well your resume matches it.')}
        </p>

        <textarea
          className="resume-input"
          style={{ minHeight: '150px', resize: 'vertical' }}
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
          onClick={handleAnalyze}
          disabled={!jobDescription.trim() || isAnalyzing}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: (!jobDescription.trim() || isAnalyzing) ? 0.7 : 1 }}
        >
          {isAnalyzing ? (
            <><i className="fi fi-rr-spinner" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i> {t('Analyzing...')}</>
          ) : (
            <><i className="fi fi-rr-search-alt" style={{ marginRight: '8px' }}></i> {t('Analyze Match')}</>
          )}
        </button>

        {result && (
          <div style={{ marginTop: '8px', padding: '16px', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('Match Score')}</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: scoreColor }}>
                {result.matchScore}%
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', margin: '0 0 16px 0', fontWeight: '500' }}>
              {result.recommendation}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.missingKeywords && result.missingKeywords.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-danger, #d32f2f)' }}>{t('Missing Keywords')}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.missingKeywords.map((kw, i) => (
                      <span key={i} style={{ padding: '4px 8px', backgroundColor: 'var(--color-danger-light, #ffe6e6)', color: 'var(--color-danger, #d32f2f)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.foundKeywords && result.foundKeywords.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-success, #2e7d32)' }}>{t('Matched Keywords')}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.foundKeywords.map((kw, i) => (
                      <span key={i} style={{ padding: '4px 8px', backgroundColor: 'var(--color-success-light, #e8f5e9)', color: 'var(--color-success, #2e7d32)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
